const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const dotenv = require('dotenv');
const { MercadoPagoConfig, Preference, Payment, WebhookSignatureValidator, InvalidWebhookSignatureError } = require('mercadopago');

const envPath = path.resolve(__dirname, '.env');
const envLoadResult = dotenv.config({ path: envPath });

const app = express();
app.set('etag', false);
const port = Number(process.env.PORT || 3001);
const clientUrl = (process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
const backendPublicUrl = (process.env.BACKEND_PUBLIC_URL || `http://localhost:${port}`).replace(/\/$/, '');
const webhookBaseUrl = backendPublicUrl;
const appUrl = (process.env.APP_URL || clientUrl).replace(/\/$/, '');
const validBillingPeriods = new Set(['daily', 'weekly', 'monthly', 'yearly']);
const isDevelopment = process.env.NODE_ENV !== 'production';
const enterpriseMonthlyPrice = Number(process.env.ENTERPRISE_MONTHLY_PRICE);
const hasEnterprisePrice = Number.isInteger(enterpriseMonthlyPrice) && enterpriseMonthlyPrice > 0;

const planCatalog = {
  free: {
    id: 'free',
    name: 'Gratis',
    displayName: 'Free',
    price: 0,
    currency: 'COP',
    description: 'Plan gratuito para empezar con PrintShop.',
    billingPeriods: {
      daily: 0,
      weekly: 0,
      monthly: 0,
      yearly: 0,
    },
    requiresCheckout: false,
  },
  basic: {
    id: 'basic',
    name: 'Básico',
    displayName: 'Basic',
    price: 49900,
    currency: 'COP',
    description: 'Plan Básico para tiendas pequeñas y operaciones iniciales.',
    billingPeriods: {
      daily: 1663,
      weekly: 12475,
      monthly: 49900,
      yearly: 598800,
    },
    requiresCheckout: true,
  },
  professional: {
    id: 'professional',
    name: 'Profesional',
    displayName: 'Professional',
    price: 119900,
    currency: 'COP',
    description: 'Plan Profesional para escalar operaciones y crecimiento.',
    billingPeriods: {
      daily: 3997,
      weekly: 29975,
      monthly: 119900,
      yearly: 1438800,
    },
    requiresCheckout: true,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    displayName: 'Enterprise',
    price: null,
    currency: 'COP',
    description: 'Plan Enterprise requiere configuración de precio personalizada.',
    billingPeriods: {
      daily: hasEnterprisePrice ? Math.round(enterpriseMonthlyPrice / 30) : null,
      weekly: hasEnterprisePrice ? Math.round(enterpriseMonthlyPrice / 4) : null,
      monthly: hasEnterprisePrice ? enterpriseMonthlyPrice : null,
      yearly: hasEnterprisePrice ? enterpriseMonthlyPrice * 12 : null,
    },
    requiresCheckout: hasEnterprisePrice,
    customPricing: !hasEnterprisePrice,
  },
};

const processedWebhookIds = new Set();
const subscriptionStore = new Map();
const subscriptionsFilePath = path.resolve(__dirname, '.subscriptions.json');
const diditSessions = new Map();
const diditIdentities = new Map();
const processedDiditEventIds = new Set();
const diditFilePath = path.resolve(__dirname, '.didit.json');

function loadDiditStateFromDisk() {
  try {
    if (!fs.existsSync(diditFilePath)) return;
    const state = JSON.parse(fs.readFileSync(diditFilePath, 'utf8'));
    for (const session of Array.isArray(state.sessions) ? state.sessions : []) {
      if (session?.sessionId) diditSessions.set(session.sessionId, session);
    }
    for (const identity of Array.isArray(state.identities) ? state.identities : []) {
      if (identity?.userId) diditIdentities.set(identity.userId, identity);
    }
    for (const eventId of Array.isArray(state.processedEventIds) ? state.processedEventIds : []) {
      if (typeof eventId === 'string') processedDiditEventIds.add(eventId);
    }
  } catch (error) {
    console.warn('[DIDIT] Could not load local verification state:', error.message);
  }
}

function persistDiditState() {
  try {
    fs.writeFileSync(
      diditFilePath,
      JSON.stringify({
        sessions: Array.from(diditSessions.values()),
        identities: Array.from(diditIdentities.values()),
        processedEventIds: Array.from(processedDiditEventIds),
      }, null, 2),
      'utf8',
    );
  } catch (error) {
    console.warn('[DIDIT] Could not persist local verification state:', error.message);
  }
}

function loadSubscriptionsFromDisk() {
  try {
    if (fs.existsSync(subscriptionsFilePath)) {
      const data = fs.readFileSync(subscriptionsFilePath, 'utf8');
      const items = JSON.parse(data);
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item && item.externalReference) {
            subscriptionStore.set(item.externalReference, item);
            if (item.id) {
              subscriptionStore.set(item.id, item);
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('[SUBSCRIPTION PERSISTENCE] Could not load subscriptions:', err.message);
  }
}

function persistSubscriptionsToDisk() {
  try {
    const uniqueRecords = new Map();
    for (const record of subscriptionStore.values()) {
      if (record && record.externalReference) {
        uniqueRecords.set(record.externalReference, record);
      }
    }
    fs.writeFileSync(subscriptionsFilePath, JSON.stringify(Array.from(uniqueRecords.values()), null, 2), 'utf8');
  } catch (err) {
    console.warn('[SUBSCRIPTION PERSISTENCE] Could not persist subscriptions:', err.message);
  }
}

loadSubscriptionsFromDisk();
loadDiditStateFromDisk();

function normalizeUserId(userId) {
  return String(userId || 'anonymous-user').trim();
}

function getPlanDefinition(planId) {
  const plan = planCatalog[planId];
  if (!plan) {
    const error = new Error('PLAN_NOT_FOUND');
    error.statusCode = 404;
    throw error;
  }

  return plan;
}

function validateBillingPeriod(billingPeriod) {
  const period = String(billingPeriod || 'monthly').toLowerCase();

  if (!validBillingPeriods.has(period)) {
    const error = new Error('INVALID_BILLING_PERIOD');
    error.statusCode = 400;
    throw error;
  }

  return period;
}

function getPlanPrice(planId, billingPeriod) {
  const plan = getPlanDefinition(planId);
  const normalizedPeriod = validateBillingPeriod(billingPeriod);

  if (plan.customPricing) {
    const error = new Error('ENTERPRISE_PRICE_NOT_CONFIGURED');
    error.statusCode = 422;
    throw error;
  }

  const price = plan.billingPeriods[normalizedPeriod];
  if (typeof price !== 'number' || Number.isNaN(price)) {
    const error = new Error('INVALID_BILLING_PERIOD');
    error.statusCode = 400;
    throw error;
  }

  return {
    amount: Number(price),
    currency: plan.currency,
    description: `${plan.name} (${normalizedPeriod})`,
  };
}

function getMercadoPagoAccessToken() {
  const accessToken = String(process.env.MERCADOPAGO_ACCESS_TOKEN || '').trim();

  if (!accessToken) {
    return null;
  }

  if (!/^(TEST|APP_USR)-[A-Za-z0-9-]+$/.test(accessToken)) {
    const error = new Error('MERCADOPAGO_ACCESS_TOKEN_INVALID_FORMAT');
    error.statusCode = 503;
    throw error;
  }

  return accessToken;
}

function getMercadoPagoErrorDetails(error) {
  const cause = Array.isArray(error?.cause)
    ? error.cause.map((item) => item?.description || item?.message || item?.code || String(item)).join('; ')
    : error?.cause?.description || error?.cause?.message || error?.cause || undefined;

  return {
    status: error?.status || error?.statusCode || error?.response?.status || null,
    type: error?.error || error?.type || error?.response?.data?.error || null,
    message: error?.message || error?.response?.data?.message || 'Unknown Mercado Pago error',
    cause: cause || null,
    statusDetail: error?.status_detail || error?.response?.data?.status_detail || null,
    code: error?.code || error?.response?.data?.code || null,
    requestId: error?.requestId || error?.request_id || error?.response?.headers?.['x-request-id'] || null,
  };
}

function logMercadoPagoError(context, error) {
  const details = getMercadoPagoErrorDetails(error);
  console.error('[MP DEBUG] Mercado Pago error', { context, ...details });
  return details;
}

function maskEmail(email) {
  if (typeof email !== 'string' || !email.includes('@')) {
    return email ? '[invalid-email]' : 'missing';
  }

  const [localPart, domain] = email.split('@');
  return `${localPart.slice(0, 1)}***@${domain}`;
}

function logCheckoutContext({ planId, billingPeriod, userId, userEmail, payerEmail, externalReference }) {
  console.log('[MP DEBUG] Creating preference', {
    planId,
    billingPeriod,
    userIdentifier: userId,
    userId,
    userEmail: maskEmail(userEmail),
    payerExists: Boolean(payerEmail),
    payerEmail: payerEmail ? maskEmail(payerEmail) : null,
    externalReference,
  });
}

function preferenceDebugSnapshot(preference) {
  const item = preference?.items?.[0] || {};
  return {
    id: preference?.id || null,
    status: preference?.status || null,
    collectorId: preference?.collector_id || null,
    applicationId: preference?.client_id || preference?.application_id || null,
    siteId: preference?.site_id || null,
    externalReference: preference?.external_reference || null,
    item: {
      id: item.id || null,
      quantity: item.quantity || null,
      amount: item.unit_price || null,
      currency: item.currency_id || null,
    },
    payerExists: Boolean(preference?.payer?.email),
    payerEmail: preference?.payer?.email ? maskEmail(preference.payer.email) : null,
    notificationUrl: preference?.notification_url || null,
    backUrls: preference?.back_urls || null,
    autoReturn: preference?.auto_return || null,
    statementDescriptor: preference?.statement_descriptor || null,
    sandboxInitPoint: Boolean(preference?.sandbox_init_point),
    initPoint: Boolean(preference?.init_point),
    marketplace: preference?.marketplace || null,
    marketplaceFee: preference?.marketplace_fee || null,
  };
}

function logPaymentDiagnostics(payment, externalReference) {
  console.log('Mercado Pago payment diagnostic:', {
    id: payment?.id || null,
    status: payment?.status || null,
    status_detail: payment?.status_detail || null,
    payment_type_id: payment?.payment_type_id || null,
    external_reference: externalReference || payment?.external_reference || null,
    payer: payment?.payer
      ? {
          id: payment.payer.id || null,
          email: maskEmail(payment.payer.email),
          identificationType: payment.payer.identification?.type || null,
        }
      : null,
    transaction_amount: payment?.transaction_amount || null,
    currency_id: payment?.currency_id || null,
  });
}

function buildMercadoPagoErrorResponse(details) {
  const safeMessage = isDevelopment
    ? `Mercado Pago rechazó la solicitud: ${details.message}${details.cause ? ` (${details.cause})` : ''}`
    : 'No fue posible crear el checkout de Mercado Pago.';

  return {
    ok: false,
    message: safeMessage,
    error: details.type || 'MERCADOPAGO_REQUEST_FAILED',
    ...(isDevelopment ? { details: { status: details.status, type: details.type, cause: details.cause } } : {}),
  };
}

function createSubscriptionRecord({ userId, planId, billingPeriod, status, paymentStatus, externalReference, paymentId, amount, currency }) {
  const finalExternalReference = externalReference || `${planId}-${Date.now()}`;
  const subscriptionId = `sub-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  const record = {
    id: subscriptionId,
    userId: normalizeUserId(userId),
    planId,
    billingPeriod,
    status: status || 'PENDING',
    paymentStatus: paymentStatus || 'PENDING',
    externalReference: finalExternalReference,
    paymentId: paymentId || null,
    amount: amount || 0,
    currency: currency || 'COP',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  subscriptionStore.set(record.externalReference, record);
  subscriptionStore.set(record.id, record);
  persistSubscriptionsToDisk();
  return record;
}

function buildCheckoutReturnUrl(status, externalReference) {
  const query = new URLSearchParams({ external_reference: externalReference });
  return `${clientUrl}/payments/${status}?${query.toString()}`;
}

function getSubscriptionForUser(externalReference, userId) {
  const byRef = subscriptionStore.get(externalReference);
  if (byRef && (!userId || byRef.userId === normalizeUserId(userId))) {
    return byRef;
  }
  return Array.from(subscriptionStore.values()).find(
    (subscription) =>
      subscription.externalReference === externalReference &&
      (!userId || subscription.userId === normalizeUserId(userId)),
  );
}

function applyPaymentToSubscription(subscription, payment) {
  if (!subscription) return { matched: false, activated: false, reason: 'external_reference_not_found' };

  const amountMatches = Number(subscription.amount) === Number(payment?.transaction_amount);
  const currencyMatches = String(subscription.currency).toUpperCase() === String(payment?.currency_id || '').toUpperCase();
  if (!amountMatches || !currencyMatches) {
    return { matched: true, activated: false, reason: !amountMatches ? 'amount_mismatch' : 'currency_mismatch' };
  }

  const paymentStatus = String(payment?.status || 'pending').toUpperCase();
  if (payment?.id) {
    subscription.paymentId = String(payment.id);
  }
  subscription.paymentTypeId = payment?.payment_type_id || null;
  subscription.statusDetail = payment?.status_detail || null;
  subscription.amount = Number(payment?.transaction_amount);
  subscription.currency = payment?.currency_id || subscription.currency;

  subscription.paymentStatus =
    paymentStatus === 'APPROVED' ? 'CONFIRMED' :
    paymentStatus === 'PENDING' ? 'PENDING' :
    paymentStatus === 'CANCELLED' ? 'CANCELLED' : 'FAILED';
  subscription.status =
    paymentStatus === 'APPROVED' ? 'ACTIVE' :
    paymentStatus === 'CANCELLED' ? 'CANCELLED' :
    paymentStatus === 'REJECTED' ? 'REJECTED' : subscription.status;
  subscription.updatedAt = new Date().toISOString();
  persistSubscriptionsToDisk();

  if (paymentStatus === 'APPROVED') {
    console.log('[MP FLOW] SUBSCRIPTION_ACTIVATED', {
      userId: subscription.userId,
      planId: subscription.planId,
      billingPeriod: subscription.billingPeriod,
      paymentId: subscription.paymentId,
      externalReference: subscription.externalReference,
      status: subscription.status,
      paymentStatus: subscription.paymentStatus,
    });
  }

  return { matched: true, activated: paymentStatus === 'APPROVED', reason: 'payment_status_applied' };
}

function getDiditConfiguration() {
  const apiKey = String(process.env.DIDIT_API_KEY || '').trim();
  const workflowId = String(process.env.DIDIT_WORKFLOW_ID || '').trim();
  const webhookSecret = String(process.env.DIDIT_WEBHOOK_SECRET || '').trim();

  return { apiKey, workflowId, webhookSecret };
}

function base64UrlToBuffer(value) {
  const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='), 'base64');
}

function getAuthenticatedUser(req) {
  const secret = String(process.env.PRINTSHOP_AUTH_JWT_SECRET || '').trim();
  if (!secret) {
    const error = new Error('AUTH_BACKEND_NOT_CONFIGURED');
    error.statusCode = 503;
    throw error;
  }

  const authorization = String(req.get('authorization') || '');
  const match = authorization.match(/^Bearer\s+([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/);
  if (!match) {
    const error = new Error('UNAUTHENTICATED');
    error.statusCode = 401;
    throw error;
  }

  const token = match[1];
  const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
  let header;
  let payload;
  try {
    header = JSON.parse(base64UrlToBuffer(encodedHeader).toString('utf8'));
    payload = JSON.parse(base64UrlToBuffer(encodedPayload).toString('utf8'));
  } catch {
    const error = new Error('INVALID_AUTH_TOKEN');
    error.statusCode = 401;
    throw error;
  }

  if (header?.alg !== 'HS256' || typeof payload?.sub !== 'string' || !payload.sub.trim()) {
    const error = new Error('INVALID_AUTH_TOKEN');
    error.statusCode = 401;
    throw error;
  }

  const expected = crypto.createHmac('sha256', secret).update(`${encodedHeader}.${encodedPayload}`).digest();
  const received = base64UrlToBuffer(encodedSignature);
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
    const error = new Error('INVALID_AUTH_TOKEN');
    error.statusCode = 401;
    throw error;
  }

  const now = Math.floor(Date.now() / 1000);
  if (!Number.isInteger(payload.exp) || payload.exp <= now) {
    const error = new Error('EXPIRED_AUTH_TOKEN');
    error.statusCode = 401;
    throw error;
  }

  const expectedIssuer = String(process.env.PRINTSHOP_AUTH_JWT_ISSUER || '').trim();
  if (expectedIssuer && payload.iss !== expectedIssuer) {
    const error = new Error('INVALID_AUTH_TOKEN');
    error.statusCode = 401;
    throw error;
  }

  return { id: payload.sub.trim() };
}

function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
}

function verifyDiditWebhookSignature({ rawBody, signature, timestamp, secret }) {
  if (!secret || !signature || !timestamp || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const timestampNumber = Number(timestamp);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isInteger(timestampNumber) || Math.abs(now - timestampNumber) > 300) return false;

  let payload;
  try {
    payload = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return false;
  }

  const expected = crypto.createHmac('sha256', secret).update(canonicalJson(payload), 'utf8').digest();
  const received = Buffer.from(signature, 'hex');
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

function mapDiditStatus(status) {
  switch (String(status || '').trim().toLowerCase()) {
    case 'approved': return 'APPROVED';
    case 'declined': return 'REJECTED';
    case 'in review': return 'IN_REVIEW';
    default: return 'PENDING';
  }
}

function featureStatus(decision, name) {
  const values = Array.isArray(decision?.[name]) ? decision[name] : [];
  return values.length ? String(values[values.length - 1]?.status || '') || null : null;
}

function diditErrorResponse(error) {
  if (error?.name === 'AbortError') return { status: 504, message: 'El servicio de verificación tardó demasiado en responder.' };
  if (error?.message === 'DIDIT_NOT_CONFIGURED') return { status: 503, message: 'La verificación de identidad aún no está configurada.' };
  if (error?.statusCode === 401) return { status: 401, message: 'Tu sesión no es válida. Inicia sesión de nuevo.' };
  if (error?.statusCode === 503) return { status: 503, message: 'El acceso seguro al servicio de identidad aún no está configurado.' };
  return { status: 502, message: 'No fue posible iniciar la verificación. Inténtalo nuevamente.' };
}

app.use(
  cors({
    origin: [clientUrl, 'http://localhost:5173'],
    credentials: true,
  }),
);

app.use(express.json({
  verify: (req, _res, buffer) => {
    if (req.path === '/api/didit/webhook') req.rawBody = Buffer.from(buffer);
  },
}));

app.get('/api/health', (req, res) => {
  let accessTokenStatus = 'missing';
  try {
    accessTokenStatus = getMercadoPagoAccessToken() ? 'configured' : 'missing';
  } catch {
    accessTokenStatus = 'invalid';
  }

  res.json({
    ok: true,
    status: accessTokenStatus === 'configured' ? 'sandbox-ready' : `mercadopago-${accessTokenStatus}`,
    configuration: {
      envFile: envPath,
      envFileLoaded: !envLoadResult.error,
      accessToken: accessTokenStatus,
      publicKey: process.env.MERCADOPAGO_PUBLIC_KEY ? 'configured' : 'missing',
      webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET ? 'configured' : 'missing',
    },
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/didit/session', async (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    const { apiKey, workflowId } = getDiditConfiguration();
    if (!apiKey || !workflowId) throw new Error('DIDIT_NOT_CONFIGURED');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let response;
    try {
      response = await fetch('https://verification.didit.me/v3/session/', {
        method: 'POST',
        headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          workflow_id: workflowId,
          vendor_data: user.id,
          callback: `${appUrl}/onboarding/identity`,
          callback_method: 'both',
          language: 'es',
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    const diditSession = await response.json().catch(() => null);
    if (!response.ok || !diditSession?.session_id || !diditSession?.url) {
      console.warn('[DIDIT] Session creation failed', { status: response.status });
      return res.status(response.status >= 400 && response.status < 500 ? 422 : 502).json({
        message: 'No fue posible iniciar la verificación. Revisa la configuración e inténtalo nuevamente.',
      });
    }

    const now = new Date().toISOString();
    const existing = diditSessions.get(diditSession.session_id);
    const internalStatus = mapDiditStatus(diditSession.status);
    diditSessions.set(diditSession.session_id, {
      sessionId: diditSession.session_id,
      userId: user.id,
      workflowId: diditSession.workflow_id,
      vendorData: user.id,
      status: diditSession.status,
      identityStatus: internalStatus,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      completedAt: ['APPROVED', 'REJECTED'].includes(internalStatus) ? now : null,
    });
    if (!diditIdentities.has(user.id)) {
      diditIdentities.set(user.id, { userId: user.id, status: internalStatus, lastSessionId: diditSession.session_id, updatedAt: now });
    }
    persistDiditState();

    return res.status(200).json({ verificationUrl: diditSession.url, status: internalStatus });
  } catch (error) {
    const result = diditErrorResponse(error);
    return res.status(result.status).json({ message: result.message });
  }
});

app.get('/api/didit/status', (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    const identity = diditIdentities.get(user.id);
    return res.set('Cache-Control', 'no-store').json({ status: identity?.status || 'PENDING' });
  } catch (error) {
    const result = diditErrorResponse(error);
    return res.status(result.status).json({ message: result.message });
  }
});

app.post('/api/didit/webhook', (req, res) => {
  const { webhookSecret } = getDiditConfiguration();
  const rawBody = req.rawBody;
  const signature = req.get('X-Signature-V2');
  const timestamp = req.get('X-Timestamp');
  if (!rawBody || !verifyDiditWebhookSignature({ rawBody, signature, timestamp, secret: webhookSecret })) {
    return res.status(401).json({ message: 'Webhook no verificable.' });
  }

  const event = req.body;
  if (!event?.event_id || !event?.webhook_type) return res.status(400).json({ message: 'Evento inválido.' });
  if (processedDiditEventIds.has(event.event_id)) return res.status(200).json({ received: true, duplicate: true });

  if (!['status.updated', 'data.updated'].includes(event.webhook_type)) {
    processedDiditEventIds.add(event.event_id);
    persistDiditState();
    return res.status(200).json({ received: true });
  }

  const session = diditSessions.get(event.session_id);
  if (!session || session.vendorData !== event.vendor_data || session.workflowId !== event.workflow_id) {
    console.warn('[DIDIT] Rejected unmatched signed event', { eventType: event.webhook_type });
    return res.status(409).json({ message: 'Sesión desconocida.' });
  }

  const identityStatus = mapDiditStatus(event.status);
  const now = new Date().toISOString();
  const decision = event.decision || {};
  session.status = event.status;
  session.identityStatus = identityStatus;
  session.updatedAt = now;
  session.completedAt = ['APPROVED', 'REJECTED'].includes(identityStatus) ? now : null;
  session.featureStatuses = {
    idVerification: featureStatus(decision, 'id_verifications'),
    liveness: featureStatus(decision, 'liveness_checks'),
    faceMatch: featureStatus(decision, 'face_matches'),
  };
  diditSessions.set(session.sessionId, session);
  diditIdentities.set(session.userId, {
    userId: session.userId,
    status: identityStatus,
    lastSessionId: session.sessionId,
    updatedAt: now,
    approvedAt: identityStatus === 'APPROVED' ? now : null,
  });
  processedDiditEventIds.add(event.event_id);
  persistDiditState();
  console.info('[DIDIT] Verified webhook processed', { eventType: event.webhook_type, status: identityStatus });
  return res.status(200).json({ received: true });
});

app.post('/api/subscriptions/free', async (req, res) => {
  try {
    const { planId, billingPeriod, userId, userEmail } = req.body || {};
    const plan = getPlanDefinition(planId || 'free');

    if (plan.id !== 'free') {
      return res.status(400).json({ message: 'Este endpoint solo acepta el plan Free.' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'Debes iniciar sesión para activar un plan.' });
    }

    const normalizedPeriod = validateBillingPeriod(billingPeriod || 'monthly');
    const subscription = createSubscriptionRecord({
      userId,
      planId: plan.id,
      billingPeriod: normalizedPeriod,
      status: 'ACTIVE',
      paymentStatus: 'CONFIRMED',
      amount: 0,
      currency: 'COP',
      externalReference: `free-${normalizeUserId(userId)}-${Date.now()}`,
    });

    const redirectUrl = '/onboarding';
    return res.status(200).json({
      ok: true,
      redirectUrl,
      subscription,
      message: 'Plan gratuito activado correctamente.',
    });
  } catch (error) {
    const message = error.message === 'PLAN_NOT_FOUND' ? 'El plan Free no está disponible.' : 'No fue posible activar el plan gratuito.';
    return res.status(error.statusCode || 400).json({
      ok: false,
      message,
    });
  }
});

app.get('/api/subscriptions/status', (req, res) => {
  res.removeHeader('ETag');
  delete req.headers['if-none-match'];
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
  });
  const externalReference = String(req.query.externalReference || req.query.external_reference || '').trim();
  const userId = String(req.query.userId || '').trim();

  if (!externalReference) {
    return res.status(400).json({ ok: false, message: 'Falta externalReference para consultar la suscripción.' });
  }

  const subscription = getSubscriptionForUser(externalReference, userId);
  if (!subscription) {
    return res.status(404).json({ ok: false, message: 'No se encontró la suscripción solicitada.' });
  }

  return res.status(200).json({
    ok: true,
    subscriptionStatus: subscription.status,
    paymentStatus: subscription.paymentStatus,
    planId: subscription.planId,
    billingPeriod: subscription.billingPeriod,
    externalReference: subscription.externalReference,
    paymentId: subscription.paymentId || null,
    subscription: {
      status: subscription.status,
      subscriptionStatus: subscription.status,
      paymentStatus: subscription.paymentStatus,
      planId: subscription.planId,
      billingPeriod: subscription.billingPeriod,
      externalReference: subscription.externalReference,
      paymentId: subscription.paymentId || null,
      updatedAt: subscription.updatedAt,
    },
  });
});

app.post('/api/payments/checkout', async (req, res) => {
  return createCheckout(req, res);
});

app.post('/api/subscriptions/checkout', async (req, res) => {
  return createCheckout(req, res);
});

async function createCheckout(req, res) {
  try {
    const { planId, billingPeriod, userId, userEmail } = req.body || {};
    const userIdentifier = normalizeUserId(userId);

    if (!userIdentifier || userIdentifier === 'anonymous-user') {
      return res.status(401).json({ message: 'Debes iniciar sesión para continuar con el pago.' });
    }

    const normalizedPlanId = String(planId || '').toLowerCase();
    const normalizedPeriod = validateBillingPeriod(billingPeriod || 'monthly');

    if (normalizedPlanId === 'free') {
      return res.status(200).json({
        ok: true,
        freePlan: true,
        redirectUrl: '/onboarding',
        subscription: createSubscriptionRecord({
          userId: userIdentifier,
          planId: 'free',
          billingPeriod: normalizedPeriod,
          status: 'ACTIVE',
          paymentStatus: 'CONFIRMED',
          amount: 0,
          currency: 'COP',
          externalReference: `free-${userIdentifier}-${Date.now()}`,
        }),
      });
    }

    const plan = getPlanDefinition(normalizedPlanId);
    if (plan.customPricing) {
      return res.status(422).json({
        ok: false,
        message: 'El plan Enterprise requiere un precio personalizado configurado en el backend antes de iniciar el checkout.',
      });
    }

    let accessToken;
    try {
      accessToken = getMercadoPagoAccessToken();
    } catch (error) {
      const details = logMercadoPagoError('configuration', error);
      return res.status(503).json({
        ok: false,
        message: 'MERCADOPAGO_ACCESS_TOKEN tiene un formato inválido. Usa el Access Token de prueba del backend en server/.env.',
        error: 'MERCADOPAGO_ACCESS_TOKEN_INVALID_FORMAT',
        ...(isDevelopment ? { details } : {}),
      });
    }

    if (!accessToken) {
      return res.status(503).json({
        ok: false,
        message: 'Mercado Pago aún no está configurado en el backend. Coloca MERCADOPAGO_ACCESS_TOKEN en server/.env para completar el checkout real.',
      });
    }

    const pricing = getPlanPrice(normalizedPlanId, normalizedPeriod);
    const client = new MercadoPagoConfig({
      accessToken,
      options: {
        timeout: 5000,
      },
    });

    const preference = new Preference(client);
    const requestId = `printshop-${normalizedPlanId}-${Date.now()}`;
    const externalReference = `${normalizedPlanId}-${userIdentifier}-${requestId}`;
    const payerEmail = typeof userEmail === 'string' && userEmail.trim() ? userEmail.trim() : null;

    const subscriptionRecord = createSubscriptionRecord({
      userId: userIdentifier,
      planId: plan.id,
      billingPeriod: normalizedPeriod,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      externalReference,
      amount: Number(pricing.amount),
      currency: pricing.currency,
    });

    console.log('[MP FLOW] SUBSCRIPTION_CREATED', {
      externalReference: subscriptionRecord.externalReference,
      userId: subscriptionRecord.userId,
      planId: subscriptionRecord.planId,
      billingPeriod: subscriptionRecord.billingPeriod,
      paymentStatus: subscriptionRecord.paymentStatus,
      subscriptionStatus: subscriptionRecord.status,
    });

    logCheckoutContext({
      planId: plan.id,
      billingPeriod: normalizedPeriod,
      userId: userIdentifier,
      userEmail,
      payerEmail,
      externalReference,
    });

    const preferenceBody = {
        items: [
          {
            id: plan.id,
            title: plan.name,
            description: pricing.description,
            quantity: 1,
            unit_price: Number(pricing.amount),
            currency_id: pricing.currency,
          },
        ],
        ...(payerEmail ? { payer: { email: payerEmail } } : {}),
        metadata: {
          userId: userIdentifier,
          planId: plan.id,
          billingPeriod: normalizedPeriod,
          source: 'printshop-onboarding',
        },
        external_reference: externalReference,
        notification_url: `${webhookBaseUrl}/api/webhooks/mercadopago`,
        back_urls: {
          success: buildCheckoutReturnUrl('success', externalReference),
          failure: buildCheckoutReturnUrl('failure', externalReference),
          pending: buildCheckoutReturnUrl('pending', externalReference),
        },
        auto_return: 'approved',
        statement_descriptor: 'PRINTSHOP',
    };

    console.log('[MP DEBUG] Preference request details', {
      planId: plan.id,
      billingPeriod: normalizedPeriod,
      amount: Number(pricing.amount),
      currency: pricing.currency,
      externalReference,
      userIdentifier,
      payerExists: Boolean(payerEmail),
      payerEmail: payerEmail ? maskEmail(payerEmail) : null,
      notificationUrl: preferenceBody.notification_url,
      backUrls: preferenceBody.back_urls,
      autoReturn: preferenceBody.auto_return,
      statementDescriptor: preferenceBody.statement_descriptor,
    });

    const response = await preference.create({ body: preferenceBody });

    const checkoutUrl =
      response?.sandbox_init_point ||
      response?.init_point ||
      response?.response?.init_point ||
      response?.response?.sandbox_init_point;

    if (!checkoutUrl) {
      return res.status(502).json({
        ok: false,
        message: 'Mercado Pago no devolvió una URL de checkout válida.',
      });
    }

    console.log('[MP FLOW] PREFERENCE_CREATED', preferenceDebugSnapshot(response));
    console.log('[MP FLOW] CHECKOUT_URL_CREATED', {
      preferenceId: response?.id || response?.response?.id || null,
      externalReference,
      checkoutUrlCreated: Boolean(checkoutUrl),
      usingSandboxInitPoint: Boolean(response?.sandbox_init_point),
    });

    const preferenceId = response?.id || response?.response?.id;
    if (preferenceId) {
      try {
        const verifiedPreference = await preference.get({ preferenceId });
        console.log('[MP DEBUG] Preference verified after creation', preferenceDebugSnapshot(verifiedPreference));
      } catch (verificationError) {
        console.warn('[MP DEBUG] Preference verification unavailable', {
          preferenceId,
          ...getMercadoPagoErrorDetails(verificationError),
        });
      }
    }

    return res.status(200).json({
      ok: true,
      checkoutUrl,
      externalReference,
      planId: plan.id,
      billingPeriod: normalizedPeriod,
      message: 'Checkout de Mercado Pago preparado correctamente.',
    });
  } catch (error) {
    if (!['PLAN_NOT_FOUND', 'INVALID_BILLING_PERIOD', 'ENTERPRISE_PRICE_NOT_CONFIGURED'].includes(error.message)) {
      const details = logMercadoPagoError('checkout', error);
      return res.status(error.statusCode || details.status || 502).json(buildMercadoPagoErrorResponse(details));
    }

    const message =
      error.message === 'PLAN_NOT_FOUND'
        ? 'El plan seleccionado no existe.'
        : error.message === 'INVALID_BILLING_PERIOD'
          ? 'La periodicidad del plan no es válida.'
          : error.message === 'ENTERPRISE_PRICE_NOT_CONFIGURED'
            ? 'El plan Enterprise requiere un precio configurado en el backend antes de poder abrir el checkout.'
            : 'No fue posible crear el checkout de Mercado Pago.';

    return res.status(error.statusCode || 400).json({
      ok: false,
      message,
    });
  }
}


function normalizeWebhookValue(value) {
  if (Array.isArray(value)) return String(value[0] || '').trim().toLowerCase();
  return String(value || '').trim().toLowerCase();
}

function classifyWebhookType(event = {}, query = {}) {
  const explicitType = normalizeWebhookValue(event.type || query.type);
  const topic = normalizeWebhookValue(query.topic || event.topic);
  const actionPrefix = normalizeWebhookValue(event.action).split('.')[0];

  if (explicitType === 'payment' || topic === 'payment' || actionPrefix === 'payment') return 'payment';
  if (explicitType === 'merchant_order' || topic === 'merchant_order' || actionPrefix === 'merchant_order') return 'merchant_order';
  return 'unknown';
}

function extractWebhookPaymentId(event = {}, query = {}, webhookType = 'unknown') {
  if (webhookType !== 'payment') return null;
  const dataId = query['data.id'] || event?.data?.id;
  if (dataId) return String(Array.isArray(dataId) ? dataId[0] : dataId).trim();
  if (query.id) {
    return String(Array.isArray(query.id) ? query.id[0] : query.id).trim();
  }
  if (event.id) {
    return String(event.id).trim();
  }
  return null;
}

function classifyPaymentDiagnostic({ paymentId, paymentStatus, webhookValid, subscriptionActivated, reason }) {
  if (!paymentId) {
    return 'NO_PAYMENT_ENTITY';
  }
  if (paymentStatus && ['REJECTED', 'CANCELLED'].includes(String(paymentStatus).toUpperCase())) {
    return 'PAYMENT_REJECTED';
  }
  if (paymentStatus && String(paymentStatus).toUpperCase() === 'APPROVED' && !webhookValid) {
    return 'APPROVED_PAYMENT_WEBHOOK_FAILURE';
  }
  if (webhookValid && paymentStatus && String(paymentStatus).toUpperCase() === 'APPROVED' && !subscriptionActivated) {
    return 'SUBSCRIPTION_ACTIVATION_FAILURE';
  }
  if (webhookValid && paymentStatus && String(paymentStatus).toUpperCase() === 'APPROVED' && subscriptionActivated) {
    return 'SUCCESSFUL_FLOW';
  }
  return 'IN_PROGRESS';
}

function validateWebhookSignature({ signature, requestId, dataId, secret, eventIdForDiagnostic }) {
  if (!requestId) return { valid: false, reason: 'missing-request-id', sdkValid: false, manualMatches: false };
  if (!signature) return { valid: false, reason: 'missing-signature', sdkValid: false, manualMatches: false };
  if (!secret) return { valid: false, reason: 'missing-webhook-secret', sdkValid: false, manualMatches: false };

  // Parse x-signature
  const parts = String(signature).split(',');
  let ts = null;
  let receivedHash = null;
  for (const part of parts) {
    const [k, ...rest] = part.split('=');
    const key = String(k || '').trim().toLowerCase();
    const val = rest.join('=').trim();
    if (key === 'ts') ts = val;
    if (key === 'v1') receivedHash = val;
  }

  if (!ts || !receivedHash) {
    return { valid: false, reason: !ts ? 'MissingTimestamp' : 'MissingHash', sdkValid: false, manualMatches: false };
  }

  // 1. Try SDK validator as reference
  let sdkValid = false;
  let sdkReason = null;
  try {
    WebhookSignatureValidator.validate({
      xSignature: signature,
      xRequestId: requestId,
      dataId: dataId || undefined,
      secret,
    });
    sdkValid = true;
  } catch (err) {
    sdkReason = err?.reason || err?.message || 'SDKError';
  }

  // 2. Official manual manifest according to Mercado Pago spec:
  // Strictly: if data.id is present, use data.id. Never use event.id.
  let officialManifest;
  if (dataId) {
    officialManifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  } else {
    officialManifest = `request-id:${requestId};ts:${ts};`;
  }

  const computedHash = crypto.createHmac('sha256', secret).update(officialManifest).digest('hex');
  const expectedBuf = Buffer.from(computedHash, 'utf8');
  const receivedBuf = Buffer.from(receivedHash, 'utf8');

  const manualMatches =
    expectedBuf.length === receivedBuf.length &&
    crypto.timingSafeEqual(expectedBuf, receivedBuf);

  // Safe diagnostic log without exposing secret or full tokens
  console.log('[MP WEBHOOK SIGNATURE AUDIT]', {
    ts,
    requestId,
    dataId: dataId || null,
    diagnosticEventId: eventIdForDiagnostic || null,
    manifest: officialManifest,
    receivedV1Truncated: receivedHash ? `${receivedHash.slice(0, 8)}...${receivedHash.slice(-8)}` : null,
    computedHmacTruncated: computedHash ? `${computedHash.slice(0, 8)}...${computedHash.slice(-8)}` : null,
    SDK_VALIDATION: sdkValid,
    MANUAL_VALIDATION: manualMatches,
    sdkReason,
  });

  // Si SDK y manual difieren, registrar diagnóstico y no aceptar automáticamente
  if (sdkValid !== manualMatches) {
    console.warn('[MP WEBHOOK SIGNATURE WARNING] SDK and Manual validation mismatch', {
      SDK_VALIDATION: sdkValid,
      MANUAL_VALIDATION: manualMatches,
      sdkReason,
    });
    return {
      valid: false,
      reason: 'SignatureValidatorDiscrepancy',
      ts,
      manifest: officialManifest,
      sdkValid,
      manualMatches,
    };
  }

  if (sdkValid && manualMatches) {
    return { valid: true, reason: null, ts, manifest: officialManifest, sdkValid, manualMatches };
  }

  return { valid: false, reason: 'SignatureMismatch', ts, manifest: officialManifest, sdkValid, manualMatches };
}

app.post('/api/webhooks/mercadopago', async (req, res) => {
  try {
    // PASO 1: Recibir evento y cabeceras
    const event = req.body || {};
    const signatureHeader = req.headers['x-signature'];
    const requestIdHeader = req.headers['x-request-id'];
    const requestId = Array.isArray(requestIdHeader) ? requestIdHeader[0] : requestIdHeader;

    const eventType = classifyWebhookType(event, req.query);
    const paymentId = extractWebhookPaymentId(event, req.query, eventType);

    // Diagnostic logging without exposing secrets
    console.log('[MP WEBHOOK DEBUG]', {
      timestamp: new Date().toISOString(),
      eventType,
      action: event?.action || null,
      eventIdLogged: event?.id || null, // event.id logged for diagnostics only!
      dataId: paymentId,
      requestIdPresent: Boolean(requestId),
      signaturePresent: Boolean(signatureHeader),
    });

    // PASO 2: Validar firma x-signature
    const webhookSecret = String(process.env.MERCADOPAGO_WEBHOOK_SECRET || '').trim();
    if (!webhookSecret) {
      console.error('[MP WEBHOOK DEBUG] Signature validation unavailable', { reason: 'missing-webhook-secret' });
      return res.status(503).json({ ok: false, message: 'La validación segura del webhook no está configurada.' });
    }

    const queryDataId = req.query?.['data.id'] || (eventType === 'payment' && event?.data?.id ? event.data.id : undefined);
    const validationDataId = queryDataId ? String(Array.isArray(queryDataId) ? queryDataId[0] : queryDataId).trim() : undefined;

    const signatureValidation = validateWebhookSignature({
      signature: signatureHeader,
      requestId,
      dataId: validationDataId,
      secret: webhookSecret,
      eventIdForDiagnostic: event?.id || null,
    });

    if (!signatureValidation.valid) {
      console.warn('[MP WEBHOOK DEBUG] Signature validation failed', {
        requestId: requestId || undefined,
        reason: signatureValidation.reason,
        SDK_VALIDATION: signatureValidation.sdkValid,
        MANUAL_VALIDATION: signatureValidation.manualMatches,
      });

      if (paymentId) {
        console.log('[MP DIAGNOSTIC] PAYMENT_DIAGNOSTIC = APPROVED_PAYMENT_WEBHOOK_FAILURE', {
          paymentId,
          requestId,
          reason: signatureValidation.reason,
        });
      }

      const statusCode = signatureValidation.reason === 'missing-webhook-secret' ? 503 : 401;
      return res.status(statusCode).json({ ok: false, message: 'Webhook inválido o no verificable.' });
    }
    console.log('[MP WEBHOOK DEBUG] Signature validation passed', { requestId, validated: true });

    // PASO 3: Verificar que es payment
    if (eventType === 'merchant_order') {
      const orderEventId = `merchant_order-${req.query?.id || event?.id || requestId || Date.now()}`;
      processedWebhookIds.add(orderEventId);
      console.log('[MP WEBHOOK DEBUG] merchant_order acknowledged', { orderEventId, requestIdPresent: Boolean(requestId) });
      return res.status(200).json({ ok: true, received: true, eventId: orderEventId, note: 'merchant_order reconocido; no se consulta Payment API.' });
    }

    if (eventType !== 'payment') {
      const otherEventId = `${eventType}-${event?.id || requestId || Date.now()}`;
      processedWebhookIds.add(otherEventId);
      return res.status(200).json({ ok: true, received: true, eventId: otherEventId, note: 'Evento de Mercado Pago ignorado por tipo no reconocido.' });
    }

    // PASO 4: Obtener payment_id
    if (!paymentId) {
      console.log('[MP DIAGNOSTIC] PAYMENT_DIAGNOSTIC = NO_PAYMENT_ENTITY', { requestId });
      return res.status(200).json({ ok: true, received: true, note: 'Payment sin identificador; no se consulta Payment API.' });
    }

    const eventId = `payment-${paymentId}`;

    // Idempotencia: si la suscripción ya está ACTIVE para este paymentId, no duplicar activación
    const existingSubscription = Array.from(subscriptionStore.values()).find(
      (sub) => sub.paymentId === String(paymentId) && sub.status === 'ACTIVE'
    );
    if (existingSubscription && processedWebhookIds.has(eventId)) {
      console.log('[MP WEBHOOK DEBUG] Duplicate event already active', { eventId, requestId });
      return res.status(200).json({
        ok: true,
        duplicate: true,
        eventId,
        requestId,
        status: 'ACTIVE',
        activationCount: existingSubscription.activationCount || 1,
      });
    }

    // PASO 5: Consultar Payment API
    let accessToken;
    try {
      accessToken = getMercadoPagoAccessToken();
    } catch (error) {
      logMercadoPagoError('configuration', error);
      return res.status(503).json({ ok: false, message: 'La configuración de Mercado Pago no es válida.' });
    }

    if (!accessToken) {
      return res.status(200).json({ ok: true, skipped: true, eventId, reason: 'Mercado Pago not configured' });
    }

    const client = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 5000 },
    });

    const payment = await new Payment(client).get({ id: Number(paymentId) });
    const paymentStatus = String(payment?.status || 'pending').toUpperCase();
    const externalReference = payment?.external_reference || payment?.metadata?.external_reference || null;

    console.log('[MP FLOW] PAYMENT_RECEIVED', { paymentId: payment?.id || paymentId, externalReference });
    console.log('[MP FLOW] PAYMENT_STATUS', {
      paymentId: payment?.id || paymentId,
      status: payment?.status || null,
      statusDetail: payment?.status_detail || null,
      paymentTypeId: payment?.payment_type_id || null,
      transactionAmount: payment?.transaction_amount || null,
      currencyId: payment?.currency_id || null,
      collectorId: payment?.collector_id || null,
      payer: payment?.payer ? { id: payment.payer.id || null, email: maskEmail(payment.payer.email) } : null,
      externalReference,
    });
    logPaymentDiagnostics(payment, externalReference);

    // PASO 6 & 7: Verificar external_reference y vincular a la suscripción
    if (!externalReference) {
      return res.status(200).json({ ok: true, received: true, eventId, requestId, note: 'Pago validado sin externalReference.' });
    }

    const subscriptionMatch = subscriptionStore.get(externalReference) || Array.from(subscriptionStore.values()).find(
      (subscription) => subscription.externalReference === externalReference
    );

    console.log('[MP FLOW] SUBSCRIPTION_LOOKUP', {
      externalReference,
      found: Boolean(subscriptionMatch),
      lookupKey: 'externalReference',
    });

    if (subscriptionMatch) {
      console.log('[MP FLOW] SUBSCRIPTION_FOUND', {
        externalReference,
        planId: subscriptionMatch.planId,
        billingPeriod: subscriptionMatch.billingPeriod,
        currentStatus: subscriptionMatch.status,
      });
    } else {
      console.log('[MP FLOW] SUBSCRIPTION_NOT_FOUND', {
        externalReference,
        lookupKey: 'externalReference',
      });
      console.warn('[MP WEBHOOK DEBUG] Subscription not found for externalReference', { externalReference, paymentId });
      console.log('[MP DIAGNOSTIC] PAYMENT_DIAGNOSTIC = SUBSCRIPTION_ACTIVATION_FAILURE', {
        paymentId,
        reason: 'external_reference_not_found',
      });
      return res.status(200).json({ ok: true, received: true, eventId, note: 'No se encontró suscripción local para este externalReference.' });
    }

    // PASO 7 & 8: Actualizar subscription
    const paymentApplication = applyPaymentToSubscription(subscriptionMatch, payment);

    if (paymentApplication.reason === 'amount_mismatch' || paymentApplication.reason === 'currency_mismatch') {
      console.warn('[MP WEBHOOK DEBUG] Payment mismatch', { eventId, reason: paymentApplication.reason });
      console.log('[MP DIAGNOSTIC] PAYMENT_DIAGNOSTIC = SUBSCRIPTION_ACTIVATION_FAILURE', {
        paymentId,
        reason: paymentApplication.reason,
      });
      return res.status(200).json({ ok: true, received: true, eventId, note: `Pago no aplicado por ${paymentApplication.reason}` });
    }

    // PASO 8: SOLO si paymentStatus === 'APPROVED' se marca definitivamente como procesado
    if (paymentStatus === 'APPROVED') {
      subscriptionMatch.activationCount = (subscriptionMatch.activationCount || 0) + 1;
      processedWebhookIds.add(eventId);
      console.log('[MP DIAGNOSTIC] PAYMENT_DIAGNOSTIC = SUCCESSFUL_FLOW', {
        paymentId,
        externalReference,
        activationCount: subscriptionMatch.activationCount,
      });

      return res.status(200).json({
        ok: true,
        received: true,
        eventId,
        requestId,
        paymentStatus,
        subscriptionStatus: 'ACTIVE',
        externalReference,
        activationCount: subscriptionMatch.activationCount,
        note: 'Pago aprobado y suscripción activada correctamente.',
      });
    }

    // Si paymentStatus === 'PENDING': NO activar suscripción y NO marcar en processedWebhookIds
    // para permitir que un webhook posterior con approved actualice la suscripción.
    if (paymentStatus === 'PENDING') {
      console.log('[MP DIAGNOSTIC] PAYMENT_DIAGNOSTIC = PAYMENT_PENDING', {
        paymentId,
        externalReference,
        statusDetail: payment?.status_detail,
      });
      return res.status(200).json({
        ok: true,
        received: true,
        eventId,
        requestId,
        paymentStatus,
        subscriptionStatus: 'PENDING',
        externalReference,
        note: 'Pago en estado pendiente; suscripción no activada todavía.',
      });
    }

    // Si fue cancelado o rechazado:
    processedWebhookIds.add(eventId);
    console.log('[MP DIAGNOSTIC] PAYMENT_DIAGNOSTIC = PAYMENT_REJECTED', {
      paymentId,
      externalReference,
      status: paymentStatus,
      statusDetail: payment?.status_detail,
    });
    return res.status(200).json({
      ok: true,
      received: true,
      eventId,
      requestId,
      paymentStatus,
      subscriptionStatus: subscriptionMatch.status,
      externalReference,
      note: `Pago finalizado con estado ${paymentStatus}.`,
    });
  } catch (error) {
    const details = logMercadoPagoError('webhook', error);
    return res.status(details.status || 502).json({
      ok: false,
      message: isDevelopment ? `No fue posible procesar el webhook: ${details.message}` : 'No fue posible procesar el webhook.',
      error: 'WEBHOOK_PROCESSING_ERROR',
    });
  }
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`PrintShop API ready on http://localhost:${port}`);
  console.log('Mercado Pago configuration:', {
    envFile: envPath,
    envFileLoaded: !envLoadResult.error,
    ACCESS_TOKEN: (() => {
      try {
        return getMercadoPagoAccessToken() ? 'configured' : 'missing';
      } catch {
        return 'invalid';
      }
    })(),
    PUBLIC_KEY: process.env.MERCADOPAGO_PUBLIC_KEY ? 'configured' : 'missing',
    WEBHOOK_SECRET: process.env.MERCADOPAGO_WEBHOOK_SECRET ? 'configured' : 'missing',
  });
  });
}

module.exports = {
  classifyPaymentDiagnostic,
  app,
  planCatalog,
  getPlanDefinition,
  validateBillingPeriod,
  getPlanPrice,
  classifyWebhookType,
  extractWebhookPaymentId,
  validateWebhookSignature,
  applyPaymentToSubscription,
  createSubscriptionRecord,
  processedWebhookIds,
  subscriptionStore,
  canonicalJson,
  verifyDiditWebhookSignature,
  mapDiditStatus,
  diditSessions,
  diditIdentities,
  processedDiditEventIds,
};

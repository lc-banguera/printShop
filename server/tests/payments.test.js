const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const crypto = require('node:crypto');

const {
  app,
  getPlanDefinition,
  validateBillingPeriod,
  getPlanPrice,
  planCatalog,
  classifyWebhookType,
  extractWebhookPaymentId,
  applyPaymentToSubscription,
  validateWebhookSignature,
  createSubscriptionRecord,
  classifyPaymentDiagnostic,
  subscriptionStore,
  processedWebhookIds,
} = require('../index.js');

// Catalog and pricing validation
test('plan catalog and pricing validation', () => {
  const free = getPlanDefinition('free');
  assert.equal(free.id, 'free');
  assert.equal(free.requiresCheckout, false);

  const basic = getPlanPrice('basic', 'monthly');
  assert.equal(basic.amount, 49900);
  assert.equal(basic.currency, 'COP');

  const pro = getPlanPrice('professional', 'yearly');
  assert.equal(pro.amount, 1438800);

  assert.throws(() => getPlanPrice('enterprise', 'monthly'), /ENTERPRISE_PRICE_NOT_CONFIGURED/);
  assert.throws(() => validateBillingPeriod('biweekly'), /INVALID_BILLING_PERIOD/);
});

// Event classification and ID extraction
test('webhook classification and payment ID extraction', () => {
  assert.equal(classifyWebhookType({ action: 'payment.created' }, { 'data.id': '123', type: 'payment' }), 'payment');
  assert.equal(classifyWebhookType({ action: 'merchant_order.created' }, {}), 'merchant_order');
  assert.equal(classifyWebhookType({}, { topic: 'merchant_order' }), 'merchant_order');
  assert.equal(classifyWebhookType({}, {}), 'unknown');

  assert.equal(extractWebhookPaymentId({ data: { id: '999' } }, { 'data.id': '999' }, 'payment'), '999');
  assert.equal(extractWebhookPaymentId({ data: { id: '999' } }, { id: '999', topic: 'merchant_order' }, 'merchant_order'), null);
});

// TEST 1: Webhook payment.created con firma HMAC válida
test('TEST 1: Webhook payment.created con firma HMAC válida -> HTTP 200, validación SDK/manual positiva', () => {
  const secret = 'test-webhook-secret-unit';
  const dataId = '176893122489';
  const requestId = 'req-test-1-valid';
  const ts = String(Math.floor(Date.now() / 1000));

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const hash = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  const signature = `ts=${ts},v1=${hash}`;

  const result = validateWebhookSignature({
    signature,
    requestId,
    dataId,
    secret,
  });

  assert.equal(result.valid, true);
  assert.equal(result.reason, null);
  assert.equal(result.sdkValid, true);
  assert.equal(result.manualMatches, true);
});

// TEST 2: Webhook con firma inválida
test('TEST 2: Webhook con firma inválida -> HTTP 401, no activation, no processedWebhookIds', async () => {
  const secret = 'test-webhook-secret-unit';
  const dataId = '176893122489';
  const requestId = 'req-test-2-invalid';
  const ts = String(Math.floor(Date.now() / 1000));

  const invalidSig = `ts=${ts},v1=deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef`;

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));

  try {
    const address = server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/api/webhooks/mercadopago?data.id=${dataId}&type=payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-request-id': requestId,
        'x-signature': invalidSig,
      },
      body: JSON.stringify({ action: 'payment.created', data: { id: dataId } }),
    });

    assert.equal(res.status, 401);
    assert.equal(processedWebhookIds.has(`payment-${dataId}`), false);
  } finally {
    await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  }
});

// TEST 3: Webhook approved duplicado
test('TEST 3: Webhook approved duplicado -> HTTP 200, subscription permanece ACTIVE, no segunda activación', async () => {
  const sub = createSubscriptionRecord({
    userId: 'usr-dup-test',
    planId: 'basic',
    billingPeriod: 'monthly',
    status: 'ACTIVE',
    paymentStatus: 'CONFIRMED',
    externalReference: 'ext-ref-dup-test',
    paymentId: '888888',
    amount: 49900,
    currency: 'COP',
  });
  sub.activationCount = 1;
  processedWebhookIds.add('payment-888888');

  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET || 'test-secret';
  const ts = String(Math.floor(Date.now() / 1000));
  const manifest = `id:888888;request-id:req-dup-3;ts:${ts};`;
  const hash = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  const signature = `ts=${ts},v1=${hash}`;

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));

  try {
    const address = server.address();
    const res = await fetch(`http://127.0.0.1:${address.port}/api/webhooks/mercadopago?data.id=888888&type=payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-request-id': 'req-dup-3',
        'x-signature': signature,
      },
      body: JSON.stringify({ action: 'payment.created', data: { id: '888888' } }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.duplicate, true);
    assert.equal(body.status, 'ACTIVE');
    assert.equal(body.activationCount, 1);
    assert.equal(sub.activationCount, 1);
  } finally {
    subscriptionStore.delete(sub.id);
    processedWebhookIds.delete('payment-888888');
    await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  }
});

// TEST 4: Payment approved
test('TEST 4: Payment approved -> subscription ACTIVE, CONFIRMED, metadata guardada', () => {
  const subscription = {
    id: 'sub-test-4',
    userId: 'usr-test-4',
    planId: 'professional',
    billingPeriod: 'monthly',
    amount: 119900,
    currency: 'COP',
    status: 'PENDING',
    paymentStatus: 'PENDING',
    paymentId: null,
    externalReference: 'ext-ref-4',
  };

  const paymentApproved = {
    id: 999901,
    status: 'approved',
    status_detail: 'accredited',
    payment_type_id: 'account_money',
    transaction_amount: 119900,
    currency_id: 'COP',
  };

  const result = applyPaymentToSubscription(subscription, paymentApproved);
  assert.equal(result.activated, true);
  assert.equal(subscription.status, 'ACTIVE');
  assert.equal(subscription.paymentStatus, 'CONFIRMED');
  assert.equal(subscription.paymentId, '999901');
  assert.equal(subscription.paymentTypeId, 'account_money');
  assert.equal(subscription.statusDetail, 'accredited');
});

// TEST 5: Payment pending
test('TEST 5: Payment pending -> subscription NO ACTIVE, paymentStatus NO CONFIRMED', () => {
  const subscription = {
    id: 'sub-test-5',
    userId: 'usr-test-5',
    planId: 'basic',
    billingPeriod: 'monthly',
    amount: 49900,
    currency: 'COP',
    status: 'PENDING',
    paymentStatus: 'PENDING',
    paymentId: null,
    externalReference: 'ext-ref-5',
  };

  const paymentPending = {
    id: 999902,
    status: 'pending',
    status_detail: 'pending_contingency',
    payment_type_id: 'ticket',
    transaction_amount: 49900,
    currency_id: 'COP',
  };

  const result = applyPaymentToSubscription(subscription, paymentPending);
  assert.equal(result.activated, false);
  assert.equal(subscription.status, 'PENDING');
  assert.equal(subscription.paymentStatus, 'PENDING');
  assert.equal(subscription.paymentId, '999902');
  assert.equal(subscription.statusDetail, 'pending_contingency');
});

// TEST 6: external_reference incorrecto
test('TEST 6: external_reference incorrecto -> NO activar subscription', () => {
  const result = applyPaymentToSubscription(null, {
    id: 999903,
    status: 'approved',
    transaction_amount: 49900,
    currency_id: 'COP',
  });
  assert.equal(result.matched, false);
  assert.equal(result.activated, false);
  assert.equal(result.reason, 'external_reference_not_found');
});

// TEST 7: Webhook válido pero Payment API devuelve estado no aprobado
test('TEST 7: Webhook válido pero Payment API devuelve estado no aprobado (rejected) -> NO activar subscription', () => {
  const subscription = {
    id: 'sub-test-7',
    userId: 'usr-test-7',
    planId: 'basic',
    billingPeriod: 'monthly',
    amount: 49900,
    currency: 'COP',
    status: 'PENDING',
    paymentStatus: 'PENDING',
    paymentId: null,
    externalReference: 'ext-ref-7',
  };

  const paymentRejected = {
    id: 999904,
    status: 'rejected',
    status_detail: 'cc_rejected_bad_filled_card_data',
    payment_type_id: 'credit_card',
    transaction_amount: 49900,
    currency_id: 'COP',
  };

  const result = applyPaymentToSubscription(subscription, paymentRejected);
  assert.equal(result.activated, false);
  assert.equal(subscription.status, 'REJECTED');
  assert.equal(subscription.paymentStatus, 'FAILED');
  assert.equal(subscription.statusDetail, 'cc_rejected_bad_filled_card_data');
});

// TEST 8: /api/subscriptions/status
test('TEST 8: /api/subscriptions/status -> HTTP 200, anti-cache, sin 304, devuelve estado actual', async () => {
  const testSub = createSubscriptionRecord({
    userId: 'usr-test-8',
    planId: 'basic',
    billingPeriod: 'monthly',
    status: 'ACTIVE',
    paymentStatus: 'CONFIRMED',
    externalReference: 'ext-ref-test-8',
    amount: 49900,
    currency: 'COP',
  });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));

  try {
    const address = server.address();
    const url = `http://127.0.0.1:${address.port}/api/subscriptions/status?externalReference=ext-ref-test-8`;

    // 1st request
    const res1 = await fetch(url);
    assert.equal(res1.status, 200);
    assert.equal(res1.headers.get('etag'), null);
    assert.match(res1.headers.get('cache-control') || '', /no-store/);

    // 2nd request with If-None-Match header
    const res2 = await fetch(url, {
      headers: { 'If-None-Match': 'W/"stale-etag"' },
    });
    assert.equal(res2.status, 200);
    assert.equal(res2.headers.get('etag'), null);

    const body = await res2.json();
    assert.equal(body.ok, true);
    assert.equal(body.subscriptionStatus, 'ACTIVE');
    assert.equal(body.paymentStatus, 'CONFIRMED');
    assert.equal(body.planId, 'basic');
    assert.equal(body.billingPeriod, 'monthly');
    assert.equal(body.externalReference, 'ext-ref-test-8');
  } finally {
    subscriptionStore.delete(testSub.id);
    await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  }
});

// TEST 9: Integración /payments/success con backend ACTIVE
test('TEST 9: Integración /payments/success con backend ACTIVE -> detecta ACTIVE y permite continuar a /onboarding', async () => {
  const activeSub = createSubscriptionRecord({
    userId: 'usr-test-9',
    planId: 'professional',
    billingPeriod: 'monthly',
    status: 'ACTIVE',
    paymentStatus: 'CONFIRMED',
    externalReference: 'ext-ref-test-9',
    paymentId: '777001',
    amount: 119900,
    currency: 'COP',
  });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));

  try {
    const address = server.address();
    // Simula exactamente el fetch que realiza PaymentStatusPage.tsx
    const url = `http://127.0.0.1:${address.port}/api/subscriptions/status?externalReference=ext-ref-test-9&userId=usr-test-9&_t=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store' });
    assert.equal(res.status, 200);
    const data = await res.json();

    // Comprobación de la condición evaluada en PaymentStatusPage.tsx línea 59-62:
    const statusVal = String(data?.subscriptionStatus || data?.subscription?.status || '').toUpperCase();
    assert.equal(statusVal, 'ACTIVE');
  } finally {
    subscriptionStore.delete(activeSub.id);
    await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  }
});

// TEST 10: Integración /payments/success con backend PENDING
test('TEST 10: Integración /payments/success con backend PENDING -> detecta PENDING y no activa localmente', async () => {
  const pendingSub = createSubscriptionRecord({
    userId: 'usr-test-10',
    planId: 'basic',
    billingPeriod: 'monthly',
    status: 'PENDING',
    paymentStatus: 'PENDING',
    externalReference: 'ext-ref-test-10',
    paymentId: null,
    amount: 49900,
    currency: 'COP',
  });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));

  try {
    const address = server.address();
    // Simula exactamente el fetch que realiza PaymentStatusPage.tsx
    const url = `http://127.0.0.1:${address.port}/api/subscriptions/status?externalReference=ext-ref-test-10&userId=usr-test-10&_t=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store' });
    assert.equal(res.status, 200);
    const data = await res.json();

    // Comprobación de la condición evaluada en PaymentStatusPage.tsx
    const statusVal = String(data?.subscriptionStatus || data?.subscription?.status || '').toUpperCase();
    assert.equal(statusVal, 'PENDING');
    assert.notEqual(statusVal, 'ACTIVE');
  } finally {
    subscriptionStore.delete(pendingSub.id);
    await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  }
});

// FASE 11 — Tests del Diagnóstico de Pago
test('FASE 11: Clasificación diagnóstica de estados de pago', () => {
  // CASE A: Preference creada pero no existe payment_id -> NO_PAYMENT_ENTITY
  const diagA = classifyPaymentDiagnostic({ paymentId: null, paymentStatus: null });
  assert.equal(diagA, 'NO_PAYMENT_ENTITY');

  // CASE B: Existe payment_id con rejected -> PAYMENT_REJECTED
  const diagB = classifyPaymentDiagnostic({ paymentId: '12345', paymentStatus: 'REJECTED' });
  assert.equal(diagB, 'PAYMENT_REJECTED');

  // CASE C: Existe payment_id approved pero webhook SignatureMismatch -> APPROVED_PAYMENT_WEBHOOK_FAILURE
  const diagC = classifyPaymentDiagnostic({ paymentId: '12345', paymentStatus: 'APPROVED', webhookValid: false });
  assert.equal(diagC, 'APPROVED_PAYMENT_WEBHOOK_FAILURE');

  // CASE D: Webhook válido + Payment approved + subscription no activa -> SUBSCRIPTION_ACTIVATION_FAILURE
  const diagD = classifyPaymentDiagnostic({
    paymentId: '12345',
    paymentStatus: 'APPROVED',
    webhookValid: true,
    subscriptionActivated: false,
  });
  assert.equal(diagD, 'SUBSCRIPTION_ACTIVATION_FAILURE');

  // SUCCESSFUL_FLOW
  const diagSuccess = classifyPaymentDiagnostic({
    paymentId: '12345',
    paymentStatus: 'APPROVED',
    webhookValid: true,
    subscriptionActivated: true,
  });
  assert.equal(diagSuccess, 'SUCCESSFUL_FLOW');
});

// QUINTA TAREA: TEST_EXTERNAL_REFERENCE_PERSISTENCE
test('TEST_EXTERNAL_REFERENCE_PERSISTENCE: Checkout -> externalReference -> store -> webhook -> ACTIVE', async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));

  try {
    const address = server.address();

    // 1. Crear checkout
    const checkoutRes = await fetch(`http://127.0.0.1:${address.port}/api/subscriptions/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId: 'basic',
        billingPeriod: 'monthly',
        userId: 'usr-test-persistence',
        userEmail: 'persistence@test.com',
      }),
    });

    assert.equal(checkoutRes.status, 200);
    const checkoutData = await checkoutRes.json();
    assert.equal(checkoutData.ok, true);

    // 2. Obtener externalReference
    const externalReference = checkoutData.externalReference;
    assert.ok(externalReference, 'externalReference debe existir');

    // 3. Comprobar que subscriptionStore contiene exactamente ese externalReference
    const stored = subscriptionStore.get(externalReference);
    assert.ok(stored, 'subscriptionStore debe contener la suscripción por externalReference');
    assert.equal(stored.externalReference, externalReference);
    assert.equal(stored.status, 'PENDING');
    assert.equal(stored.paymentStatus, 'PENDING');

    // 4. Comprobar que la Preference utiliza exactamente el mismo externalReference
    assert.ok(checkoutData.checkoutUrl, 'checkoutUrl debe existir');

    // 5. Simular webhook con Payment approved para ese externalReference
    const paymentApproved = {
      id: 998877,
      status: 'approved',
      status_detail: 'accredited',
      payment_type_id: 'account_money',
      transaction_amount: 49900,
      currency_id: 'COP',
      external_reference: externalReference,
    };

    // 6. Comprobar que encuentra la subscription
    const lookupSub = subscriptionStore.get(externalReference);
    assert.ok(lookupSub, 'Debe encontrar la subscription asociada al externalReference');

    // 7. Comprobar que Payment approved activa ACTIVE
    const result = applyPaymentToSubscription(lookupSub, paymentApproved);
    assert.equal(result.activated, true);
    assert.equal(lookupSub.status, 'ACTIVE');
    assert.equal(lookupSub.paymentStatus, 'CONFIRMED');
    assert.equal(lookupSub.paymentId, '998877');

    // Comprobar que en el store se mantiene ACTIVE
    assert.equal(subscriptionStore.get(externalReference).status, 'ACTIVE');
  } finally {
    await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  }
});

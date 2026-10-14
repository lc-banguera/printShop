import { CartItem } from '../cart-store';

export type PaymentGatewayType = 'mercadopago' | 'pse' | 'wompi';

export interface CustomerBillingData {
  fullName: string;
  email: string;
  address: string;
  city: string;
  phone: string;
}

export interface PaymentPreferencePayload {
  gateway: PaymentGatewayType;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  customer: CustomerBillingData;
}

export interface PaymentPreferenceResponse {
  success: boolean;
  preferenceId?: string;
  redirectUrl?: string;
  message?: string;
}

/**
 * ── Configuración de Entorno de Pasarelas de Pago ──────────────────────
 * Variables requeridas en el archivo .env del frontend:
 *
 * VITE_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 * VITE_WOMPI_PUBLIC_KEY=pub_test_xxxxxxxxxxxxxxxxxxxxxxxx
 * VITE_API_PAYMENTS_URL=http://localhost:8080/api/payments (o Supabase Edge Function)
 *
 * NOTA DE SEGURIDAD:
 * Las credenciales secretas (Access Tokens de Mercado Pago y Private Keys de Wompi)
 * NUNCA se exponen en el frontend; se procesan en el backend / Edge Functions de Supabase.
 */
export const PAYMENT_CONFIG = {
  mercadopago: {
    publicKey: import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || '',
    currency: 'COP',
    isConfigured: Boolean(import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY),
  },
  wompi: {
    publicKey: import.meta.env.VITE_WOMPI_PUBLIC_KEY || '',
    currency: 'COP',
    isConfigured: Boolean(import.meta.env.VITE_WOMPI_PUBLIC_KEY),
  },
};

/**
 * ── Servicio de Inicialización de Pago (Mock/Preparado para Backend) ──
 * Prepara la carga y genera la URL de redirección hacia el checkout oficial.
 */
export async function initializePayment(
  payload: PaymentPreferencePayload
): Promise<PaymentPreferenceResponse> {
  // Simulación local de comunicación con el backend (1.2s)
  await new Promise((resolve) => setTimeout(resolve, 1200));

  if (payload.gateway === 'mercadopago') {
    // TODO: Conectar en la siguiente fase con el backend / Edge Function:
    // const res = await fetch(`${API_URL}/mercadopago/preference`, { method: 'POST', body: JSON.stringify(payload) });
    // const { init_point } = await res.json();
    return {
      success: true,
      preferenceId: `MP-PREF-${Date.now()}`,
      redirectUrl: 'https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=demo',
      message: 'Preferencia de pago Mercado Pago generada con éxito.',
    };
  }

  if (payload.gateway === 'pse') {
    return {
      success: true,
      preferenceId: `PSE-TX-${Date.now()}`,
      redirectUrl: 'https://registro.pse.com.co/PSEUserRegister/',
      message: 'Redirección a pasarela PSE generada con éxito.',
    };
  }

  if (payload.gateway === 'wompi') {
    // TODO: Conectar en la siguiente fase con Wompi Widget o Checkout API:
    // const res = await fetch(`${API_URL}/wompi/transaction`, { method: 'POST', body: JSON.stringify(payload) });
    // const { checkout_url } = await res.json();
    return {
      success: true,
      preferenceId: `WOMPI-TX-${Date.now()}`,
      redirectUrl: 'https://checkout.wompi.co/p/?public-key=demo',
      message: 'Transacción Wompi generada con éxito.',
    };
  }

  return {
    success: false,
    message: 'Pasarela de pago no reconocida.',
  };
}

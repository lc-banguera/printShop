import { createDiditSession } from './didit-api';
import type { MethodType } from './types';

export interface IdentityVerificationResult {
  status: 'APPROVED' | 'PENDING';
  verificationUrl?: string;
  provisional: boolean;
}

/**
 * Centraliza la transición entre la integración real y el adaptador local.
 * El resultado aprobado de desarrollo nunca está disponible en un build de producción.
 */
export async function startIdentityVerification(
  _method: MethodType,
  accessToken?: string,
): Promise<IdentityVerificationResult> {
  if (import.meta.env.DEV) {
    return { status: 'APPROVED', provisional: true };
  }

  const session = await createDiditSession(accessToken);
  return {
    status: 'PENDING',
    verificationUrl: session.verificationUrl,
    provisional: false,
  };
}

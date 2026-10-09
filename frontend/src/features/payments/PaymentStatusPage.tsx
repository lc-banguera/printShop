import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/auth-store';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const statusMap = {
  success: {
    title: 'Confirmando tu pago',
    description: 'Estamos esperando la confirmación segura de Mercado Pago.',
    accent: 'bg-infoMuted text-primary',
  },
  pending: {
    title: 'Pago pendiente',
    description: 'Tu operación está en revisión. Cuando el backend confirme el estado real, podrás continuar con tu activación.',
    accent: 'bg-warningMuted text-warningForeground',
  },
  failure: {
    title: 'Pago fallido',
    description: 'La operación no pudo completarse. Puedes intentar nuevamente desde la página de planes.',
    accent: 'bg-dangerMuted text-dangerStrong',
  },
} as const;

type VerificationState = 'checking' | 'active' | 'pending' | 'rejected' | 'unavailable';

export default function PaymentStatusPage() {
  const { status } = useParams();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const [verification, setVerification] = useState<VerificationState>('checking');
  const externalReference = searchParams.get('external_reference') || searchParams.get('externalReference');
  const state = statusMap[(status as keyof typeof statusMap) || 'success'] || statusMap.success;

  useEffect(() => {
    if (!externalReference || !user?.id) {
      setVerification('unavailable');
      return;
    }

    let cancelled = false;
    let attempts = 0;
    let retryTimer: number | undefined;
    const checkStatus = async () => {
      try {
        const query = new URLSearchParams({
          externalReference,
          userId: user.id,
          _t: String(Date.now()),
        });
        const response = await fetch(`${API_BASE_URL}/api/subscriptions/status?${query.toString()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store',
            'Pragma': 'no-cache',
          },
        });
        const data = await response.json().catch(() => ({}));
        const subscriptionStatus = String(data?.subscription?.status || '').toUpperCase();
        if (cancelled) return;
        if (response.ok && subscriptionStatus === 'ACTIVE') {
          setVerification('active');
          return;
        }
        if (subscriptionStatus === 'REJECTED' || subscriptionStatus === 'CANCELLED') {
          setVerification('rejected');
          return;
        }
        attempts += 1;
        if (attempts >= 30) {
          setVerification('unavailable');
          return;
        }
        setVerification('pending');
        retryTimer = window.setTimeout(checkStatus, 2500);
      } catch (error) {
        console.error('[MERCADO_PAGO] subscription status request failed', error);
        if (!cancelled) setVerification('unavailable');
      }
    };
    void checkStatus();
    return () => {
      cancelled = true;
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
    };
  }, [externalReference, user?.id]);

  const isActive = verification === 'active';
  const description = isActive
    ? 'Tu pago fue confirmado por el backend. Ya puedes comenzar a configurar tu tienda.'
    : verification === 'rejected'
      ? 'Mercado Pago no aprobó la operación. Tu suscripción no fue activada.'
      : verification === 'unavailable'
        ? 'No pudimos verificar esta operación todavía. Vuelve a consultar en unos minutos desde esta misma página.'
        : state.description;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-xl rounded-card border border-border bg-surface p-6 shadow-card sm:p-9">
        <div className={`inline-flex rounded-badge px-3 py-1 text-xs font-semibold ${isActive ? 'bg-surfaceMuted text-success' : state.accent}`}>
          {isActive ? 'Pago confirmado' : verification === 'rejected' ? 'Pago no aprobado' : state.title}
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {isActive ? 'Pago aprobado' : verification === 'rejected' ? 'Pago no aprobado' : state.title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-foregroundMuted">{description}</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {isActive ? (
            <Link
              to="/onboarding"
              className="inline-flex min-h-11 items-center justify-center rounded-control bg-primary px-4 py-2.5 text-sm font-semibold text-primaryForeground transition-colors hover:bg-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Continuar a la configuración
            </Link>
          ) : null}
          <Link
            to="/plans"
            className="inline-flex min-h-11 items-center justify-center rounded-control border border-borderStrong bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surfaceMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Volver a planes
          </Link>
        </div>
      </div>
    </div>
  );
}

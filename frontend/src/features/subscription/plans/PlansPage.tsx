import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/auth-store';
import { useToast } from '@/shared/components/Toast/Toast';
import { billingPeriods, onboardingPlans, type BillingPeriod } from './data/plans.data';
import { PlanCard } from './PlanCard';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const normalizeCheckoutError = (message?: string) => {
  const technicalText = message ?? '';

  if (/mercado pago|mercadopago|checkout|preferencia|payment/i.test(technicalText)) {
    return {
      type: 'error' as const,
      title: 'No fue posible iniciar el pago',
      message: technicalText,
    };
  }

  if (/plan.*(no existe|inexistente|no disponible)|plan.*(no.*disponible|not.*available)|enterprise.*precio/i.test(technicalText)) {
    return {
      type: 'error' as const,
      title: 'No se pudo procesar el plan',
      message: 'Este plan aún no está listo para pago automático. Consulta la configuración del backend para activarlo correctamente.',
    };
  }

  if (/iniciar sesión|autentic|unauthorized|401|403/i.test(technicalText)) {
    return {
      type: 'error' as const,
      title: 'Debes iniciar sesión',
      message: 'Necesitas una sesión activa para continuar con la suscripción.',
    };
  }

  if (/fetch|network|failed to fetch|ECONNREFUSED|backend|500|503|timeout/i.test(technicalText)) {
    return {
      type: 'error' as const,
      title: 'No fue posible conectar con la plataforma para realizar el pago',
      message: technicalText.includes('Mercado Pago') || technicalText.includes('MERCADOPAGO')
        ? technicalText
        : 'Estamos teniendo problemas para procesar tu solicitud. Intenta nuevamente.',
    };
  }

  return {
    type: 'error' as const,
    title: 'No fue posible iniciar el pago',
    message: 'El servicio de pagos no está disponible en este momento. Intenta nuevamente más tarde.',
  };
};

export function PlansPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const { showToast } = useToast();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedBillingPeriod, setSelectedBillingPeriod] = useState<BillingPeriod>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedPlan = useMemo(
    () => onboardingPlans.find((plan) => plan.id === selectedPlanId) ?? null,
    [selectedPlanId],
  );

  if (!isAuthenticated) {
    return <Navigate to="/register" replace />;
  }

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const handleBeginCheckout = async (planId: string) => {
    if (isProcessing) return;

    const plan = onboardingPlans.find((currentPlan) => currentPlan.id === planId);
    if (!plan) {
      showToast({
        type: 'error',
        title: 'No se pudo procesar el plan',
        message: 'El plan seleccionado ya no está disponible. Actualiza la página e inténtalo nuevamente.',
      });
      return;
    }

    setSelectedPlanId(planId);
    setIsProcessing(true);

    try {
      if (planId === 'free') {
        window.location.assign('/onboarding');
        return;
      }

      const endpoint = '/api/payments/checkout';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          billingPeriod: selectedBillingPeriod,
          userId: user?.id ?? 'anonymous-user',
          ...(user?.email ? { userEmail: user.email } : {}),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error('[MERCADO_PAGO] checkout backend response', {
          status: response.status,
          error: data?.error,
          message: data?.message,
          details: data?.details,
        });
        const normalized = normalizeCheckoutError(data?.message || data?.error || 'checkout-error');
        showToast({
          type: normalized.type,
          title: normalized.title,
          message: normalized.message,
        });
        return;
      }

      if (!data.checkoutUrl) {
        throw new Error('checkout-url-missing');
      }

      window.location.href = data.checkoutUrl;
    } catch (checkoutError) {
      console.error('[MERCADO_PAGO] checkout request failed', checkoutError);
      const normalized = normalizeCheckoutError(
        checkoutError instanceof Error ? checkoutError.message : 'No fue posible iniciar el checkout.',
      );
      showToast({
        type: normalized.type,
        title: normalized.title,
        message: normalized.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-10 text-[var(--text-primary)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            Elige el plan con el que quieres comenzar
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
            Cada plan está pensado para un nivel distinto de crecimiento. La activación real del acceso ocurre sólo
            cuando el sistema confirme el pago y valide la suscripción.
          </p>
        </div>

        <div className="mb-8 flex justify-center">
          <div className="inline-flex flex-wrap items-center gap-2 border border-[var(--border)] bg-white p-1 shadow-sm">
            {billingPeriods.map((period) => (
              <button
                key={period.value}
                type="button"
                onClick={() => setSelectedBillingPeriod(period.value)}
                className={[
                  'px-4 py-2 text-sm font-medium transition-colors duration-200',
                  selectedBillingPeriod === period.value
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-white text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]',
                ].join(' ')}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {onboardingPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlan?.id === plan.id}
              isProcessing={isProcessing}
              selectedBillingPeriod={selectedBillingPeriod}
              onSelect={handleSelectPlan}
              onStart={handleBeginCheckout}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

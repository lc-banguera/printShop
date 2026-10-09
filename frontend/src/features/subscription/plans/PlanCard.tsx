import { Check, Minus } from 'lucide-react';
import type { BillingPeriod, OnboardingPlan } from './data/plans.data';

type PlanCardProps = {
  plan: OnboardingPlan;
  isSelected: boolean;
  isProcessing: boolean;
  selectedBillingPeriod: BillingPeriod;
  onSelect: (planId: string) => void;
  onStart: (planId: string) => void;
};

const billingPeriodMap: Record<BillingPeriod, { label: string; divisor?: number; multiplier?: number }> = {
  daily: { label: 'día', divisor: 30 },
  weekly: { label: 'semana', divisor: 4 },
  monthly: { label: 'mes' },
  yearly: { label: 'año', multiplier: 12 },
};

export function PlanCard({
  plan,
  isSelected,
  isProcessing,
  selectedBillingPeriod,
  onSelect,
  onStart,
}: PlanCardProps) {
  const priceConfig = billingPeriodMap[selectedBillingPeriod];
  const displayPrice = plan.monthlyPrice === 0 ? 0 : (() => {
    if (selectedBillingPeriod === 'monthly') return plan.monthlyPrice;
    if (selectedBillingPeriod === 'yearly') return plan.monthlyPrice * (priceConfig.multiplier ?? 1);
    const divisor = priceConfig.divisor ?? 1;
    return plan.monthlyPrice / divisor;
  })();

  return (
    <article
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={() => !isProcessing && onSelect(plan.id)}
      onKeyDown={(event) => {
        if ((event.key === 'Enter' || event.key === ' ') && !isProcessing) {
          event.preventDefault();
          onSelect(plan.id);
        }
      }}
      className={[
        'group flex h-full cursor-pointer flex-col border bg-white p-5 shadow-sm transition-all duration-200 outline-none',
        isSelected ? 'border-[var(--primary)] bg-[var(--accent-muted)] ring-1 ring-[var(--accent-muted)]' : 'border-[var(--border)] bg-white hover:border-[var(--border-strong)]',
      ].join(' ')}
    >

      <div className="flex-1">
        <div className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">{plan.shortLabel}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-primary)]">{plan.name}</h2>
        </div>

        <p className="min-h-[56px] text-sm leading-6 text-[var(--text-secondary)]">{plan.description}</p>

        <div className="mt-6 flex items-end gap-2">
          <span className="text-4xl font-black tracking-tight text-[var(--text-primary)]">
            {plan.monthlyPriceLabel === 'A medida' ? 'A medida' : `$${displayPrice.toLocaleString('es-CO')}`}
          </span>
          <span className="pb-1 text-sm text-[var(--text-muted)]">
            {plan.monthlyPriceLabel === 'A medida' ? '' : `/ ${priceConfig.label}`}
          </span>
        </div>

        <div className="mt-7 space-y-5">
          {plan.sections.map((section) => (
            <div key={section.title}>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">{section.title}</p>
              <ul className="space-y-2.5">
                {section.items.map((item) => (
                  <li key={`${section.title}-${item.label}`} className="flex items-start gap-3 text-sm leading-5 text-[var(--text-secondary)]">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border border-[var(--success-muted)] bg-[var(--success-muted)] text-[var(--success)]">
                      {item.included ? <Check className="h-3 w-3" /> : <Minus className="h-3 w-3 text-[var(--text-muted)]" />}
                    </span>
                    <span className="flex-1">
                      {item.label}
                      {item.detail ? <span className="ml-1 text-[var(--text-muted)]">({item.detail})</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onStart(plan.id);
        }}
        disabled={isProcessing}
        className={[
          'mt-7 flex w-full items-center justify-center border px-4 py-3 text-sm font-semibold transition-colors duration-200',
          isSelected
            ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
            : 'border-[var(--border-strong)] bg-white text-[var(--text-primary)] hover:border-[var(--text-muted)] hover:bg-[var(--surface-muted)]',
          isProcessing ? 'cursor-wait opacity-70' : '',
        ].join(' ')}
      >
        {isProcessing ? 'Procesando...' : 'Comenzar'}
      </button>
    </article>
  );
}

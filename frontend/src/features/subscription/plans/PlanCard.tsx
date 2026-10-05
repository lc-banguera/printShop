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
        isSelected ? 'border-[#2563EB] bg-[#F8FBFF] ring-1 ring-[#BFDBFE]' : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]',
      ].join(' ')}
    >

      <div className="flex-1">
        <div className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2563EB]">{plan.shortLabel}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#111827]">{plan.name}</h2>
        </div>

        <p className="min-h-[56px] text-sm leading-6 text-[#475569]">{plan.description}</p>

        <div className="mt-6 flex items-end gap-2">
          <span className="text-4xl font-black tracking-tight text-[#0F172A]">
            {plan.monthlyPriceLabel === 'A medida' ? 'A medida' : `$${displayPrice.toLocaleString('es-CO')}`}
          </span>
          <span className="pb-1 text-sm text-[#64748B]">
            {plan.monthlyPriceLabel === 'A medida' ? '' : `/ ${priceConfig.label}`}
          </span>
        </div>

        <div className="mt-7 space-y-5">
          {plan.sections.map((section) => (
            <div key={section.title}>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">{section.title}</p>
              <ul className="space-y-2.5">
                {section.items.map((item) => (
                  <li key={`${section.title}-${item.label}`} className="flex items-start gap-3 text-sm leading-5 text-[#334155]">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border border-[#D1FAE5] bg-[#ECFDF5] text-[#059669]">
                      {item.included ? <Check className="h-3 w-3" /> : <Minus className="h-3 w-3 text-[#94A3B8]" />}
                    </span>
                    <span className="flex-1">
                      {item.label}
                      {item.detail ? <span className="ml-1 text-[#64748B]">({item.detail})</span> : null}
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
            ? 'border-[#0F172A] bg-[#0F172A] text-white'
            : 'border-[#CBD5E1] bg-white text-[#0F172A] hover:border-[#94A3B8] hover:bg-[#F8FAFC]',
          isProcessing ? 'cursor-wait opacity-70' : '',
        ].join(' ')}
      >
        {isProcessing ? 'Procesando...' : 'Comenzar'}
      </button>
    </article>
  );
}

import React from 'react';
import { Check } from 'lucide-react';

interface VerificationProgressProps {
  currentStepIndex: number; // 1: Método, 2: Datos personales, 3: Confirmación
}

export const VerificationProgress: React.FC<VerificationProgressProps> = ({
  currentStepIndex,
}) => {
  const steps = [
    { number: 1, label: 'Método de verificación' },
    { number: 2, label: 'Datos personales' },
    { number: 3, label: 'Confirmación' },
  ];

  return (
    <div className="w-full pt-4 pb-2">
      <div className="flex items-center justify-between relative px-2">
        {steps.map((step, idx) => {
          const isCompleted = currentStepIndex > step.number;
          const isActive = currentStepIndex === step.number;
          const isPending = currentStepIndex < step.number;

          return (
            <React.Fragment key={step.number}>
              {/* Step Circle & Label Column */}
              <div className="flex flex-col items-center z-10">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    isCompleted || isActive
                      ? 'bg-[var(--primary)] text-white shadow-2xs'
                      : 'bg-white border border-[var(--border-strong)] text-[var(--text-muted)]'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    step.number
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-2 text-center min-w-[75px] sm:min-w-[90px]">
                  <span
                    className={`text-[11px] block transition-colors leading-tight ${
                      isActive
                        ? 'font-semibold text-[var(--primary)]'
                        : isCompleted
                        ? 'font-medium text-[var(--text-secondary)]'
                        : 'text-[var(--text-muted)] font-normal'
                    }`}
                  >
                    {step.label}
                  </span>

                  {/* Active Indicator Underline */}
                  {isActive && (
                    <div className="w-full h-[2px] bg-[var(--primary)] rounded-full mt-1 mx-auto" />
                  )}
                </div>
              </div>

              {/* Connecting Line Between Steps */}
              {idx < steps.length - 1 && (
                <div className="flex-1 -mt-7 mx-1.5 sm:mx-2">
                  <div
                    className={`h-[1.5px] w-full transition-colors ${
                      currentStepIndex > idx + 1 ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

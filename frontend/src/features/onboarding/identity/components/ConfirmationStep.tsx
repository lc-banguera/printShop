import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, Mail, Phone, ArrowRight } from 'lucide-react';
import { VerificationHelp } from './VerificationHelp';

interface ConfirmationStepProps {
  onFinish: () => void;
  onContactClick?: () => void;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  onFinish,
  onContactClick,
}) => {
  const [contactType, setContactType] = useState<'email' | 'phone'>('email');
  const [contactValue, setContactValue] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactValue.trim()) {
      setIsSaved(true);
    }
  };

  return (
    <div className="w-full">
      {/* Success Badge & Heading */}
      <div className="mt-5 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-[22px] sm:text-2xl font-bold text-gray-900 tracking-tight">
          ¡Identidad verificada!
        </h2>
        <p className="text-xs sm:text-[13px] text-gray-500 mt-1.5 leading-relaxed max-w-sm mx-auto">
          Tus datos y comprobación biométrica se han validado correctamente. Tu cuenta está lista para activar cobros.
        </p>
      </div>

      {/* Completed Checkpoints Summary */}
      <div className="mt-5 space-y-2 bg-[#F8FAFC] border border-gray-100 rounded-2xl p-4">
        <div className="flex items-center justify-between py-1.5 border-b border-gray-200/60">
          <span className="text-xs font-semibold text-gray-700">
            Documento de identidad
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3 h-3" /> Completado
          </span>
        </div>

        <div className="flex items-center justify-between py-1.5">
          <span className="text-xs font-semibold text-gray-700">
            Verificación facial
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3 h-3" /> Completada
          </span>
        </div>
      </div>

      {/* Optional Step 3: Correo o número de teléfono */}
      <div className="mt-5 border border-dashed border-gray-300 rounded-2xl p-4 bg-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-900">
            Correo o número de teléfono
          </span>
          <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
            Opcional
          </span>
        </div>
        <p className="text-[11px] text-gray-500 leading-snug mb-3">
          Registra un medio de contacto para recuperación de cuenta y notificaciones críticas.
        </p>

        {!isSaved ? (
          <form onSubmit={handleSaveContact} className="space-y-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setContactType('email')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
                  contactType === 'email'
                    ? 'border-[#2563EB] bg-blue-50/50 text-[#2563EB] font-semibold'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                Correo
              </button>
              <button
                type="button"
                onClick={() => setContactType('phone')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
                  contactType === 'phone'
                    ? 'border-[#2563EB] bg-blue-50/50 text-[#2563EB] font-semibold'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                Teléfono
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type={contactType === 'email' ? 'email' : 'tel'}
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder={
                  contactType === 'email'
                    ? 'ejemplo@tudominio.com'
                    : '+57 300 123 4567'
                }
                className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:border-[#2563EB] focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-gray-900 hover:bg-black text-white text-xs font-medium rounded-lg transition-colors shrink-0"
              >
                Agregar
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center gap-2 p-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Contacto registrado: {contactValue}</span>
          </div>
        )}
      </div>

      {/* Main finish action */}
      <div className="mt-6">
        <button
          type="button"
          onClick={onFinish}
          className="w-full bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg text-sm transition-all shadow-sm flex items-center justify-center gap-2 focus:outline-hidden"
        >
          <span>Finalizar y continuar a tu tienda</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Footer */}
      <VerificationHelp onContactClick={onContactClick} />
    </div>
  );
};

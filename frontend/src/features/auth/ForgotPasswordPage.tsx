import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!email.trim()) {
      setError('Ingresa tu correo electrónico.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('El correo electrónico no tiene un formato válido.');
      return;
    }

    setIsLoading(true);
    setError(undefined);

    // TODO: Conectar con supabase.auth.resetPasswordForEmail(email)
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[var(--surface-muted)] flex flex-col justify-between items-center p-4 sm:p-6 select-none">
      <div className="w-full flex-1 flex flex-col justify-center items-center">
        {/* Header con Logo */}
        <div className="mb-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 transition-transform hover:opacity-95"
            title="Volver al inicio"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-[var(--primary)] text-base font-black text-white shadow-2xs">
              P
            </span>
            <span className="text-[22px] font-black tracking-tight text-[var(--text-primary)]">
              Print<span className="text-[var(--primary)]">Shop</span>
            </span>
          </Link>
        </div>

        {/* Tarjeta */}
        <div className="bg-white rounded-[5px] border border-[var(--border)] shadow-xs w-full max-w-[390px] p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-[22px] font-bold text-[var(--text-primary)] tracking-tight">
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              Ingresa tu correo electrónico registrado y te enviaremos un enlace para recuperarla.
            </p>
          </div>

          {isSubmitted ? (
            <div className="text-center space-y-4 py-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="h-11 w-11 rounded-full bg-[var(--success-muted)] border border-[#A7F3D0] flex items-center justify-center text-[var(--success)] mx-auto">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Enlace enviado
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                  Si existe una cuenta asociada a <strong className="text-[var(--text-primary)]">{email}</strong>, recibirás un enlace de recuperación en breve.
                </p>
              </div>
              <div className="pt-3">
                <Link
                  to="/login"
                  className="w-full h-10 px-4 rounded-[5px] text-xs font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Volver a iniciar sesión</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label
                  htmlFor="reset-email"
                  className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5"
                >
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail
                      className={`h-4 w-4 transition-colors ${
                        touched && error ? 'text-[var(--danger-strong)]' : 'text-[var(--text-muted)]'
                      }`}
                    />
                  </div>
                  <input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(undefined);
                    }}
                    onBlur={() => setTouched(true)}
                    placeholder="nombre@ejemplo.com"
                    className={`w-full h-10 pl-9 pr-3 rounded-[5px] border text-xs sm:text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-white outline-none transition-all shadow-2xs disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)] ${
                      touched && error
                        ? 'border-[var(--danger-strong)] focus:border-[var(--danger-strong)] focus:ring-1 focus:ring-[var(--danger-strong)]'
                        : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]'
                    }`}
                  />
                </div>
                {touched && error && (
                  <p className="mt-1.5 text-[11px] text-[var(--danger-strong)] flex items-center gap-1 leading-tight">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{error}</span>
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 px-4 rounded-[5px] text-xs sm:text-[13px] font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Enviando enlace...</span>
                    </>
                  ) : (
                    <span>Enviar enlace de recuperación</span>
                  )}
                </button>
              </div>

              <div className="text-center pt-3 border-t border-[var(--border-muted)]">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Volver a iniciar sesión</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-[390px] text-center pt-6 pb-2 text-xs text-[var(--text-muted)]">
        <p>© 2026 PrintShop. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default ForgotPasswordPage;

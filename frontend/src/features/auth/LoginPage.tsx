import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from './auth-store';

/* ── Icono oficial de Google (SVG) ─────────────────────────────────── */
function GoogleIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Estados visuales de carga y errores (preparados para Supabase)
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  // Validación básica del lado de cliente
  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Ingresa tu correo electrónico.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'El correo electrónico no tiene un formato válido.';
    }

    if (!password) {
      newErrors.password = 'Ingresa una contraseña.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    // Validar campo individual al perder foco
    if (field === 'email') {
      if (!email.trim()) {
        setErrors((prev) => ({ ...prev, email: 'Ingresa tu correo electrónico.' }));
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setErrors((prev) => ({ ...prev, email: 'El correo electrónico no tiene un formato válido.' }));
      } else {
        setErrors((prev) => ({ ...prev, email: undefined }));
      }
    }
    if (field === 'password') {
      if (!password) {
        setErrors((prev) => ({ ...prev, password: 'Ingresa una contraseña.' }));
      } else {
        setErrors((prev) => ({ ...prev, password: undefined }));
      }
    }
  };

  /* ── Handler Email/Password (Preparado para Supabase Auth) ────────── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    // Demostración de estado loading (800ms) y conexión con authStore
    // TODO: Conectar posteriormente con:
    // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setTimeout(() => {
      setIsLoading(false);
      login({ name: email.split('@')[0] || 'Cliente PrintShop', email });
      navigate('/');
    }, 800);
  };

  /* ── Handler Google OAuth (Preparado para Supabase Auth) ─────────── */
  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    setErrors({});

    // Demostración de estado loading (800ms) y conexión con authStore
    // TODO: Conectar posteriormente con:
    // const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    setTimeout(() => {
      setIsGoogleLoading(false);
      login({ name: 'Usuario Google', email: 'usuario.google@printshop.com' });
      navigate('/');
    }, 800);
  };

  const isFormDisabled = isLoading || isGoogleLoading;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between items-center p-4 sm:p-6 select-none">
      <div className="w-full flex-1 flex flex-col justify-center items-center">
        {/* ── 1. Header con Logo de PrintShop ──────────────────────────── */}
        <div className="mb-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 transition-transform hover:opacity-95"
            title="Volver al inicio"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-[#2563EB] text-base font-black text-white shadow-2xs">
              P
            </span>
            <span className="text-[22px] font-black tracking-tight text-[#111827]">
              Print<span className="text-[#2563EB]">Shop</span>
            </span>
          </Link>
        </div>

        {/* ── Contenedor Principal (Tarjeta Minimalista SaaS) ─────────── */}
        <div className="bg-white rounded-[5px] border border-[#E5E7EB] shadow-xs w-full max-w-[390px] p-6 sm:p-8">
          {/* ── 2 & 3. Título y Subtítulo ──────────────────────────────── */}
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-[22px] font-bold text-[#111827] tracking-tight">
              Inicia sesión
            </h1>
            <p className="text-xs sm:text-[13px] text-[#64748B] mt-1.5">
              Accede a tu cuenta de PrintShop
            </p>
          </div>

          {/* Mensaje de error general si ocurriese */}
          {errors.general && (
            <div className="mb-4 p-3 rounded-[5px] bg-[#FEF2F2] border border-[#FEE2E2] text-xs text-[#DC2626] flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* ── 4. Autenticación con Google ────────────────────────────── */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isFormDisabled}
            className="w-full h-10 px-4 rounded-[5px] border border-[#E2E8F0] bg-white text-xs sm:text-[13px] font-medium text-[#1E293B] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] active:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/20 transition-all flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#64748B]" />
                <span className="text-[#64748B]">Conectando con Google...</span>
              </>
            ) : (
              <>
                <GoogleIcon className="h-4 w-4" />
                <span>Continuar con Google</span>
              </>
            )}
          </button>

          {/* ── 5. Separador Visual Elegante ───────────────────────────── */}
          <div className="relative my-5 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E7EB]" />
            </div>
            <div className="relative bg-white px-3 text-[11px] font-medium text-[#94A3B8] lowercase tracking-wide">
              o continúa con tu correo
            </div>
          </div>

          {/* Formulario Tradicional */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* ── 6. Campo de Correo Electrónico ───────────────────────── */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[#374151] mb-1.5"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail
                    className={`h-4 w-4 transition-colors ${
                      touched.email && errors.email
                        ? 'text-[#EF4444]'
                        : 'text-[#94A3B8]'
                    }`}
                  />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  disabled={isFormDisabled}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  onBlur={() => handleBlur('email')}
                  placeholder="nombre@ejemplo.com"
                  className={`w-full h-10 pl-9 pr-3 rounded-[5px] border text-xs sm:text-[13px] text-[#111827] placeholder:text-[#94A3B8] bg-white outline-none transition-all shadow-2xs disabled:bg-[#F8FAFC] disabled:text-[#94A3B8] disabled:cursor-not-allowed ${
                    touched.email && errors.email
                      ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]'
                      : 'border-[#E2E8F0] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]'
                  }`}
                />
              </div>
              {touched.email && errors.email && (
                <p className="mt-1.5 text-[11px] text-[#EF4444] flex items-center gap-1 leading-tight">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* ── 7. Campo de Contraseña ───────────────────────────────── */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[#374151] mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock
                    className={`h-4 w-4 transition-colors ${
                      touched.password && errors.password
                        ? 'text-[#EF4444]'
                        : 'text-[#94A3B8]'
                    }`}
                  />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={isFormDisabled}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  onBlur={() => handleBlur('password')}
                  placeholder="Ingresa tu contraseña"
                  className={`w-full h-10 pl-9 pr-10 rounded-[5px] border text-xs sm:text-[13px] text-[#111827] placeholder:text-[#94A3B8] bg-white outline-none transition-all shadow-2xs disabled:bg-[#F8FAFC] disabled:text-[#94A3B8] disabled:cursor-not-allowed ${
                    touched.password && errors.password
                      ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]'
                      : 'border-[#E2E8F0] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]'
                  }`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  disabled={isFormDisabled}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#94A3B8] hover:text-[#475569] transition-colors cursor-pointer disabled:cursor-not-allowed"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="mt-1.5 text-[11px] text-[#EF4444] flex items-center gap-1 leading-tight">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* ── 8. Opciones: Recordarme & Olvidaste Contraseña ─────────── */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 text-xs text-[#475569] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  disabled={isFormDisabled}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded-[3px] border border-[#CBD5E1] text-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:ring-offset-0 cursor-pointer disabled:opacity-50"
                />
                <span>Recordarme</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] hover:underline transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* ── 9. Botón Principal de Inicio de Sesión ───────────────── */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isFormDisabled}
                className="w-full h-10 px-4 rounded-[5px] text-xs sm:text-[13px] font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-1 transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <span>Iniciar sesión</span>
                )}
              </button>
            </div>
          </form>

          {/* ── 10. Enlace a Registro ──────────────────────────────────── */}
          <div className="text-center text-xs text-[#64748B] mt-6 pt-5 border-t border-[#F1F5F9]">
            ¿No tienes una cuenta?{' '}
            <Link
              to="/register"
              className="font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:underline transition-colors ml-0.5"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>

      {/* ── 11. Footer Discreto y Coherente ─────────────────────────── */}
      <footer className="w-full max-w-[390px] text-center pt-6 pb-2 text-xs text-[#94A3B8]">
        <p>© 2026 PrintShop. Todos los derechos reservados.</p>
        <div className="flex items-center justify-center gap-3 mt-2 text-[11px]">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="hover:text-[#64748B] transition-colors"
          >
            Términos de servicio
          </a>
          <span>•</span>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="hover:text-[#64748B] transition-colors"
          >
            Privacidad
          </a>
          <span>•</span>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="hover:text-[#64748B] transition-colors"
          >
            Soporte
          </a>
        </div>
      </footer>
    </div>
  );
}

export default LoginPage;

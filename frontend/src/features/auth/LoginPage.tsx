import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { getPostAuthRoute, useAuthStore } from "./auth-store";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const requestedPath = location.state?.from?.pathname;
  const requestedDestination =
    requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
      ? `${requestedPath}${location.state?.from?.search ?? ""}${location.state?.from?.hash ?? ""}`
      : undefined;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Estados visuales de carga y errores (preparados para Supabase)
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [touched, setTouched] = useState<{
    email?: boolean;
    password?: boolean;
  }>({});

  // Validación básica del lado de cliente
  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Ingresa tu correo electrónico.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "El correo electrónico no tiene un formato válido.";
    }

    if (!password) {
      newErrors.password = "Ingresa una contraseña.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    // Validar campo individual al perder foco
    if (field === "email") {
      if (!email.trim()) {
        setErrors((prev) => ({
          ...prev,
          email: "Ingresa tu correo electrónico.",
        }));
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setErrors((prev) => ({
          ...prev,
          email: "El correo electrónico no tiene un formato válido.",
        }));
      } else {
        setErrors((prev) => ({ ...prev, email: undefined }));
      }
    }
    if (field === "password") {
      if (!password) {
        setErrors((prev) => ({ ...prev, password: "Ingresa una contraseña." }));
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
      login({ name: email.split("@")[0] || "Cliente PrintShop", email });
      navigate(getPostAuthRoute(useAuthStore.getState().user, requestedDestination), { replace: true });
    }, 800);
  };

  const isFormDisabled = isLoading;

  return (
    <div className="min-h-screen bg-[var(--surface-muted)] flex flex-col justify-between items-center p-4 sm:p-6 select-none">
      <div className="w-full flex-1 flex flex-col justify-center items-center">
        {/* ── Contenedor Principal (Tarjeta Minimalista SaaS) ─────────── */}
        <div className="bg-surface rounded-card border border-[var(--border)] shadow-card w-full max-w-[390px] p-6 sm:p-8">
          {/* ── 2 & 3. Título y Subtítulo ──────────────────────────────── */}
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-[22px] font-bold text-[var(--text-primary)] tracking-tight">
              Inicia sesión
            </h1>
            <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] mt-1.5">
              Accede a tu cuenta de PrintShop
            </p>
          </div>

          {/* Mensaje de error general si ocurriese */}
          {errors.general && (
            <div className="mb-4 p-3 rounded-control bg-[var(--danger-muted)] border border-[var(--danger-muted)] text-xs text-[var(--danger-strong)] flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Formulario de correo */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* ── 6. Campo de Correo Electrónico ───────────────────────── */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail
                    className={`h-4 w-4 transition-colors ${
                      touched.email && errors.email
                        ? "text-[var(--danger-strong)]"
                        : "text-[var(--text-muted)]"
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
                  onBlur={() => handleBlur("email")}
                  placeholder="nombre@ejemplo.com"
                  className={`w-full h-10 pl-9 pr-3 rounded-control border text-xs sm:text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-surface outline-none transition-all shadow-2xs disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed ${
                    touched.email && errors.email
                      ? "border-[var(--danger-strong)] focus:border-[var(--danger-strong)] focus:ring-1 focus:ring-[var(--danger-strong)]"
                      : "border-[var(--border)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  }`}
                />
              </div>
              {touched.email && errors.email && (
                <p className="mt-1.5 text-[11px] text-[var(--danger-strong)] flex items-center gap-1 leading-tight">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* ── 7. Campo de Contraseña ───────────────────────────────── */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock
                    className={`h-4 w-4 transition-colors ${
                      touched.password && errors.password
                        ? "text-[var(--danger-strong)]"
                        : "text-[var(--text-muted)]"
                    }`}
                  />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  disabled={isFormDisabled}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  onBlur={() => handleBlur("password")}
                  placeholder="Ingresa tu contraseña"
                  className={`w-full h-10 pl-9 pr-10 rounded-control border text-xs sm:text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-surface outline-none transition-all shadow-2xs disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed ${
                    touched.password && errors.password
                      ? "border-[var(--danger-strong)] focus:border-[var(--danger-strong)] focus:ring-1 focus:ring-[var(--danger-strong)]"
                      : "border-[var(--border)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  }`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  disabled={isFormDisabled}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30"
                  title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Ver contraseña"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="mt-1.5 text-[11px] text-[var(--danger-strong)] flex items-center gap-1 leading-tight">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* ── 8. Opciones: Recordarme & Olvidaste Contraseña ─────────── */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  disabled={isFormDisabled}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded-[3px] border border-[var(--border-strong)] text-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:ring-offset-0 cursor-pointer disabled:opacity-50"
                />
                <span>Recordarme</span>
              </label>

              <Link
                to="/forgot-password"
                className="rounded-sm text-xs font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30 focus-visible:ring-offset-2"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* ── 9. Botón Principal de Inicio de Sesión ───────────────── */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isFormDisabled}
                className="w-full h-10 px-4 rounded-control text-xs sm:text-[13px] font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-1 transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="text-center text-xs text-[var(--text-secondary)] mt-6 pt-5 border-t border-[var(--border-muted)]">
            ¿No tienes una cuenta?{" "}
            <Link
              to="/register"
              className="rounded-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] hover:underline transition-colors ml-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30 focus-visible:ring-offset-2"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>

      {/* ── 11. Footer Discreto y Coherente ─────────────────────────── */}
      <footer className="w-full max-w-[390px] text-center pt-6 pb-2 text-xs text-[var(--text-muted)]">
        <p>© 2026 PrintShop. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default LoginPage;

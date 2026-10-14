import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getPostAuthRoute, useAuthStore } from "./auth-store";

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const requestedPath = location.state?.from?.pathname;
  const requestedDestination =
    requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
      ? `${requestedPath}${location.state?.from?.search ?? ""}${location.state?.from?.hash ?? ""}`
      : undefined;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    terms?: string;
  }>({});
  const [touched, setTouched] = useState<{
    name?: boolean;
    email?: boolean;
    password?: boolean;
  }>({});

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(
        getPostAuthRoute(useAuthStore.getState().user, requestedDestination),
        { replace: true },
      );
    }
  }, [isAuthenticated, navigate, requestedDestination]);

  const validate = () => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      terms?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = "Ingresa tu nombre completo.";
    }

    if (!email.trim()) {
      newErrors.email = "Ingresa tu correo electrónico.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "El correo electrónico no tiene un formato válido.";
    }

    if (!password) {
      newErrors.password = "Ingresa una contraseña.";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres.";
    }

    if (!acceptTerms) {
      newErrors.terms = "Debes aceptar los términos y condiciones.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });

    if (!validate()) return;

    setIsLoading(true);
    // Simulate successful registration -> authenticate user and redirect to /plans
    setTimeout(() => {
      setIsLoading(false);
      // Use auth store to create session (prepared for future backend)
      login({ name: name || email.split("@")[0], email, authMethod: "MANUAL" });
      navigate(
        getPostAuthRoute(useAuthStore.getState().user, requestedDestination),
        { replace: true },
      );
    }, 800);
  };

  const isFormDisabled = isLoading;

  return (
    <div className="min-h-screen bg-[var(--surface-muted)] flex flex-col justify-between items-center p-4 sm:p-6 select-none">
      <div className="w-full flex-1 flex flex-col justify-center items-center">
        {/* Tarjeta de Registro */}
        <div className="bg-surface rounded-card border border-[var(--border)] shadow-card w-full max-w-[400px] p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-[22px] font-bold text-[var(--text-primary)] tracking-tight">
              Crea tu cuenta
            </h1>
            <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] mt-1.5">
              Únete a PrintShop y empieza hoy mismo
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Nombre */}
            <div>
              <label
                htmlFor="register-name"
                className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5"
              >
                Nombre completo
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User
                    className={`h-4 w-4 transition-colors ${
                      touched.name && errors.name
                        ? "text-[var(--danger-strong)]"
                        : "text-[var(--text-muted)]"
                    }`}
                  />
                </div>
                <input
                  id="register-name"
                  type="text"
                  autoComplete="name"
                  disabled={isFormDisabled}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name)
                      setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                  placeholder="Tu nombre y apellido"
                  className={`w-full h-10 pl-9 pr-3 rounded-control border text-xs sm:text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-surface outline-none transition-all shadow-2xs disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed ${
                    touched.name && errors.name
                      ? "border-[var(--danger-strong)] focus:border-[var(--danger-strong)] focus:ring-1 focus:ring-[var(--danger-strong)]"
                      : "border-[var(--border)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  }`}
                />
              </div>
              {touched.name && errors.name && (
                <p className="mt-1.5 text-[11px] text-[var(--danger-strong)] flex items-center gap-1 leading-tight">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Correo */}
            <div>
              <label
                htmlFor="register-email"
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
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  disabled={isFormDisabled}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email)
                      setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, email: true }))
                  }
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

            {/* Contraseña */}
            <div>
              <label
                htmlFor="register-password"
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
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  disabled={isFormDisabled}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                      setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, password: true }))
                  }
                  placeholder="Mínimo 6 caracteres"
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
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30"
                  title={showPassword ? "Ocultar" : "Mostrar"}
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

            {/* Aceptar términos */}
            <div>
              <label className="flex items-start gap-2 text-xs text-[var(--text-secondary)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  disabled={isFormDisabled}
                  onChange={(e) => {
                    setAcceptTerms(e.target.checked);
                    if (errors.terms)
                      setErrors((prev) => ({ ...prev, terms: undefined }));
                  }}
                  className="h-4 w-4 mt-0.5 rounded-[3px] border border-[var(--border-strong)] text-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] cursor-pointer"
                />
                <span className="leading-tight">
                  Acepto los{" "}
                  <a
                    href="#"
                    className="rounded-sm text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30 focus-visible:ring-offset-2"
                  >
                    Términos de Servicio
                  </a>{" "}
                  y la{" "}
                  <a
                    href="#"
                    className="rounded-sm text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30 focus-visible:ring-offset-2"
                  >
                    Política de Privacidad
                  </a>
                </span>
              </label>
              {errors.terms && (
                <p className="mt-1.5 text-[11px] text-[var(--danger-strong)] flex items-center gap-1 leading-tight">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.terms}</span>
                </p>
              )}
            </div>

            {/* Botón Principal */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isFormDisabled}
                className="w-full h-10 px-4 rounded-control text-xs sm:text-[13px] font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-1 transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creando cuenta...</span>
                  </>
                ) : (
                  <span>Crear cuenta</span>
                )}
              </button>
            </div>
          </form>

          {/* Ir a Login */}
          <div className="text-center text-xs text-[var(--text-secondary)] mt-6 pt-5 border-t border-[var(--border-muted)]">
            ¿Ya tienes una cuenta?{" "}
            <Link
              to="/login"
              className="rounded-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] hover:underline transition-colors ml-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30 focus-visible:ring-offset-2"
            >
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-[400px] text-center pt-6 pb-2 text-xs text-[var(--text-muted)]">
        <p>© 2026 PrintShop. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default RegisterPage;

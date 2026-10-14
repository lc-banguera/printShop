import * as React from "react";
import { Link } from "react-router-dom";
import { Container } from "@/shared/components/Container/Container";
import { GraduationCap, Clock, Check } from "lucide-react";

export const FreeTrialAndStudentPlan: React.FC = () => {
  return (
    <section className="relative w-full overflow-hidden border-b border-slate-200 bg-[#F6F7F8] py-20 sm:py-24 lg:py-28">
      <Container variant="wide" className="px-4 sm:px-6 lg:px-8">
        {/* Cabecera limpia y contundente */}
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-extrabold leading-tight tracking-[-0.03em] text-[#0D1014] sm:text-4xl lg:text-2xl">
            Empieza a diseñar hoy. Elige cómo quieres crecer.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Explora las herramientas completas de personalización textil con
            nuestra cuenta gratuita sin tarjeta de crédito.
          </p>
        </div>

        {/* Solo los dos planes originales que se muestran de manera equilibrada */}
        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {/* 1. TARJETA REAL: CUENTA GRATUITA */}
          <div className="flex flex-col justify-between overflow-hidden rounded-[5px] border border-slate-200 bg-white p-6 transition-all duration-200 hover:border-slate-400 hover:shadow-[0_20px_35px_-28px_rgba(15,23,42,0.6)] sm:p-8">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.06em] text-slate-600">
                  Disponible Ahora
                </span>
                <span className="text-2xl font-bold text-[#0D1014]">$0</span>
              </div>

              <h3 className="mt-5 text-2xl font-bold tracking-tight text-[#0D1014]">
                Cuenta Gratuita de Prueba
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Acceso inmediato a las funciones esenciales para crear tus
                primeros productos sin costo.
              </p>

              <div className="mt-8 space-y-3.5 border-t border-slate-200 pt-6">
                {[
                  "1 Tienda activa y hasta 20 productos de catálogo",
                  "Acceso completo al diseñador 3D y plantillas base",
                  "Generación de maquetas digitales para redes sociales",
                  "Sin tarjeta de crédito requerida para registrarte",
                ].map((feat, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm text-slate-800"
                  >
                    <Check className="h-4 w-4 shrink-0 text-slate-700" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 pt-4">
              <Link
                to="/register"
                className="flex min-h-[50px] w-full items-center justify-center rounded-[5px] bg-[#0D1014] px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-black active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
              >
                <span>Crear cuenta gratuita ahora</span>
              </Link>
              <p className="mt-3 text-center text-xs text-foregroundMuted">
                Activa tu cuenta en menos de 1 minuto
              </p>
            </div>
          </div>

          {/* 2. TARJETA HONESTA: PLAN ESTUDIANTES */}
          <div className="flex flex-col justify-between overflow-hidden rounded-[5px] border border-slate-300 bg-slate-200/60 p-6 transition-all duration-200 hover:border-slate-500 hover:shadow-[0_20px_35px_-28px_rgba(15,23,42,0.6)] sm:p-8">
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.06em] text-slate-600">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Próximamente</span>
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Iniciativa Educativa
                </span>
              </div>

              <h3 className="mt-5 text-2xl font-bold tracking-tight text-[#0D1014]">
                PrintShop para Estudiantes
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Estamos preparando un programa especial con tarifa preferencial
                para alumnos de diseño de moda, artes gráficas y diseño textil.
              </p>

              <div className="mt-8 space-y-3.5 border-t border-slate-300 pt-6">
                {[
                  "Descuento especial validando correo institucional (.edu)",
                  "Exportaciones ilimitadas en vectores de alta resolución",
                  "Licencias académicas para proyectos universitarios y portfolios",
                  "Acceso anticipado a nuevas herramientas de simulación 3D",
                ].map((feat, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm text-slate-800"
                  >
                    <GraduationCap className="h-4 w-4 shrink-0 text-slate-700" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 pt-4">
              <Link
                to="/register"
                className="flex min-h-[50px] w-full items-center justify-center rounded-[5px] border border-slate-400 bg-white px-6 py-3.5 text-sm font-semibold text-[#0D1014] transition-colors duration-150 hover:bg-slate-950 hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
              >
                <span>Regístrate para recibir novedades del plan</span>
              </Link>
              <p className="mt-3 text-center text-xs text-foregroundMuted">
                Propuesta en desarrollo para la comunidad académica
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default FreeTrialAndStudentPlan;

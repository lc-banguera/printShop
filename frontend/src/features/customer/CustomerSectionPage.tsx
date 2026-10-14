import type { ElementType } from "react";
import {
  ArrowRight,
  Bell,
  CreditCard,
  HelpCircle,
  Mail,
  MapPin,
  PackageCheck,
  ShieldCheck,
  TicketPercent,
  Undo2,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface SectionMeta {
  title: string;
  subtitle: string;
  status?: string;
  icon: ElementType;
  action?: { label: string; href: string };
  cards?: Array<{ title: string; description: string; icon: ElementType }>;
}

const sectionConfig: Record<string, SectionMeta> = {
  "/account/addresses": {
    title: "Mis direcciones",
    subtitle: "Direcciones de entrega y facturación guardadas para tus pedidos.",
    icon: MapPin,
    action: { label: "Ir al resumen", href: "/account" },
  },
  "/account/coupons": {
    title: "Cupones y descuentos",
    subtitle: "Beneficios disponibles y códigos promocionales aplicables.",
    status: "Tres cupones de muestra disponibles para evaluar la interfaz.",
    icon: TicketPercent,
    cards: [
      { title: "BIENVENIDA", description: "15% de muestra para nuevos usuarios.", icon: TicketPercent },
      { title: "PRINTSHOP10", description: "10% de muestra para productos seleccionados.", icon: PackageCheck },
    ],
  },
  "/account/returns": {
    title: "Devoluciones",
    subtitle: "Solicitudes de cambios, garantías y seguimiento de casos.",
    status: "No hay solicitudes reales abiertas en esta sesión.",
    icon: Undo2,
    action: { label: "Ver pedidos", href: "/account/orders" },
    cards: [
      { title: "Garantía de calidad", description: "Los casos se gestionan desde pedidos completados.", icon: ShieldCheck },
      { title: "Seguimiento", description: "El historial aparecerá cuando existan devoluciones registradas.", icon: PackageCheck },
    ],
  },
  "/account/notifications": {
    title: "Notificaciones",
    subtitle: "Avisos sobre pedidos, diseños, cupones y actividad de cuenta.",
    status: "No tienes notificaciones reales pendientes.",
    icon: Bell,
    cards: [
      { title: "Pedidos", description: "Recibe cambios de estado y entrega.", icon: PackageCheck },
      { title: "Correo", description: "Las confirmaciones se envían al correo registrado.", icon: Mail },
    ],
  },
  "/account/support": {
    title: "Soporte y ayuda",
    subtitle: "Asistencia para pedidos, diseños y uso del portal.",
    status: "Canal de ayuda preparado para integrarse con soporte.",
    icon: HelpCircle,
    cards: [
      { title: "Formatos de archivo", description: "Revisa recomendaciones para PNG, JPG, WEBP y SVG.", icon: HelpCircle },
      { title: "Pedidos", description: "Consulta dudas de producción y tiempos de entrega.", icon: PackageCheck },
    ],
  },
};

export function CustomerSectionPage() {
  const { pathname } = useLocation();
  const section = sectionConfig[pathname] ?? sectionConfig["/account/notifications"];
  const Icon = section.icon;
  const isAddressPage = pathname === "/account/addresses";

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-primary/10 text-primary">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{section.title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-foregroundMuted">{section.subtitle}</p>
          </div>
        </div>
        <Link
          to={section.action?.href ?? "/account"}
          className="inline-flex h-9 items-center gap-1.5 self-start rounded-control border border-border bg-surface px-3.5 text-xs font-semibold text-foreground shadow-subtle transition-all hover:bg-surfaceMuted active:scale-[0.98] sm:self-auto"
        >
          <span>{section.action?.label ?? "Volver al resumen"}</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      {isAddressPage ? (
        <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 rounded-card border border-border bg-surface p-6 shadow-subtle sm:flex-row sm:p-8 sm:text-left">
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center" aria-hidden="true">
            <span className="absolute h-16 w-16 rounded-2xl border border-border bg-surfaceMuted" />
            <span className="absolute flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-subtle">
              <MapPin className="h-8 w-8" strokeWidth={1.7} />
            </span>
          </div>
          <div className="min-w-0 text-center sm:text-left">
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Aún no tienes direcciones guardadas
            </h2>
            <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-foregroundMuted">
              Tus direcciones de entrega y facturación aparecerán aquí cuando las guardes.
            </p>
          </div>
        </section>
      ) : (
        <>
          {section.status && (
            <section className="rounded-card border border-border bg-surface p-4 shadow-subtle">
              <div className="flex items-start gap-3 rounded-control bg-surfaceMuted p-3.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-surface text-primary">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Estado</h2>
                  <p className="mt-0.5 text-xs leading-relaxed text-foregroundMuted">{section.status}</p>
                </div>
              </div>
            </section>
          )}

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {section.cards?.map((card) => {
              const CardIcon = card.icon;
              return (
                <article key={card.title} className="rounded-card border border-border bg-surface p-4 shadow-subtle">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-primary/10 text-primary">
                      <CardIcon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{card.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-foregroundMuted">{card.description}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}

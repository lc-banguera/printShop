import React from 'react';

/**
 * ── Logo Oficial de Mercado Pago ─────────────────────────────────────
 * SVG fiel al branding oficial: isotipo azul celeste + wordmark azul marino.
 * viewBox escalado para máxima legibilidad.
 */
export function MercadoPagoOfficialLogo({
  className = 'h-8 w-auto',
}: {
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 680 180"
      className={className}
      aria-label="Mercado Pago"
      role="img"
    >
      {/* ── Isotipo: círculo celeste con figura blanca ── */}
      <circle cx="90" cy="90" r="85" fill="#00B1EA" />
      {/* Ala superior blanca */}
      <path
        d="M48 72 C55 50, 90 42, 115 55 C130 63, 148 80, 152 98
           C120 88, 88 86, 65 100 C60 90, 52 82, 48 72Z"
        fill="#ffffff"
      />
      {/* Cuerpo inferior blanco */}
      <path
        d="M65 100 C88 86, 120 88, 152 98
           C148 118, 130 132, 112 136
           C92 140, 68 132, 58 118 C58 112, 60 105, 65 100Z"
        fill="#ffffff"
      />
      {/* Puntos decorativos */}
      <circle cx="62" cy="62" r="6" fill="#ffffff" opacity="0.7" />
      <circle cx="48" cy="96" r="5" fill="#ffffff" opacity="0.5" />

      {/* ── Wordmark: "mercado pago" ── */}
      {/* "mercado" */}
      <text
        x="192"
        y="80"
        fill="#009EE3"
        fontSize="52"
        fontFamily="'Helvetica Neue', Arial, sans-serif"
        fontWeight="700"
        letterSpacing="-0.5"
      >
        mercado
      </text>
      {/* "pago" */}
      <text
        x="192"
        y="145"
        fill="#1A1F71"
        fontSize="52"
        fontFamily="'Helvetica Neue', Arial, sans-serif"
        fontWeight="700"
        letterSpacing="-0.5"
      >
        pago
      </text>
    </svg>
  );
}

/**
 * ── Logo Oficial de Wompi (by Bancolombia) ──────────────────────────
 * Cinta de 4 colores corporativos + wordmark oficial.
 * Proporciones y colores fieles a la guía de marca de Wompi.
 */
export function WompiOfficialLogo({
  className = 'h-8 w-auto',
}: {
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 340 100"
      className={className}
      aria-label="Wompi by Bancolombia"
      role="img"
    >
      {/* ── Cinta de 4 cuadrantes corporativos ── */}
      {/* Cuadrante amarillo (superior izquierdo) */}
      <rect x="4" y="4" width="22" height="22" rx="3" fill="#FDDA24" />
      {/* Cuadrante cian (superior derecho) */}
      <rect x="28" y="4" width="22" height="22" rx="3" fill="#00C8FF" />
      {/* Cuadrante magenta (inferior izquierdo) */}
      <rect x="4" y="28" width="22" height="22" rx="3" fill="#E5007D" />
      {/* Cuadrante violeta/Bancolombia (inferior derecho) */}
      <rect x="28" y="28" width="22" height="22" rx="3" fill="#2D0C4E" />

      {/* ── Wordmark "wompi" ── */}
      <text
        x="62"
        y="45"
        fill="#0A0F2C"
        fontSize="40"
        fontFamily="'Helvetica Neue', Arial, sans-serif"
        fontWeight="800"
        letterSpacing="-1"
      >
        wompi
      </text>

      {/* ── Endorsement "by Bancolombia" ── */}
      <text
        x="63"
        y="70"
        fill="#64748B"
        fontSize="15"
        fontFamily="'Helvetica Neue', Arial, sans-serif"
        fontWeight="500"
        letterSpacing="0.2"
      >
        by Bancolombia
      </text>
    </svg>
  );
}

/**
 * ── Logo Oficial de PSE (ACH Colombia) ──────────────────────────────
 * PSE – Pagos Seguros en Línea.
 * Wordmark fiel al branding oficial: fondo blanco, tipografía corporativa,
 * color verde #00A94F y tipografía azul #004A8F.
 */
export function PSEOfficialLogo({
  className = 'h-8 w-auto',
}: {
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 160 60"
      className={className}
      aria-label="PSE - Pagos Seguros en Línea"
      role="img"
    >
      {/* Fondo blanco con borde sutil */}
      <rect x="1" y="1" width="158" height="58" rx="6" fill="#ffffff" stroke="#E2E8F0" strokeWidth="1.5" />

      {/* Franja verde corporativa izquierda */}
      <rect x="1" y="1" width="10" height="58" rx="5" fill="#00A94F" />
      <rect x="6" y="1" width="5" height="58" fill="#00A94F" />

      {/* Letras "PSE" en azul corporativo */}
      <text
        x="24"
        y="40"
        fill="#004A8F"
        fontSize="30"
        fontFamily="'Helvetica Neue', Arial, sans-serif"
        fontWeight="900"
        letterSpacing="2"
      >
        PSE
      </text>

      {/* Línea separadora */}
      <line x1="108" y1="12" x2="108" y2="48" stroke="#CBD5E1" strokeWidth="1.2" />

      {/* Texto secundario "Pagos Seguros" */}
      <text
        x="116"
        y="26"
        fill="#475569"
        fontSize="8.5"
        fontFamily="'Helvetica Neue', Arial, sans-serif"
        fontWeight="600"
      >
        Pagos
      </text>
      <text
        x="116"
        y="37"
        fill="#475569"
        fontSize="8.5"
        fontFamily="'Helvetica Neue', Arial, sans-serif"
        fontWeight="600"
      >
        Seguros
      </text>
      <text
        x="116"
        y="48"
        fill="#475569"
        fontSize="8.5"
        fontFamily="'Helvetica Neue', Arial, sans-serif"
        fontWeight="600"
      >
        en Línea
      </text>
    </svg>
  );
}

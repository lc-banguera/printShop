import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { VerificationHeader } from "./components/VerificationHeader";
import { VerificationProgress } from "./components/VerificationProgress";
import { MethodSelectionStep } from "./components/MethodSelectionStep";
import { VerificationQRCode } from "./components/VerificationQRCode";
import { useDeviceDetection } from "./utils/deviceDetection";
import { MethodType } from "./types";
import { createDiditSession, getDiditStatus } from "./didit-api";
import { useAuthStore } from "@/features/auth";

export default function IdentityVerificationPage() {
  const navigate = useNavigate();
  const { isDesktop } = useDeviceDetection();
  const accessToken = useAuthStore((state) => state.user?.accessToken);

  // Estados del flujo
  const [currentStep, setCurrentStep] = useState<"method" | "qr">("method");
  const [selectedMethod, setSelectedMethod] = useState<MethodType | null>(null);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);

  // Cerrar flujo y volver a resumen de tienda
  const handleClose = () => {
    navigate("/onboarding");
  };

  /**
   * Al seleccionar CUALQUIER método:
   * Identifica si es Desktop (PC) o Mobile (Celular):
   * - PC: Muestra pantalla centrada con QR para continuar desde celular.
   * - Mobile: Abre directamente la cámara del dispositivo.
   */
  const handleSelectMethod = async (method: MethodType) => {
    setSelectedMethod(method);
    try {
      const session = await createDiditSession(accessToken);
      if (isDesktop) {
        setVerificationUrl(session.verificationUrl);
        setCurrentStep("qr");
      } else {
        window.location.assign(session.verificationUrl);
      }
    } catch (error) {
      setSelectedMethod(null);
      window.alert(error instanceof Error ? error.message : "No fue posible iniciar la verificación.");
    }
  };

  // Retornar a la pantalla inicial aprobada de selección de métodos
  const handleBackToMethods = () => {
    setSelectedMethod(null);
    setVerificationUrl(null);
    setCurrentStep("method");
  };

  useEffect(() => {
    if (currentStep !== "qr") return;
    let cancelled = false;
    const interval = window.setInterval(async () => {
      try {
        const result = await getDiditStatus(accessToken);
        if (!cancelled && ["APPROVED", "REJECTED"].includes(result.status)) {
          window.clearInterval(interval);
          navigate("/onboarding");
        }
      } catch {
        // The session flow remains available if a transient status refresh fails.
      }
    }, 8000);
    const timeout = window.setTimeout(() => window.clearInterval(interval), 10 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [accessToken, currentStep, navigate]);

  // Paso actual para el stepper superior (1: Selección de método, 2: Datos/Captura)
  const currentStepNumber = currentStep === "method" ? 1 : 2;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-10 px-4 flex items-center justify-center antialiased select-none">
      {/* Contenedor Principal Centrado de Verificación */}
      <div className="w-full max-w-[480px] bg-white rounded-3xl border border-gray-100/90 shadow-sm p-5 sm:p-7 relative overflow-hidden">
        {/* Encabezado con Logo oficial PrintShop, Cuenta activa 1/1 y Cierre */}
        <div className="relative z-10">
          <VerificationHeader onClose={handleClose} />

          {/* Stepper de Progreso */}
          <VerificationProgress currentStepIndex={currentStepNumber} />

          {/* 1. PANTALLA INICIAL APROBADA: Selección del método */}
          {currentStep === "method" && (
            <MethodSelectionStep
              selectedMethod={selectedMethod}
              onSelectMethod={handleSelectMethod}
              onContactClick={() => alert("Contactando soporte de PrintShop...")}
            />
          )}

          {/* 2. FLUJO PC / DESKTOP: Pantalla centrada con Código QR */}
          {currentStep === "qr" && (
            <VerificationQRCode
              verificationUrl={verificationUrl || ""}
              onCancel={handleBackToMethods}
              onContactClick={() => alert("Contactando soporte de PrintShop...")}
            />
          )}

        </div>

        {/* Marca de agua sutil en onda azul (esquina inferior derecha) */}
        <svg
          className="absolute -bottom-4 -right-4 w-36 h-28 pointer-events-none opacity-40 z-0"
          viewBox="0 0 144 112"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 112C45 112 75 75 112 75C132 75 144 92 144 112H0Z"
            fill="#BFDBFE"
          />
          <path
            d="M42 112C72 112 95 88 122 88C136 88 144 98 144 112H42Z"
            fill="#93C5FD"
            opacity="0.6"
          />
        </svg>
      </div>
    </div>
  );
}

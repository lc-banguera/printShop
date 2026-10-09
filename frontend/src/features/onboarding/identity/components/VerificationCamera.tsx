import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Camera, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { MethodType } from "../types";

interface VerificationCameraProps {
  method: MethodType;
  onBack: () => void;
  onCaptureComplete?: (photoDataUrl: string) => void;
}

export const VerificationCamera: React.FC<VerificationCameraProps> = ({
  method,
  onBack,
  onCaptureComplete,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  // Determinar facingMode inicial según método
  const isFacial = method === "facial";
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    isFacial ? "user" : "environment"
  );

  const methodTitle =
    method === "document"
      ? "Captura de documento"
      : method === "facial"
      ? "Verificación facial"
      : "Verificación de identidad";

  const instructions =
    method === "document"
      ? "Enfoca tu documento de identidad dentro del marco asegurando buena iluminación."
      : method === "facial"
      ? "Centra tu rostro dentro del visor manteniendo la mirada fija a la cámara."
      : "Apunta la cámara hacia tu documento o credencial.";

  // Iniciar la cámara del dispositivo
  const startCamera = async (mode: "user" | "environment") => {
    try {
      setErrorMessage(null);

      // Detener stream previo si existe
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("API de cámara no soportada en este navegador.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setHasPermission(true);
    } catch (err: any) {
      console.warn("Error al acceder a la cámara:", err);
      setHasPermission(false);
      setErrorMessage(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Permiso de cámara denegado. Permite el acceso a la cámara en los ajustes de tu navegador."
          : err.name === "NotFoundError" || err.name === "DevicesNotFoundError"
          ? "No se detectó ninguna cámara disponible en este dispositivo."
          : "No se pudo acceder a la cámara del dispositivo."
      );
    }
  };

  useEffect(() => {
    startCamera(facingMode);

    return () => {
      // Limpieza exhaustiva de tracks de video al desmontar
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  // Capturar frame del video
  const handleCapture = () => {
    if (!videoRef.current) return;

    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Si es cámara frontal (selfie), espejar horizontalmente
      if (facingMode === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedImage(dataUrl);

      if (onCaptureComplete) {
        onCaptureComplete(dataUrl);
      }
    }
    setIsCapturing(false);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  const toggleCamera = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
  };

  return (
    <div className="w-full">
      {/* Barra de navegación superior */}
      <div className="flex items-center justify-between mt-3 mb-4">
        <button
          type="button"
          onClick={() => {
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((t) => t.stop());
            }
            onBack();
          }}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus:outline-hidden cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a métodos
        </button>

        {hasPermission && !capturedImage && (
          <button
            type="button"
            onClick={toggleCamera}
            className="inline-flex items-center gap-1 text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Cambiar cámara
          </button>
        )}
      </div>

      {/* Título & Instrucción */}
      <div className="mb-4">
        <h2 className="text-xl sm:text-[22px] font-bold text-[var(--text-primary)] tracking-tight">
          {methodTitle}
        </h2>
        <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] mt-1 leading-relaxed">
          {instructions}
        </p>
      </div>

      {/* Visor de Cámara */}
      <div className="relative w-full aspect-4/3 sm:aspect-16/10 bg-black rounded-2xl overflow-hidden shadow-md flex items-center justify-center">
        {/* Stream de Video */}
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${
                facingMode === "user" ? "scale-x-[-1]" : ""
              }`}
            />

            {/* Guía visual sobrepuesta según método */}
            {hasPermission && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                {isFacial ? (
                  /* Marco oval para rostro */
                  <div className="w-48 h-60 sm:w-56 sm:h-68 border-2 border-dashed border-[var(--primary)]/80 rounded-[50%] shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] relative">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[11px] font-semibold text-white/90 bg-[var(--primary)]/80 px-2 py-0.5 rounded-full">
                      Rostro
                    </div>
                  </div>
                ) : (
                  /* Marco rectangular para documento con esquinas */
                  <div className="w-full max-w-[340px] aspect-85/54 border border-white/40 rounded-xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                    {/* Esquinas destacadas en azul PrintShop */}
                    <div className="absolute top-0 left-0 w-5 h-5 border-t-3 border-l-3 border-[var(--primary)] rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-5 h-5 border-t-3 border-r-3 border-[var(--primary)] rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-5 h-5 border-b-3 border-l-3 border-[var(--primary)] rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-5 h-5 border-b-3 border-r-3 border-[var(--primary)] rounded-br-lg" />

                    <div className="absolute top-2 left-3 text-[10px] font-semibold text-white/90 bg-black/40 px-2 py-0.5 rounded">
                      Documento de identidad
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* Vista previa de foto capturada */
          <div className="w-full h-full relative">
            <img
              src={capturedImage}
              alt="Captura"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 bg-[var(--success)] text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Foto capturada
            </div>
          </div>
        )}

        {/* Estado de error o sin permisos */}
        {hasPermission === false && (
          <div className="absolute inset-0 bg-slate-900 p-6 flex flex-col items-center justify-center text-center text-white">
            <AlertCircle className="w-10 h-10 text-[var(--warning)] mb-2" />
            <h3 className="text-sm font-bold">Acceso a cámara requerido</h3>
            <p className="text-xs text-gray-300 mt-1 max-w-xs leading-relaxed">
              {errorMessage || "Por favor otorga permisos de cámara a PrintShop."}
            </p>

            <button
              type="button"
              onClick={() => startCamera(facingMode)}
              className="mt-4 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Reintentar acceso
            </button>
          </div>
        )}
      </div>

      {/* Controles de Disparo / Confirmación */}
      <div className="mt-5 text-center">
        {!capturedImage ? (
          <button
            type="button"
            onClick={handleCapture}
            disabled={!hasPermission || isCapturing}
            className={`w-full py-3.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
              hasPermission
                ? "bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] text-white"
                : "bg-[var(--surface-strong)] text-[var(--text-muted)] cursor-not-allowed"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Capturar fotografía</span>
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleRetake}
              className="flex-1 py-3 px-4 border border-[var(--border-strong)] text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Tomar de nuevo
            </button>
            <button
              type="button"
              onClick={() => {
                alert("¡Fotografía validada con éxito en el dispositivo móvil!");
                onBack();
              }}
              className="flex-1 py-3 px-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Confirmar captura
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

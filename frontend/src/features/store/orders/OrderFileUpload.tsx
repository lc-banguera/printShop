import * as React from "react";
import {
  UploadCloud,
  FileText,
  X,
  ZoomIn,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { CustomizationAsset } from "./types";
import {
  MAX_FILE_SIZE_BYTES,
  validateOrderFile,
  formatFileSize,
} from "./orderFileConfig";

interface OrderFileUploadProps {
  files: CustomizationAsset[];
  onChange: (files: CustomizationAsset[]) => void;
  label?: string;
  helpText?: string;
  required?: boolean;
  multiple?: boolean;
  imagesOnly?: boolean;
  maxFiles?: number;
  disabled?: boolean;
  errorMessage?: string;
  onPreviewImage?: (imageUrl: string, title?: string) => void;
  className?: string;
}

export const OrderFileUpload: React.FC<OrderFileUploadProps> = ({
  files,
  onChange,
  label,
  helpText,
  required = false,
  multiple = false,
  imagesOnly = false,
  maxFiles = 6,
  disabled = false,
  errorMessage,
  onPreviewImage,
  className,
}) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);

  // Limpieza de URLs creadas al desmontar
  const createdUrlsRef = React.useRef<string[]>([]);

  React.useEffect(() => {
    return () => {
      // Limpiar object URLs locales creados para evitar memory leaks
      createdUrlsRef.current.forEach((url) => {
        try {
          if (url.startsWith("blob:")) {
            URL.revokeObjectURL(url);
          }
        } catch {
          // ignore
        }
      });
    };
  }, []);

  const handleFiles = (incomingFiles: FileList | File[]) => {
    setLocalError(null);
    const validAssets: CustomizationAsset[] = [];

    const fileArray = Array.from(incomingFiles);

    if (!multiple && fileArray.length > 1) {
      setLocalError("Solo puedes adjuntar un archivo para este campo.");
      return;
    }

    if (multiple && files.length + fileArray.length > maxFiles) {
      setLocalError(`Puedes adjuntar un máximo de ${maxFiles} archivos.`);
      return;
    }

    for (const file of fileArray) {
      const validation = validateOrderFile(file, { imagesOnly, maxSizeBytes: MAX_FILE_SIZE_BYTES });
      if (!validation.valid) {
        setLocalError(validation.errorMessage || "Archivo no válido.");
        return;
      }

      const url = URL.createObjectURL(file);
      createdUrlsRef.current.push(url);

      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

      const asset: CustomizationAsset = {
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        type: isPdf ? "DOCUMENT" : "IMAGE",
        name: file.name,
        url,
        mimeType: file.type || (isPdf ? "application/pdf" : "image/jpeg"),
        sizeBytes: file.size,
        fileSizeFormatted: formatFileSize(file.size),
      };

      validAssets.push(asset);
    }

    if (validAssets.length > 0) {
      if (multiple) {
        onChange([...files, ...validAssets]);
      } else {
        // En modo individual reemplaza el anterior
        if (files[0]?.url?.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(files[0].url);
          } catch {
            // ignore
          }
        }
        onChange(validAssets);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    // reset input value para permitir seleccionar el mismo archivo nuevamente si se eliminó
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (assetId: string) => {
    const target = files.find((f) => f.id === assetId);
    if (target?.url?.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(target.url);
      } catch {
        // ignore
      }
    }
    onChange(files.filter((f) => f.id !== assetId));
    setLocalError(null);
  };

  const displayError = localError || errorMessage;
  const isSingleAndHasFile = !multiple && files.length > 0;

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-[#475569] flex items-center gap-1">
            <span>{label}</span>
            {required && <span className="text-[#EF4444] font-bold">*</span>}
          </label>
          {multiple && files.length > 0 && (
            <span className="text-[10px] text-[#64748B]">
              {files.length} / {maxFiles} adjunto(s)
            </span>
          )}
        </div>
      )}

      {/* Input de archivo oculto */}
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={
          imagesOnly
            ? "image/jpeg,image/png,image/webp"
            : "image/jpeg,image/png,image/webp,application/pdf"
        }
        disabled={disabled}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* MODO GALERÍA MULTIPLE DE IMÁGENES (Ej. Control de Calidad / Incidencias) */}
      {imagesOnly && multiple && files.length > 0 ? (
        <div className="space-y-2">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="group relative aspect-square rounded-[4px] border border-[#E2E8F0] bg-[#F8FAFC] overflow-hidden"
              >
                <img
                  src={file.url}
                  alt={file.name}
                  onClick={() => onPreviewImage && onPreviewImage(file.url, file.name)}
                  className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-150"
                  title="Clic para ampliar vista previa"
                />

                {/* Overlay hover para ampliar */}
                <div
                  onClick={() => onPreviewImage && onPreviewImage(file.url, file.name)}
                  className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer pointer-events-none"
                >
                  <ZoomIn className="w-4 h-4 text-white drop-shadow-sm" />
                </div>

                {/* Botón eliminar discreto */}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(file.id);
                  }}
                  className="absolute top-1 right-1 w-5 h-5 rounded-[3px] bg-black/60 hover:bg-[#EF4444] text-white flex items-center justify-center transition-colors shadow-xs"
                  title="Eliminar imagen"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Botón añadir más si no alcanza el límite */}
            {files.length < maxFiles && !disabled && (
              <div
                onClick={() => inputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "aspect-square rounded-[4px] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#F1F5F9] hover:border-[#2563EB] flex flex-col items-center justify-center cursor-pointer transition-colors text-[#64748B] hover:text-[#2563EB] p-2 text-center",
                  isDragging && "border-[#2563EB] bg-[#EFF6FF]",
                )}
                title="Añadir más imágenes"
              >
                <UploadCloud className="w-4 h-4 mb-1" />
                <span className="text-[10px] font-medium leading-tight">Añadir foto</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ZONA DE CARGA PRINCIPAL (Dropzone sobrio) */
        (!isSingleAndHasFile || multiple) && (
          <div
            onClick={() => !disabled && inputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border border-dashed rounded-[4px] py-3 px-3 text-center cursor-pointer transition-colors select-none",
              isDragging
                ? "border-[#2563EB] bg-[#EFF6FF]"
                : displayError
                  ? "border-[#FCA5A5] bg-[#FEF2F2] hover:bg-[#FEE2E2]"
                  : "border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#F1F5F9] hover:border-[#94A3B8]",
              disabled && "opacity-50 cursor-not-allowed hover:bg-[#F8FAFC]",
            )}
          >
            <div className="flex items-center justify-center gap-2.5">
              <div
                className={cn(
                  "w-7 h-7 rounded-[4px] flex items-center justify-center shrink-0",
                  displayError
                    ? "bg-white text-[#EF4444] border border-[#FCA5A5]"
                    : "bg-white text-[#64748B] border border-[#E2E8F0]",
                )}
              >
                <UploadCloud className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <p className="text-xs text-[#334155]">
                  <span className="text-[#2563EB] font-medium hover:underline">Seleccionar archivo</span> o arrastrar aquí
                </p>
                <p className="text-[10px] text-[#64748B]">
                  {imagesOnly
                    ? "JPG, PNG o WebP (máx. 10 MB)"
                    : "PDF, JPG, PNG o WebP (máx. 10 MB)"}
                </p>
              </div>
            </div>
          </div>
        )
      )}

      {/* LISTA COMPACTA DE ARCHIVOS (Modo individual o lista de documentos) */}
      {!(imagesOnly && multiple) && files.length > 0 && (
        <div className="space-y-1 pt-0.5">
          {files.map((file) => {
            const isPdf = file.mimeType === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

            return (
              <div
                key={file.id}
                className="flex items-center justify-between p-2 rounded-[4px] border border-[#E2E8F0] bg-white gap-2 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Icono neutral de documento o thumbnail */}
                  {isPdf ? (
                    <div className="w-8 h-8 rounded-[4px] bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569] flex flex-col items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5" />
                      <span className="text-[7.5px] font-bold uppercase tracking-wider">PDF</span>
                    </div>
                  ) : (
                    <div
                      onClick={() => onPreviewImage && onPreviewImage(file.url, file.name)}
                      className="w-8 h-8 rounded-[4px] bg-[#F8FAFC] border border-[#E2E8F0] overflow-hidden shrink-0 cursor-pointer relative group"
                      title="Clic para ampliar vista previa"
                    >
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                        <ZoomIn className="w-3 h-3" />
                      </div>
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[#111827] truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-[#64748B]">
                      {file.fileSizeFormatted || "Archivo adjunto"}
                    </p>
                  </div>
                </div>

                {/* Acciones limpias y compactas */}
                <div className="flex items-center gap-1 shrink-0">
                  {!isPdf && onPreviewImage && (
                    <button
                      type="button"
                      onClick={() => onPreviewImage(file.url, file.name)}
                      className="p-1 text-[#64748B] hover:text-[#2563EB] hover:bg-[#F1F5F9] rounded-[4px] transition-colors"
                      title="Ampliar vista previa"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {!multiple && (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => inputRef.current?.click()}
                      className="px-2 py-0.5 text-[#475569] hover:text-[#2563EB] hover:bg-[#F1F5F9] rounded-[4px] transition-colors text-[10.5px] font-medium"
                      title="Reemplazar archivo"
                    >
                      Reemplazar
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleRemove(file.id)}
                    className="p-1 text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-[4px] transition-colors"
                    title="Eliminar archivo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Texto de ayuda opcional (solo si no hay error) */}
      {helpText && !displayError && (
        <p className="text-[10.5px] text-[#64748B] leading-normal">{helpText}</p>
      )}

      {/* Error Inline sobrio */}
      {displayError && (
        <p className="text-[10.5px] text-[#EF4444] font-medium flex items-center gap-1 pt-0.5">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{displayError}</span>
        </p>
      )}
    </div>
  );
};

export default OrderFileUpload;

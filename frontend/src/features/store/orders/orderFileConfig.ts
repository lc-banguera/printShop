/**
 * Configuración y reglas centralizadas para archivos en el módulo de Pedidos
 */

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const ALLOWED_DOC_TYPES = [
  "application/pdf",
];

export const ALLOWED_ALL_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_DOC_TYPES,
];

/**
 * Formatea el peso del archivo de forma amigable (ej. "2.4 MB", "420 KB")
 */
export function formatFileSize(bytes?: number): string {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return "";
  if (bytes === 0) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface FileValidationResult {
  valid: boolean;
  errorMessage?: string;
}

/**
 * Valida un archivo individual de acuerdo a las reglas del módulo.
 */
export function validateOrderFile(
  file: File,
  options?: {
    imagesOnly?: boolean;
    maxSizeBytes?: number;
  },
): FileValidationResult {
  const maxSize = options?.maxSizeBytes ?? MAX_FILE_SIZE_BYTES;
  const allowed = options?.imagesOnly ? ALLOWED_IMAGE_TYPES : ALLOWED_ALL_TYPES;

  // Validación de tipo
  const fileType = file.type.toLowerCase();
  const fileExtension = file.name.split(".").pop()?.toLowerCase();

  const isAllowedMime = allowed.includes(fileType);
  const isAllowedExt = options?.imagesOnly
    ? ["jpg", "jpeg", "png", "webp"].includes(fileExtension || "")
    : ["jpg", "jpeg", "png", "webp", "pdf"].includes(fileExtension || "");

  if (!isAllowedMime && !isAllowedExt) {
    return {
      valid: false,
      errorMessage: options?.imagesOnly
        ? "Formato no permitido. Solo se aceptan fotografías (JPG, PNG, WebP)."
        : "Formato no permitido. Solo se aceptan imágenes (JPG, PNG, WebP) o documentos PDF.",
    };
  }

  // Validación de tamaño
  if (file.size > maxSize) {
    return {
      valid: false,
      errorMessage: `El archivo "${file.name}" supera el tamaño máximo permitido de ${formatFileSize(maxSize)}.`,
    };
  }

  return { valid: true };
}

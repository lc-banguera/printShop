import { StoreOrderFull, OrderItemSnapshot } from "./types";

export interface OrderCheckItem {
  id: string;
  label: string;
  description?: string;
  required: boolean;
}

/**
 * Determina si el pedido involucra personalización o diseño
 */
function hasCustomization(items: OrderItemSnapshot[]): boolean {
  if (items.length === 0) return false;
  return items.some((item) => {
    // Si fulfillmentType indica listo para despacho de stock y no tiene diseño asociado
    if (item.fulfillmentType === "READY_TO_SHIP") {
      return Boolean(
        item.designName ||
        item.designId ||
        item.designSnapshot ||
        item.designTechnique ||
        item.customizationSpec ||
        item.customization ||
        (item.uploadedAssets && item.uploadedAssets.length > 0),
      );
    }
    return true;
  });
}

/**
 * Determina si los productos del pedido manejan variantes diferenciadas (talla, color, etc.)
 */
function hasVariants(items: OrderItemSnapshot[]): boolean {
  return items.some((item) => {
    const size = (item.variantSnapshot?.size || item.size || "").trim().toLowerCase();
    const color = (item.variantSnapshot?.color || item.color || "").trim().toLowerCase();
    const hasSize =
      size !== "" &&
      size !== "única" &&
      size !== "unica" &&
      size !== "n/a" &&
      size !== "estándar" &&
      size !== "estandar";
    const hasColor =
      color !== "" &&
      color !== "n/a" &&
      color !== "estándar" &&
      color !== "estandar";
    const hasVariantText = Boolean(
      item.variant &&
      item.variant.trim() !== "" &&
      item.variant.toLowerCase() !== "estándar" &&
      item.variant.toLowerCase() !== "n/a",
    );
    return hasSize || hasColor || hasVariantText;
  });
}

/**
 * Determina si el pedido incluye instrucciones o requerimientos especiales del cliente
 */
function hasSpecialInstructions(items: OrderItemSnapshot[]): boolean {
  return items.some(
    (i) =>
      Boolean(i.customerRequirements?.instructions?.trim()) ||
      Boolean(i.customerRequirements?.requestedPlacement?.trim()) ||
      Boolean(i.customizationSpec?.textInstructions?.trim()),
  );
}

/**
 * Genera el checklist de verificación previa para INICIAR PRODUCCIÓN
 * Principio: ¿El pedido está listo para entrar en producción?
 * Verificaciones generales, operativas y escalables para cualquier técnica o categoría.
 */
export function getProductionChecks(order: StoreOrderFull): OrderCheckItem[] {
  const items = order.items || [];
  const checks: OrderCheckItem[] = [];

  // 1. Materiales e insumos
  checks.push({
    id: "prod_materials_supplies",
    label: "Materiales e insumos disponibles",
    description:
      "Los materiales, productos base e insumos requeridos para este pedido están disponibles.",
    required: true,
  });

  // 2. Diseño y especificaciones (Dinámico: solo si el pedido incluye personalización/diseño)
  if (hasCustomization(items)) {
    checks.push({
      id: "prod_design_specs",
      label: "Diseño y especificaciones verificadas",
      description:
        "Los diseños, personalizaciones y especificaciones del pedido están disponibles y corresponden a lo solicitado.",
      required: true,
    });
  }

  // 3. Recursos de producción
  checks.push({
    id: "prod_production_resources",
    label: "Recursos de producción preparados",
    description:
      "Los recursos necesarios para fabricar este pedido están disponibles y preparados.",
    required: true,
  });

  // 4. Información del pedido (Dinámico: ajusta mención de variantes si aplican)
  if (hasVariants(items)) {
    checks.push({
      id: "prod_order_info",
      label: "Cantidades, variantes y especificaciones verificadas",
      description:
        "Las cantidades, variantes y especificaciones del pedido fueron verificadas.",
      required: true,
    });
  } else {
    checks.push({
      id: "prod_order_info",
      label: "Cantidades y especificaciones verificadas",
      description:
        "Las cantidades y especificaciones del pedido fueron verificadas.",
      required: true,
    });
  }

  // 5. Requerimientos especiales del cliente (Dinámico: solo si existen notas o instrucciones)
  if (hasSpecialInstructions(items)) {
    checks.push({
      id: "prod_customer_instructions",
      label: "Instrucciones especiales revisadas",
      description:
        "Las notas e instrucciones particulares del cliente fueron verificadas para el proceso.",
      required: true,
    });
  }

  return checks;
}

/**
 * Genera el checklist de control de calidad (QC) para MARCAR COMO TERMINADO
 * Principio: ¿El producto fabricado cumple la calidad para pasar al siguiente paso?
 * Verificaciones generales, operativas y escalables.
 */
export function getQualityChecks(order: StoreOrderFull): OrderCheckItem[] {
  const items = order.items || [];
  const checks: OrderCheckItem[] = [];

  // 1. Producto terminado
  checks.push({
    id: "qc_finished_product",
    label: "Producto fabricado según especificaciones",
    description:
      "El producto fue fabricado según las especificaciones del pedido.",
    required: true,
  });

  // 2. Personalización / acabado (Dinámico: solo si aplica personalización)
  if (hasCustomization(items)) {
    checks.push({
      id: "qc_customization_finish",
      label: "Acabado o personalización conforme",
      description:
        "El acabado o personalización corresponde a lo solicitado.",
      required: true,
    });
  }

  // 3. Revisión final sin defectos visibles
  checks.push({
    id: "qc_visual_inspection",
    label: "Revisión final sin defectos visibles",
    description:
      "El producto fue revisado y no presenta defectos visibles.",
    required: true,
  });

  // 4. Preparación y protección
  checks.push({
    id: "qc_packaging_preparation",
    label: "Producto protegido y preparado",
    description:
      "El producto está correctamente protegido y preparado para continuar al siguiente paso.",
    required: true,
  });

  return checks;
}

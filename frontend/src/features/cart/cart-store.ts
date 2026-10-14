import { create } from 'zustand';

export type CartItemType = 'product' | 'design';

export interface CartItem {
  id: string;
  itemType?: CartItemType;
  itemId?: string;
  productId: string;
  designId?: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image: string;
  color?: string;
  size?: string;
  category?: string;
  /** Extended per-product variant attributes (fabricQuality, capacity, material, etc.) */
  customAttributes?: Record<string, string>;
  quantity: number;
  inStock: boolean;
  author?: string;
  format?: string;
  license?: string;
}

interface CartStore {
  items: CartItem[];
  isDrawerOpen: boolean;
  couponCode: string;
  discountRate: number; // e.g. 0.10 for 10%
  isApplyingCoupon: boolean;
  couponError: string | null;
  couponSuccess: string | null;

  // Controles de Drawer
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;

  // ── Operaciones del Carrito (Requisito 6) ──────────────────────────
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;

  // Cupones
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;

  // Valores calculados
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getShippingAmount: () => number;
  getTotal: () => number;
  getTotalItemsCount: () => number;
  itemCount: () => number; // Alias requerido
}

export function formatCurrency(amount: number): string {
  return `$ ${amount.toLocaleString('es-CO')}`;
}

const CART_STORAGE_KEY = 'printshop_cart_v1';

// Cargar items iniciales desde localStorage o comenzar vacío
const loadStoredCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// Persistir items en localStorage
const persistCart = (items: CartItem[]) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error al persistir carrito:', error);
  }
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: loadStoredCart(),
  isDrawerOpen: false,
  couponCode: '',
  discountRate: 0,
  isApplyingCoupon: false,
  couponError: null,
  couponSuccess: null,

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

  // ── Operación addItem unificada para productos y diseños ──────────
  addItem: (newItem) => {
    set((state) => {
      const newItemType: CartItemType = newItem.itemType || 'product';
      const isDesign = newItemType === 'design';
      const targetItemId = newItem.itemId || newItem.productId || newItem.designId || '';

      const normalize = (v?: string) => (v ? v.trim().toLowerCase() : "");
      const attrsKey = (attrs?: Record<string, string>) =>
        JSON.stringify(Object.entries(attrs || {}).sort());

      const existingIndex = state.items.findIndex((item) => {
        const itemType = item.itemType || 'product';
        const currentItemId = item.itemId || item.productId || item.designId || '';

        // ── A. Si es DISEÑO: identificación por itemType + itemId ───
        if (isDesign || itemType === 'design') {
          return itemType === 'design' && currentItemId === targetItemId;
        }

        // ── B. Si es PRODUCTO FÍSICO: comprobación por itemId + color + size + customAttributes ───
        return (
          itemType === newItemType &&
          currentItemId === targetItemId &&
          normalize(item.color) === normalize(newItem.color) &&
          normalize(item.size) === normalize(newItem.size) &&
          attrsKey(item.customAttributes) === attrsKey(newItem.customAttributes)
        );
      });

      const qtyToAdd = newItem.quantity && newItem.quantity > 0 ? newItem.quantity : 1;

      if (existingIndex > -1) {
        // YA EXISTE: incrementar cantidad en la misma línea. NUNCA crear duplicados.
        const updated = [...state.items];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qtyToAdd,
          inStock: true,
        };
        persistCart(updated);
        return { items: updated };
      }

      // NO EXISTE: Agregar como nuevo item con quantity especificada
      const generatedId = `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const itemToInsert: CartItem = {
        ...newItem,
        id: generatedId,
        itemType: newItemType,
        itemId: targetItemId,
        productId: newItem.productId || targetItemId,
        designId: isDesign ? targetItemId : newItem.designId,
        quantity: qtyToAdd,
        inStock: isDesign ? true : newItem.inStock !== undefined ? newItem.inStock : true,
      };

      const updated = [...state.items, itemToInsert];
      persistCart(updated);
      return {
        items: updated,
      };
    });
  },

  removeItem: (id: string) => {
    set((state) => {
      const updated = state.items.filter((item) => item.id !== id);
      persistCart(updated);
      return { items: updated };
    });
  },

  updateQuantity: (id: string, quantity: number) => {
    if (quantity < 1) return;
    set((state) => {
      const updated = state.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );
      persistCart(updated);
      return { items: updated };
    });
  },

  increaseQuantity: (id: string) => {
    const item = get().items.find((i) => i.id === id);
    if (item) {
      get().updateQuantity(id, item.quantity + 1);
    }
  },

  decreaseQuantity: (id: string) => {
    const item = get().items.find((i) => i.id === id);
    if (item) {
      if (item.quantity > 1) {
        get().updateQuantity(id, item.quantity - 1);
      } else {
        get().removeItem(id);
      }
    }
  },

  clearCart: () => {
    persistCart([]);
    set({ items: [], couponCode: '', discountRate: 0, couponSuccess: null });
  },

  applyCoupon: async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      set({ couponError: 'Ingresa un código de cupón válido.' });
      return false;
    }

    set({ isApplyingCoupon: true, couponError: null, couponSuccess: null });

    await new Promise((resolve) => setTimeout(resolve, 600));

    if (cleanCode === 'PRINTSHOP10' || cleanCode === 'DESCUENTO10') {
      set({
        couponCode: cleanCode,
        discountRate: 0.1,
        couponSuccess: '¡Cupón del 10% aplicado correctamente!',
        couponError: null,
        isApplyingCoupon: false,
      });
      return true;
    }

    if (cleanCode === 'BIENVENIDA' || cleanCode === 'PRINTSHOP15') {
      set({
        couponCode: cleanCode,
        discountRate: 0.15,
        couponSuccess: '¡Cupón de bienvenida del 15% aplicado!',
        couponError: null,
        isApplyingCoupon: false,
      });
      return true;
    }

    set({
      couponError: 'El cupón ingresado no es válido o ha expirado.',
      couponSuccess: null,
      isApplyingCoupon: false,
    });
    return false;
  },

  removeCoupon: () => {
    set({
      couponCode: '',
      discountRate: 0,
      couponSuccess: null,
      couponError: null,
    });
  },

  getSubtotal: () => {
    const { items } = get();
    return items
      .filter((item) => item.inStock)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getDiscountAmount: () => {
    const subtotal = get().getSubtotal();
    const { discountRate } = get();
    return Math.round(subtotal * discountRate);
  },

  getShippingAmount: () => {
    const subtotal = get().getSubtotal();
    if (subtotal === 0) return 0;
    if (subtotal >= 150000) return 0;
    return 8000;
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscountAmount();
    const shipping = get().getShippingAmount();
    return Math.max(0, subtotal - discount + shipping);
  },

  // ── Requisito 7: Contador basado en cantidades reales sumadas ──────
  getTotalItemsCount: () => {
    const { items } = get();
    return items.reduce((count, item) => count + item.quantity, 0);
  },

  itemCount: () => {
    return get().getTotalItemsCount();
  },
}));

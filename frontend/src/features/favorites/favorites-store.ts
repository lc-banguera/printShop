import { create } from 'zustand';
import { Product, productsData } from '@/features/landing/data/products.data';

interface FavoritesState {
  // Mapa de favoritos por ID de usuario: { [userId: string]: string[] }
  favoritesByUser: Record<string, string[]>;
  
  // Acciones
  toggleFavorite: (productId: string, userId: string) => boolean;
  removeFavorite: (productId: string, userId: string) => void;
  isFavorite: (productId: string, userId?: string) => boolean;
  getUserFavoriteIds: (userId?: string) => string[];
  getUserFavoriteProducts: (userId?: string) => Product[];
  getFavoritesCount: (userId?: string) => number;
}

const STORAGE_KEY = 'printshop_favorites_v1';

// Cargar favoritos iniciales desde localStorage
const loadStoredFavorites = (): Record<string, string[]> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { 'usr-client-01': ['prod-1', 'prod-2'] };
  } catch {
    return { 'usr-client-01': ['prod-1', 'prod-2'] };
  }
};

// Guardar favoritos en localStorage
const persistFavorites = (data: Record<string, string[]>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error al persistir favoritos:', error);
  }
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoritesByUser: loadStoredFavorites(),

  toggleFavorite: (productId: string, userId: string) => {
    if (!userId) return false;

    let isNowFavorite = false;
    set((state) => {
      const userFavs = state.favoritesByUser[userId] || [];
      const exists = userFavs.includes(productId);
      const updatedUserFavs = exists
        ? userFavs.filter((id) => id !== productId)
        : [...userFavs, productId];

      isNowFavorite = !exists;
      const nextMap = {
        ...state.favoritesByUser,
        [userId]: updatedUserFavs,
      };

      persistFavorites(nextMap);
      return { favoritesByUser: nextMap };
    });

    return isNowFavorite;
  },

  removeFavorite: (productId: string, userId: string) => {
    if (!userId) return;

    set((state) => {
      const userFavs = state.favoritesByUser[userId] || [];
      const updatedUserFavs = userFavs.filter((id) => id !== productId);
      const nextMap = {
        ...state.favoritesByUser,
        [userId]: updatedUserFavs,
      };

      persistFavorites(nextMap);
      return { favoritesByUser: nextMap };
    });
  },

  isFavorite: (productId: string, userId?: string) => {
    if (!userId) return false;
    const userFavs = get().favoritesByUser[userId] || [];
    return userFavs.includes(productId);
  },

  getUserFavoriteIds: (userId?: string) => {
    if (!userId) return [];
    return get().favoritesByUser[userId] || [];
  },

  getUserFavoriteProducts: (userId?: string) => {
    if (!userId) return [];
    const ids = get().favoritesByUser[userId] || [];
    return productsData.filter((prod) => ids.includes(prod.id));
  },

  getFavoritesCount: (userId?: string) => {
    if (!userId) return 0;
    const ids = get().favoritesByUser[userId] || [];
    return ids.length;
  },
}));

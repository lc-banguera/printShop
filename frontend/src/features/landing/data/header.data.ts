import { getCategoryDisplayName, productsData } from './products.data';

export interface MenuItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
  dropdownItems?: { label: string; href: string }[];
}

export interface HeaderData {
  shippingMessage: string;
  helpText: string;
  helpHref: string;
  currentLanguage: string;
  languages: string[];
  logoText: string;
  logoTextAccent: string;
  logoSubtitle: string;
  searchPlaceholder: string;
  cartItemsCount: number;
  favoritesLabel: string;
  cartLabel: string;
  loginLabel: string;
  registerLabel: string;
  menuItems: MenuItem[];
}

const catalogCategories = Array.from(new Set(productsData.map((product) => product.category)))
  .sort((first, second) => getCategoryDisplayName(first).localeCompare(getCategoryDisplayName(second), 'es'))
  .map((category) => ({
    label: getCategoryDisplayName(category),
    href: `/products?category=${encodeURIComponent(category)}`,
  }));

export const headerData: HeaderData = {
  shippingMessage: 'Envío gratis en pedidos superiores a $100.000',
  helpText: 'Vender',
  helpHref: '/plans',
  currentLanguage: 'ES',
  languages: ['ES', 'EN'],
  logoText: 'Print',
  logoTextAccent: 'Shop',
  logoSubtitle: 'DISEÑA SIN LÍMITES',
  searchPlaceholder: 'Buscar productos, diseños y más...',
  cartItemsCount: 0,
  favoritesLabel: 'Favoritos',
  cartLabel: 'Carrito',
  loginLabel: 'Iniciar sesión',
  registerLabel: 'Crear cuenta',
  menuItems: [
    {
      label: 'Categorías',
      href: '#',
      hasDropdown: true,
      dropdownItems: catalogCategories,
    },
    {
      label: 'Productos',
      href: '/products',
    },
    {
      label: 'Diseños',
      href: '/designs',
    },
    {
      label: 'Recursos',
      href: '/resources',
    },
    {
      label: 'Cómo funciona',
      href: '/como-funciona',
    },
    {
      label: 'Vender',
      href: '/plans',
    },
  ],
};

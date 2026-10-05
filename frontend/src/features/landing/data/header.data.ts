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

export const headerData: HeaderData = {
  shippingMessage: 'Envío gratis en pedidos superiores a $100.000',
  helpText: 'Ayuda',
  helpHref: '#',
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
      label: 'Productos',
      href: '/products',
      hasDropdown: true,
      dropdownItems: [
        { label: 'Camisetas', href: '#' },
        { label: 'Hoodies', href: '#' },
        { label: 'Tazas', href: '#' },
        { label: 'Gorras', href: '#' },
        { label: 'Bolsos', href: '#' },
        { label: 'Sudaderas', href: '#' },
        { label: 'Stickers', href: '#' },
        { label: 'Botellas', href: '#' },
        { label: 'Accesorios', href: '#' },
      ],
    },
    {
      label: 'Diseños',
      href: '/designs',
    },
    {
      label: 'Plantillas',
      href: '/#plantillas',
    },
    {
      label: 'Cómo funciona',
      href: '/#como-funciona',
    },
    {
      label: 'Ayuda',
      href: '/#ayuda',
    },
  ],
};

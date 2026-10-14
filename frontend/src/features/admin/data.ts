// Shared mock data for all admin screens
import designImg1 from '@/resources/designs/img1.jpg';
import designImg2 from '@/resources/designs/img2.png';
import designImg3 from '@/resources/designs/img3.jpg';
import designImg4 from '@/resources/designs/img4.png';
import designImg5 from '@/resources/designs/img5.jpg';
import designImg6 from '@/resources/designs/img6.jpg';
import designImg7 from '@/resources/designs/img7.jpg';
import designImg8 from '@/resources/designs/img8.jpg';
import designImg9 from '@/resources/designs/img9.jpg';
import designImg10 from '@/resources/designs/img10.jpg';

export type DesignReview = {
  id?: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
  title?: string;
  verifiedPurchase?: boolean;
  images?: string[];
  helpfulCount?: number;
};

export type DesignSpec = {
  characteristic: string;
  detail: string;
};

export type AdminDesign = {
  id: string;
  name: string;
  author: string;
  store: string;
  category: string;
  status: string;
  sales: number;
  revenue: string;
  rating: number;
  date: string;
  image: string;
  images: string[];
  description: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  reviewsCount: number;
  technique: string;
  format: string;
  resolution: string;
  license: string;
  usage: string;
  tags: string[];
  colors: string[];
  specs: DesignSpec[];
  reviews: DesignReview[];
};

export const mockStores = [
  { id: '1', name: 'Creative Print Store', email: 'contacto@creativeprint.com', owner: 'Ana García', plan: 'Premium', status: 'Activa', orders: 156, revenue: '$8.450.000', joined: '18 Abr, 2026', logo: 'CP' },
  { id: '2', name: 'Urban Style Prints', email: 'hola@urbanstyle.com', owner: 'Carlos López', plan: 'Profesional', status: 'Activa', orders: 98, revenue: '$4.230.000', joined: '11 Abr, 2026', logo: 'US' },
  { id: '3', name: 'Print House CO', email: 'info@printhouse.com', owner: 'María Torres', plan: 'Básico', status: 'Activa', orders: 73, revenue: '$2.310.000', joined: '05 Abr, 2026', logo: 'PH' },
  { id: '4', name: 'Color Express', email: 'ventas@colorexpress.com', owner: 'Luis Mendoza', plan: 'Profesional', status: 'Inactiva', orders: 0, revenue: '$0', joined: '28 Mar, 2026', logo: 'CE' },
  { id: '5', name: 'Design It Now', email: 'hello@designitnow.com', owner: 'Sofia Ruiz', plan: 'Premium', status: 'Pendiente', orders: 0, revenue: '$0', joined: '21 May, 2026', logo: 'DI' },
  { id: '6', name: 'Merch Studio', email: 'studio@merch.com', owner: 'Diego Reyes', plan: 'Básico', status: 'Activa', orders: 45, revenue: '$1.120.000', joined: '02 Mar, 2026', logo: 'MS' },
  { id: '7', name: 'Ink & Wear', email: 'info@inkwear.com', owner: 'Valentina Cruz', plan: 'Profesional', status: 'Activa', orders: 88, revenue: '$3.650.000', joined: '15 Feb, 2026', logo: 'IW' },
  { id: '8', name: 'Art & Print', email: 'hola@artprint.com', owner: 'Andrés Villa', plan: 'Básico', status: 'Activa', orders: 22, revenue: '$890.000', joined: '10 Ene, 2026', logo: 'AP' },
];

export const mockUsers = [
  { id: '1', name: 'Andrés López', username: '@andres_lopez', email: 'andres.lopez@email.com', role: 'Cliente', status: 'Activo', joined: '18 Abr, 2026', lastLogin: 'Hoy, 09:42', orders: 12, avatar: 'AL' },
  { id: '2', name: 'María González', username: '@maria_gonzalez', email: 'maria.gonzalez@email.com', role: 'Cliente', status: 'Activo', joined: '15 Abr, 2026', lastLogin: 'Hoy, 08:15', orders: 7, avatar: 'MG' },
  { id: '3', name: 'Juan Pérez', username: '@juan_perez', email: 'juan.perez@email.com', role: 'Tienda', status: 'Activo', joined: '12 Abr, 2026', lastLogin: 'Ayer, 16:30', orders: 45, avatar: 'JP' },
  { id: '4', name: 'Laura Martínez', username: '@laura_martinez', email: 'laura.martinez@email.com', role: 'Cliente', status: 'Inactivo', joined: '05 Abr, 2026', lastLogin: 'Hace 10 días', orders: 0, avatar: 'LM' },
  { id: '5', name: 'Oscar Chávez', username: '@oscar_chavez', email: 'oscar.chavez@email.com', role: 'Cliente', status: 'Activo', joined: '02 Abr, 2026', lastLogin: 'Hoy, 11:20', orders: 3, avatar: 'OC' },
  { id: '6', name: 'Admin Principal', username: '@admin', email: 'admin@printshop.com', role: 'Super Admin', status: 'Activo', joined: '01 Ene, 2023', lastLogin: 'Ahora', orders: 0, avatar: 'SA' },
];

export const mockOrders = [
  { id: '#ORD-10254', idShort: '9BAD-1F28', customer: 'Carlos Pérez', customerEmail: 'carlos.perez@email.com', store: 'Creative Print Store', products: '4 productos', date: '02 May, 2026', time: '10:32 AM', total: '$189.900', status: 'En Producción', paymentStatus: 'Pagado' },
  { id: '#ORD-10253', idShort: '7834-2C1D', customer: 'María González', customerEmail: 'maria.gonzalez@email.com', store: 'Urban Style Prints', products: '2 productos', date: '02 May, 2026', time: '09:15 AM', total: '$99.800', status: 'Pendiente', paymentStatus: 'Pendiente' },
  { id: '#ORD-10252', idShort: 'AB12-8E7F', customer: 'Juan Ramírez', customerEmail: 'juan.ramirez@email.com', store: 'Print House CO', products: '5 productos', date: '01 May, 2026', time: '04:45 PM', total: '$259.900', status: 'Enviado', paymentStatus: 'Pagado' },
  { id: '#ORD-10251', idShort: 'C3D4-9G8H', customer: 'Laura Martínez', customerEmail: 'laura.martinez@email.com', store: 'Color Express', products: '3 productos', date: '01 May, 2026', time: '01:20 PM', total: '$149.900', status: 'Entregado', paymentStatus: 'Pagado' },
  { id: '#ORD-10250', idShort: 'D9E0-1J2K', customer: 'Andrés López', customerEmail: 'andres.lopez@email.com', store: 'Creative Print Store', products: '1 producto', date: '30 Abr, 2026', time: '11:05 AM', total: '$49.900', status: 'Cancelado', paymentStatus: 'Reembolsado' },
  { id: '#ORD-10249', idShort: 'L5M6-7N8P', customer: 'Sofia Herrera', customerEmail: 'sofia.herrera@email.com', store: 'Urban Style Prints', products: '2 productos', date: '30 Abr, 2026', time: '09:40 AM', total: '$89.900', status: 'En Aprobación', paymentStatus: 'Pendiente' },
  { id: '#ORD-10248', idShort: 'Q1R2-3S4T', customer: 'Diego Torres', customerEmail: 'diego.torres@email.com', store: 'Print House CO', products: '6 productos', date: '29 Abr, 2026', time: '03:30 PM', total: '$329.900', status: 'Pendiente', paymentStatus: 'Pendiente' },
  { id: '#ORD-10247', idShort: 'USV6-7W8X', customer: 'Valentina Ruiz', customerEmail: 'valentina.ruiz@email.com', store: 'Color Express', products: '1 producto', date: '29 Abr, 2026', time: '10:18 AM', total: '$29.900', status: 'Empaque', paymentStatus: 'Pagado' },
];

export const mockProducts = [
  { id: '1', name: 'Camiseta Personalizada', category: 'Ropa', store: 'Creative Print Store', price: '$45.900', stock: 120, status: 'Activo', sales: 234 },
  { id: '2', name: 'Taza Cerámica Premium', category: 'Accesorios', store: 'Print House CO', price: '$28.500', stock: 85, status: 'Activo', sales: 189 },
  { id: '3', name: 'Hoodie Estampado', category: 'Ropa', store: 'Urban Style Prints', price: '$85.000', stock: 45, status: 'Activo', sales: 98 },
  { id: '4', name: 'Gorra Bordada', category: 'Accesorios', store: 'Color Express', price: '$35.000', stock: 0, status: 'Agotado', sales: 67 },
  { id: '5', name: 'Botella Térmica', category: 'Accesorios', store: 'Merch Studio', price: '$42.000', stock: 60, status: 'Activo', sales: 145 },
  { id: '6', name: 'Stickers Pack', category: 'Papelería', store: 'Art & Print', price: '$18.000', stock: 300, status: 'Activo', sales: 412 },
  { id: '7', name: 'Maletín Personalizado', category: 'Accesorios', store: 'Creative Print Store', price: '$125.000', stock: 18, status: 'Activo', sales: 42 },
];

export const mockSubscriptions = [
  { id: '1', store: 'Creative Print Store', email: 'contacto@creativeprint.com', plan: 'Premium', status: 'Activa', startDate: '18 Abr, 2025', nextPayment: '18 May, 2026', amount: '$89.900', method: 'Mastercard •••• 4567' },
  { id: '2', store: 'Urban Style Prints', email: 'hola@urbanstyle.com', plan: 'Profesional', status: 'Activa', startDate: '11 Abr, 2026', nextPayment: '11 May, 2026', amount: '$49.900', method: 'VISA •••• 7890' },
  { id: '3', store: 'Print House CO', email: 'info@printhouse.com', plan: 'Básico', status: 'Activa', startDate: '05 Abr, 2026', nextPayment: '05 May, 2026', amount: '$19.900', method: 'Mastercard •••• 2345' },
  { id: '4', store: 'Color Express', email: 'ventas@colorexpress.com', plan: 'Profesional', status: 'Inactiva', startDate: '28 Mar, 2026', nextPayment: '—', amount: '$49.900', method: 'VISA •••• 3456' },
  { id: '5', store: 'Design It Now', email: 'hello@designitnow.com', plan: 'Premium', status: 'Pendiente', startDate: '21 May, 2026', nextPayment: '21 May, 2026', amount: '$89.900', method: 'Amex •••• 1005' },
];

export const mockPayments = [
  { id: 'TRX-2024-0008456', customer: 'Creative Print Store', type: 'Tienda', order: 'Pedido #ORD-54891', method: 'Tarjeta •••• 4242', amount: '$128.900', status: 'Completado', date: '20 May, 2026', time: '10:32 AM' },
  { id: 'TRX-2024-0008455', customer: 'María González', type: 'Cliente', order: 'Pedido #ORD-54890', method: 'Nequi •••• 2345', amount: '$89.000', status: 'Completado', date: '20 May, 2026', time: '10:15 AM' },
  { id: 'TRX-2024-0008454', customer: 'Urban Style Prints', type: 'Tienda', order: 'Suscripción Plan Pro', method: 'PSE Bancolombia', amount: '$49.900', status: 'Completado', date: '20 May, 2026', time: '09:48 AM' },
  { id: 'TRX-2024-0008453', customer: 'Carlos Pérez', type: 'Cliente', order: 'Pedido #ORD-54889', method: 'Mastercard •••• 8888', amount: '$67.800', status: 'Pendiente', date: '20 May, 2026', time: '09:15 AM' },
  { id: 'TRX-2024-0008452', customer: 'Print House CO', type: 'Tienda', order: 'Suscripción Plan Premium', method: 'PSE Davivieta', amount: '$499.000', status: 'Completado', date: '20 May, 2026', time: '08:22 AM' },
  { id: 'TRX-2024-0008451', customer: 'Laura Martínez', type: 'Cliente', order: 'Pedido #ORD-54888', method: 'Tarjeta •••• 1111', amount: '$45.500', status: 'Fallido', date: '19 May, 2026', time: '11:05 PM' },
  { id: 'TRX-2024-0008450', customer: 'Color Express', type: 'Tienda', order: 'Pedido #ORD-54887', method: 'Nequi •••• 9876', amount: '$234.600', status: 'Completado', date: '19 May, 2026', time: '10:30 PM' },
  { id: 'TRX-2024-0008449', customer: 'Ana Torres', type: 'Cliente', order: 'Pedido #ORD-54886', method: 'PSE Banco de Bogotá', amount: '$32.900', status: 'Reembolsado', date: '19 May, 2026', time: '09:45 PM' },
];

export const mockCommissions = [
  { id: '1', user: 'Ana García', design: 'Mandala Tropical', store: 'Creative Print Store', sales: 45, commission: '$225.000', status: 'Pagado', date: '01 Ago, 2024' },
  { id: '2', user: 'Carlos López', design: 'Geometría Andina', store: 'Print Express', sales: 28, commission: '$140.000', status: 'Pendiente', date: '03 Ago, 2024' },
  { id: '3', user: 'Sofia Ruiz', design: 'Floral Minimalista', store: 'Urban Style Prints', sales: 67, commission: '$335.000', status: 'Pagado', date: '31 Jul, 2024' },
  { id: '4', user: 'Diego Reyes', design: 'Tipografía Urbana', store: 'Color Express', sales: 12, commission: '$60.000', status: 'Rechazado', date: '02 Ago, 2024' },
  { id: '5', user: 'Valentina Cruz', design: 'Abstracto Digital', store: 'Creative Print Store', sales: 89, commission: '$445.000', status: 'Pendiente', date: '04 Ago, 2024' },
];

const designReviews: DesignReview[] = [
  {
    id: 'des-rev-1',
    user: 'Ana M.',
    rating: 5,
    title: 'Archivo impecable y listo para DTG',
    comment: 'Archivo impecable, colores limpios y listo para producir sin ajustes adicionales. La resolución es excelente y los vectores están perfectamente limpios.',
    date: '12 Jul, 2024',
    verifiedPurchase: true,
    images: [designImg1, designImg7],
    helpfulCount: 21,
  },
  {
    id: 'des-rev-2',
    user: 'Luis R.',
    rating: 4,
    title: 'Muy buena composición cromática',
    comment: 'Muy buena composición y excelente respuesta en impresión DTG sobre prendas oscuras. Excelente contraste en los degradados.',
    date: '18 Jul, 2024',
    verifiedPurchase: true,
    images: [designImg2],
    helpfulCount: 14,
  },
  {
    id: 'des-rev-3',
    user: 'Camila P.',
    rating: 5,
    title: 'Licencia clara y gran aceptación de clientes',
    comment: 'La licencia comercial está súper clara y el diseño funcionó perfecto para una tirada de 50 camisetas. El cliente quedó fascinado.',
    date: '25 Jul, 2024',
    verifiedPurchase: true,
    helpfulCount: 19,
  },
  {
    id: 'des-rev-4',
    user: 'Diego Torres',
    rating: 5,
    title: 'Resolución profesional sin pérdida de detalle',
    comment: 'El archivo descargable mantiene proporciones exactas para el personalizador. Ahorra mucho tiempo de pre-prensa y los detalles finos se imprimen nítidos.',
    date: '02 Ago, 2024',
    verifiedPurchase: true,
    images: [designImg8, designImg9],
    helpfulCount: 11,
  },
  {
    id: 'des-rev-5',
    user: 'Valeria R.',
    rating: 4,
    title: 'Versátil para textil y accesorios',
    comment: 'Lo utilizamos en buzos y en tazas cerámicas, la escala se adaptó sin problemas y la paleta de color es muy atractiva.',
    date: '10 Ago, 2024',
    verifiedPurchase: false,
    helpfulCount: 7,
  },
  {
    id: 'des-rev-6',
    user: 'Julián Ospina',
    rating: 5,
    title: 'De los mejores artes digitales del catálogo',
    comment: 'Excelente trazo y creatividad. La estética urbana encaja perfecto con nuestra línea de productos streetwear.',
    date: '15 Ago, 2024',
    verifiedPurchase: true,
    helpfulCount: 16,
  },
];

const buildSpecs = (design: {
  name: string;
  author: string;
  category: string;
  date: string;
  technique: string;
  format: string;
  resolution: string;
  license: string;
  usage: string;
  status: string;
}): DesignSpec[] => [
  { characteristic: 'Nombre del diseño', detail: design.name },
  { characteristic: 'Autor', detail: design.author },
  { characteristic: 'Categoría', detail: design.category },
  { characteristic: 'Fecha de publicación', detail: design.date },
  { characteristic: 'Técnica', detail: design.technique },
  { characteristic: 'Formato', detail: design.format },
  { characteristic: 'Resolución', detail: design.resolution },
  { characteristic: 'Licencia', detail: design.license },
  { characteristic: 'Uso permitido', detail: design.usage },
  { characteristic: 'Estado', detail: design.status },
];

const designBase = [
  { id: '1', name: 'Chaos Controller', author: 'Carlos Gómez', store: 'Creative Print Store', category: 'Gamer', status: 'Aprobado', sales: 2581, revenue: '$7.742.000', rating: 4.8, date: '2024-07-10', image: designImg1, price: '$39.900', originalPrice: '$49.900', discount: '20% OFF', reviewsCount: 258, technique: 'Ilustración digital vectorizada', format: 'PNG transparente + SVG', resolution: '4500 x 5400 px', license: 'Licencia comercial estándar', usage: 'Uso en productos físicos y digitales' },
  { id: '2', name: 'Stay Wild', author: 'Laura Sánchez', store: 'Urban Style Prints', category: 'Naturaleza', status: 'Aprobado', sales: 1932, revenue: '$5.796.000', rating: 4.5, date: '2024-07-15', image: designImg2, price: '$34.900', originalPrice: '$42.900', discount: '19% OFF', reviewsCount: 184, technique: 'Ilustración raster premium', format: 'PNG transparente', resolution: '4200 x 5000 px', license: 'Licencia comercial estándar', usage: 'Uso en prendas, accesorios y piezas promocionales' },
  { id: '3', name: 'Just Do It', author: 'Pedro Ríos', store: 'Print House CO', category: 'Motivacional', status: 'Aprobado', sales: 1720, revenue: '$5.160.000', rating: 4.9, date: '2024-07-05', image: designImg3, price: '$37.900', originalPrice: '$45.900', discount: '17% OFF', reviewsCount: 312, technique: 'Tipografía digital', format: 'PNG + PDF', resolution: '5000 x 5000 px', license: 'Licencia comercial extendida', usage: 'Uso en campañas y productos impresos' },
  { id: '4', name: 'Astronaut Vibes', author: 'María Torres', store: 'Color Express', category: 'Espacio', status: 'Pendiente', sales: 0, revenue: '$0', rating: 4.2, date: '2024-08-01', image: designImg4, price: '$32.900', reviewsCount: 41, technique: 'Composición digital', format: 'PNG transparente', resolution: '4000 x 4800 px', license: 'Licencia personal revisable', usage: 'Uso sujeto a aprobación de moderación' },
  { id: '5', name: 'Retro Wave', author: 'Diego Reyes', store: 'Art & Ink Studio', category: 'Retro', status: 'En revisión', sales: 0, revenue: '$0', rating: 4.6, date: '2024-08-03', image: designImg5, price: '$36.900', reviewsCount: 96, technique: 'Arte digital retro', format: 'PNG + SVG', resolution: '4500 x 5400 px', license: 'Licencia comercial estándar', usage: 'Uso en prendas y accesorios' },
  { id: '6', name: 'Floral Bloom', author: 'Sofia Ruiz', store: 'Urban Style Prints', category: 'Floral', status: 'Rechazado', sales: 0, revenue: '$0', rating: 4.1, date: '2024-08-02', image: designImg6, price: '$29.900', reviewsCount: 23, technique: 'Acuarela digital', format: 'PNG transparente', resolution: '3600 x 4600 px', license: 'Licencia en revisión', usage: 'No disponible para venta hasta aprobación' },
] as const;

export const mockDesigns: AdminDesign[] = designBase.map((design, index) => ({
  ...design,
  images: [
    design.image,
    [designImg7, designImg8, designImg9, designImg10, designImg1, designImg2][index],
    [designImg10, designImg9, designImg8, designImg7, designImg3, designImg4][index],
  ],
  description: `${design.name} es un diseño de autor pensado para productos personalizados con alta nitidez, composición equilibrada y licencia clara para venta en tienda. Su archivo está preparado para integrarse a flujos de impresión profesional sin modificar la obra original.`,
  tags: [design.category, design.technique.split(' ')[0], design.format.split(' ')[0]],
  colors: ['#111827', '#2563EB', '#F59E0B'],
  specs: buildSpecs(design),
  reviews: designReviews,
}));

export const mockTemplates = [
  { id: '1', name: 'Camiseta Clásica', category: 'Ropa', products: 12, status: 'Activa', uses: 234 },
  { id: '2', name: 'Taza Premium', category: 'Accesorios', products: 6, status: 'Activa', uses: 189 },
  { id: '3', name: 'Hoodie Oversized', category: 'Ropa', products: 8, status: 'Activa', uses: 98 },
  { id: '4', name: 'Gorra Estructurada', category: 'Accesorios', products: 4, status: 'Inactiva', uses: 45 },
  { id: '5', name: 'Bolso Tote', category: 'Accesorios', products: 5, status: 'Activa', uses: 167 },
  { id: '6', name: 'Sticker Rectangular', category: 'Papelería', products: 3, status: 'Activa', uses: 412 },
];

export const mockSupportTickets = [
  { id: 'TKT-001', user: 'Pedro Jiménez', subject: 'Pedido no llegó', category: 'Pedidos', status: 'Pendiente', priority: 'Alta', date: '03 Ago, 2024' },
  { id: 'TKT-002', user: 'Laura Morales', subject: 'Error al personalizar', category: 'Diseñador', status: 'En revisión', priority: 'Media', date: '02 Ago, 2024' },
  { id: 'TKT-003', user: 'José Herrera', subject: 'Problema con pago', category: 'Pagos', status: 'Procesado', priority: 'Alta', date: '01 Ago, 2024' },
  { id: 'TKT-004', user: 'Merch Studio', subject: 'No puedo subir diseños', category: 'Diseños', status: 'Pendiente', priority: 'Media', date: '04 Ago, 2024' },
  { id: 'TKT-005', user: 'Carmen Vega', subject: 'Reembolso pendiente', category: 'Pagos', status: 'En revisión', priority: 'Alta', date: '03 Ago, 2024' },
  { id: 'TKT-006', user: 'Roberto Chávez', subject: 'Calidad del producto', category: 'Productos', status: 'Pendiente', priority: 'Baja', date: '04 Ago, 2024' },
];

export interface PlanCapabilities {
  stores: number;               // -1 = ilimitadas
  users: number;                // -1 = ilimitados
  products: number;             // -1 = ilimitados
  designs: number;              // -1 = ilimitados
  storageGB: number;            // -1 = ilimitado
  designEditor: boolean;
  templates: boolean;
  aiDesignGen: boolean;
  automations: boolean;
  whatsappIntegration: boolean;
  prioritySupport: boolean;
  customDomain: boolean;
  apiAccess: boolean;
}

export interface AdminPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  priceVal: number;
  periodicity: 'Mensual' | 'Anual';
  status: 'Activo' | 'Inactivo';
  subscriptions: number;
  icon: string;
  capabilities: PlanCapabilities;
  stores: number;
  users: number;
  features: number;
  mpPlanId?: string;
}

export const mockPlans: AdminPlan[] = [
  {
    id: '1',
    name: 'Free',
    description: 'Perfecto para comenzar a emprender',
    price: '$0',
    priceVal: 0,
    periodicity: 'Mensual',
    stores: 1,
    users: 1,
    features: 3,
    status: 'Activo',
    subscriptions: 542,
    icon: '⭐',
    capabilities: {
      stores: 1,
      users: 1,
      products: 20,
      designs: 10,
      storageGB: 1,
      designEditor: true,
      templates: true,
      aiDesignGen: false,
      automations: false,
      whatsappIntegration: false,
      prioritySupport: false,
      customDomain: false,
      apiAccess: false,
    },
  },
  {
    id: '2',
    name: 'Basic',
    description: 'Ideal para pequeños equipos y creadores',
    price: '$49.900',
    priceVal: 49900,
    periodicity: 'Mensual',
    stores: 5,
    users: 10,
    features: 8,
    status: 'Activo',
    subscriptions: 312,
    icon: '🏆',
    capabilities: {
      stores: 5,
      users: 10,
      products: 100,
      designs: 50,
      storageGB: 5,
      designEditor: true,
      templates: true,
      aiDesignGen: true,
      automations: false,
      whatsappIntegration: false,
      prioritySupport: false,
      customDomain: false,
      apiAccess: false,
    },
  },
  {
    id: '3',
    name: 'Professional',
    description: 'Para equipos en crecimiento acelerado',
    price: '$119.900',
    priceVal: 119900,
    periodicity: 'Mensual',
    stores: 20,
    users: 50,
    features: 15,
    status: 'Activo',
    subscriptions: 248,
    icon: '💎',
    capabilities: {
      stores: 20,
      users: 50,
      products: 500,
      designs: 200,
      storageGB: 20,
      designEditor: true,
      templates: true,
      aiDesignGen: true,
      automations: true,
      whatsappIntegration: true,
      prioritySupport: true,
      customDomain: true,
      apiAccess: false,
    },
  },
  {
    id: '4',
    name: 'Premium',
    description: 'Solución integral para negocios consolidados',
    price: '$249.900',
    priceVal: 249900,
    periodicity: 'Mensual',
    stores: 100,
    users: 200,
    features: 25,
    status: 'Activo',
    subscriptions: 186,
    icon: '👑',
    capabilities: {
      stores: 100,
      users: 200,
      products: 2000,
      designs: 1000,
      storageGB: 100,
      designEditor: true,
      templates: true,
      aiDesignGen: true,
      automations: true,
      whatsappIntegration: true,
      prioritySupport: true,
      customDomain: true,
      apiAccess: true,
    },
  },
  {
    id: '5',
    name: 'Enterprise',
    description: 'Para grandes organizaciones con infraestructura dedicada',
    price: 'A medida',
    priceVal: 0,
    periodicity: 'Mensual',
    stores: -1,
    users: -1,
    features: -1,
    status: 'Inactivo',
    subscriptions: 0,
    icon: '🏢',
    capabilities: {
      stores: -1,
      users: -1,
      products: -1,
      designs: -1,
      storageGB: -1,
      designEditor: true,
      templates: true,
      aiDesignGen: true,
      automations: true,
      whatsappIntegration: true,
      prioritySupport: true,
      customDomain: true,
      apiAccess: true,
    },
  },
  {
    id: '6',
    name: 'White Label',
    description: 'Tu marca propia impulsada por nuestra plataforma SaaS',
    price: 'A medida',
    priceVal: 0,
    periodicity: 'Mensual',
    stores: -1,
    users: -1,
    features: -1,
    status: 'Inactivo',
    subscriptions: 0,
    icon: '🎯',
    capabilities: {
      stores: -1,
      users: -1,
      products: -1,
      designs: -1,
      storageGB: -1,
      designEditor: true,
      templates: true,
      aiDesignGen: true,
      automations: true,
      whatsappIntegration: true,
      prioritySupport: true,
      customDomain: true,
      apiAccess: true,
    },
  },
];

export const mockSystemLogs = [
  { id: '1', timestamp: '20 May, 2026 11:32 AM', level: 'INFO', category: 'Autenticación', action: 'Inicio de sesión exitoso', user: 'admin@printshop.com', ip: '192.168.1.1', details: 'Sesión iniciada correctamente' },
  { id: '2', timestamp: '20 May, 2026 11:28 AM', level: 'WARNING', category: 'Pagos', action: 'Pago rechazado', user: 'laura.martinez@email.com', ip: '10.0.0.5', details: 'Tarjeta de crédito rechazada por fondos insuficientes' },
  { id: '3', timestamp: '20 May, 2026 11:15 AM', level: 'ERROR', category: 'Sistema', action: 'Error al procesar imagen', user: 'sistema', ip: '—', details: 'Timeout al redimensionar imagen de diseño' },
  { id: '4', timestamp: '20 May, 2026 10:55 AM', level: 'INFO', category: 'Tiendas', action: 'Nueva tienda registrada', user: 'sofia.herrera@email.com', ip: '172.16.0.10', details: 'Tienda "Ink & Style" creada exitosamente' },
  { id: '5', timestamp: '20 May, 2026 10:32 AM', level: 'INFO', category: 'Suscripciones', action: 'Suscripción renovada', user: 'sistema', ip: '—', details: 'Auto-renovación del plan Premium para Creative Print Store' },
  { id: '6', timestamp: '20 May, 2026 10:10 AM', level: 'WARNING', category: 'Diseños', action: 'Diseño reportado', user: 'carlos.perez@email.com', ip: '192.168.0.50', details: 'Diseño #DSN-4521 marcado como contenido inapropiado' },
  { id: '7', timestamp: '20 May, 2026 09:45 AM', level: 'ERROR', category: 'Email', action: 'Error al enviar correo', user: 'sistema', ip: '—', details: 'SMTP timeout al enviar confirmación de pedido #ORD-10254' },
  { id: '8', timestamp: '20 May, 2026 09:30 AM', level: 'INFO', category: 'Autenticación', action: 'Contraseña actualizada', user: 'juan.perez@email.com', ip: '10.0.1.20', details: 'Usuario actualizó su contraseña exitosamente' },
];

export const mockMarketingCampaigns = [
  { id: '1', name: 'Summer Sale 2026', type: 'Email', status: 'Activa', sent: 12450, opened: 3856, clicks: 892, conversions: 156, revenue: '$4.820.000', startDate: '01 May, 2026' },
  { id: '2', name: 'Bienvenida Nuevos Usuarios', type: 'Push', status: 'Activa', sent: 8920, opened: 5214, clicks: 1240, conversions: 89, revenue: '$1.230.000', startDate: '15 Abr, 2026' },
  { id: '3', name: 'Recuperación de Carrito', type: 'Email', status: 'Activa', sent: 3450, opened: 1890, clicks: 645, conversions: 234, revenue: '$8.920.000', startDate: '10 Mar, 2026' },
  { id: '4', name: 'Descuento Primer Pedido', type: 'SMS', status: 'Pausada', sent: 5600, opened: 4200, clicks: 980, conversions: 45, revenue: '$890.000', startDate: '28 Feb, 2026' },
  { id: '5', name: 'Black Friday 2025', type: 'Email', status: 'Finalizada', sent: 45000, opened: 18900, clicks: 6750, conversions: 1890, revenue: '$89.500.000', startDate: '28 Nov, 2025' },
];

// Dashboard stats matching the reference image
export const dashboardStats = {
  activeStores: '248',
  storesChange: '+18.6%',
  registeredUsers: '12.584',
  usersChange: '+22.4%',
  totalOrders: '5.862',
  ordersChange: '+15.7%',
  totalRevenue: '$256.890',
  revenueChange: '+23.1%',
  designsCreated: '18.742',
  designsChange: '+31.8%',
};

export const revenueChartData = [
  { date: '01 May', ingresos: 38000, pedidos: 145 },
  { date: '03 May', ingresos: 42000, pedidos: 198 },
  { date: '05 May', ingresos: 58000, pedidos: 287 },
  { date: '07 May', ingresos: 48000, pedidos: 220 },
  { date: '09 May', ingresos: 65000, pedidos: 310 },
  { date: '11 May', ingresos: 55000, pedidos: 265 },
  { date: '13 May', ingresos: 72000, pedidos: 356 },
  { date: '15 May', ingresos: 68000, pedidos: 330 },
  { date: '17 May', ingresos: 80000, pedidos: 395 },
  { date: '19 May', ingresos: 75000, pedidos: 370 },
  { date: '21 May', ingresos: 82000, pedidos: 410 },
];

export const ordersChartData = [
  { day: 'Lun', pedidos: 42 },
  { day: 'Mar', pedidos: 58 },
  { day: 'Mié', pedidos: 35 },
  { day: 'Jue', pedidos: 65 },
  { day: 'Vie', pedidos: 72 },
  { day: 'Sáb', pedidos: 89 },
  { day: 'Dom', pedidos: 48 },
];

export const planDistributionData = [
  { name: 'Básico', value: 112, pct: '45.2%', color: '#2563EB' },
  { name: 'Profesional', value: 78, pct: '31.5%', color: '#38BDF8' },
  { name: 'Avanzado', value: 38, pct: '15.3%', color: '#6366F1' },
  { name: 'Enterprise', value: 20, pct: '8.1%', color: '#10B981' },
];

export const recentActivity = [
  { icon: 'store', title: 'Nueva tienda registrada', desc: '"Estampados Creativos" se ha unido a la plataforma.', time: 'Hace 5 min' },
  { icon: 'user', title: 'Nuevo usuario administrador', desc: 'Juan Pérez se ha registrado como administrador.', time: 'Hace 18 min' },
  { icon: 'order', title: 'Nuevo pedido recibido', desc: 'Pedido #ORD-9876 en la tienda "Drip Style".', time: 'Hace 25 min' },
  { icon: 'subscription', title: 'Nueva suscripción activada', desc: 'Tienda "Print House" activó el plan Profesional.', time: 'Hace 45 min' },
  { icon: 'payment', title: 'Pago recibido', desc: 'Pago de $149.00 recibido de "Ink & Wear".', time: 'Hace 1 hora' },
];

export const salesByCategory = [
  { name: 'Camisetas', amount: '$120.450', pct: 47, color: '#2563EB' },
  { name: 'Hoodies', amount: '$65.230', pct: 25, color: '#38BDF8' },
  { name: 'Gorras', amount: '$32.890', pct: 13, color: '#6366F1' },
  { name: 'Tazas', amount: '$18.750', pct: 7, color: '#F59E0B' },
  { name: 'Otros', amount: '$19.570', pct: 8, color: '#10B981' },
];

export const systemUsage = [
  { label: 'Almacenamiento', pct: 62, detail: '248 GB / 400 GB', color: '#2563EB' },
  { label: 'Ancho de Banda', pct: 48, detail: '480 GB / 1 TB', color: '#38BDF8' },
  { label: 'Diseños Generados (IA)', pct: 71, detail: '71.240 / 100.000', color: '#F59E0B' },
  { label: 'Usuarios Activos', pct: 58, detail: '12.584 / 20.000', color: '#6366F1' },
  { label: 'Tiendas Activas', pct: 82, detail: '248 / 300', color: '#10B981' },
];

export const financeChartData = [
  { date: '21 Abr', ingresos: 32000000, egresos: 8000000, ganancia: 24000000 },
  { date: '28 Abr', ingresos: 38000000, egresos: 9500000, ganancia: 28500000 },
  { date: '05 May', ingresos: 45000000, egresos: 11000000, ganancia: 34000000 },
  { date: '12 May', ingresos: 52000000, egresos: 13000000, ganancia: 39000000 },
  { date: '19 May', ingresos: 60000000, egresos: 15000000, ganancia: 45000000 },
];

export const reportsChartData = [
  { date: '01 May', ingresos: 28000000, comisiones: 5600000, suscripciones: 2800000 },
  { date: '04 May', ingresos: 32000000, comisiones: 6400000, suscripciones: 3200000 },
  { date: '07 May', ingresos: 38000000, comisiones: 7600000, suscripciones: 3800000 },
  { date: '10 May', ingresos: 35000000, comisiones: 7000000, suscripciones: 3500000 },
  { date: '13 May', ingresos: 42000000, comisiones: 8400000, suscripciones: 4200000 },
  { date: '16 May', ingresos: 48000000, comisiones: 9600000, suscripciones: 4800000 },
  { date: '20 May', ingresos: 55000000, comisiones: 11000000, suscripciones: 5500000 },
];

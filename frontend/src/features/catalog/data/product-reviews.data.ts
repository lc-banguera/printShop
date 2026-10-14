import type { ReviewItem, RatingDistributionItem } from '@/shared/components/reviews';
import hoddieImg from '@/resources/mockup/hoddie.png';
import tshirtMockup from '@/resources/mockup/t-shirt-mockup.png';
import bolsoImg from '@/resources/mockup/bolso.jpg';
import cuadroImg from '@/resources/mockup/cuadro.jpg';
import tazasImg from '@/resources/mockup/tazas.png';

export const productRatingDistribution: RatingDistributionItem[] = [
  { rating: 5, count: 74, percent: 52 },
  { rating: 4, count: 38, percent: 27 },
  { rating: 3, count: 17, percent: 12 },
  { rating: 2, count: 9, percent: 6 },
  { rating: 1, count: 4, percent: 3 },
];

export const sampleProductReviews: ReviewItem[] = [
  {
    id: 'rev-p-1',
    user: {
      name: 'Valentina Gómez',
      fallback: 'VG',
    },
    rating: 4,
    date: 'Hace 3 semanas',
    verifiedPurchase: true,
    title: 'Compré 15 unidades para mi equipo y quedaron fascinados',
    comment:
      'Hicimos un pedido por volumen con el logo corporativo. La consistencia en el tono de todas las prendas fue perfecta. La atención al cliente y el seguimiento del pedido estuvieron impecables.',
    images: [hoddieImg, tshirtMockup, bolsoImg],
    helpfulCount: 32,
  },
  {
    id: 'rev-p-2',
    user: {
      name: 'Carlos Mendoza',
      fallback: 'CM',
    },
    rating: 5,
    date: 'Hace 3 días',
    verifiedPurchase: true,
    title: 'Excelente calidad de tela y nitidez en el estampado',
    comment:
      'La prenda superó por completo mis expectativas. El algodón es pesado, suave y no encoge con la primera lavada. El estampado DTG tiene colores súper vivos y los bordes son perfectamente definidos. Llegó 2 días antes de lo esperado.',
    images: [tshirtMockup, hoddieImg],
    helpfulCount: 24,
  },
  {
    id: 'rev-p-3',
    user: {
      name: 'María Fernanda',
      fallback: 'MF',
    },
    rating: 3,
    date: 'Hace 1 semana',
    verifiedPurchase: true,
    title: 'Buen producto, aunque el color es un poco diferente',
    comment:
      'En general me gustó mucho la calidad del hoodie, es muy cómodo y el estampado se ve bien. El único detalle es que el color del diseño es un poco más claro en persona.',
    helpfulCount: 8,
  },
  {
    id: 'rev-p-4',
    user: {
      name: 'Mateo Restrepo',
      fallback: 'MR',
    },
    rating: 4,
    date: 'Hace 1 mes',
    verifiedPurchase: true,
    title: 'Muy buena confección y costuras reforzadas',
    comment:
      'La confección y las costuras reforzadas son de primera. La tela se siente muy premium. Solo tener en cuenta que el corte es generoso; si les gusta más ceñido pidan una talla menos. Por lo demás, 10 de 10.',
    images: [hoddieImg, cuadroImg],
    helpfulCount: 12,
  },
  {
    id: 'rev-p-5',
    user: {
      name: 'Andrés Felipe Cruz',
      fallback: 'AC',
    },
    rating: 5,
    date: 'Hace 2 meses',
    verifiedPurchase: true,
    title: 'Resistencia perfecta tras múltiples lavadas',
    comment:
      'Llevo ya un mes usándola y lavándola seguido. No se agrieta el estampado ni pierde tono negro la camiseta. Definitivamente volveré a mandar a personalizar más diseños acá.',
    images: [tazasImg],
    helpfulCount: 15,
  },
];

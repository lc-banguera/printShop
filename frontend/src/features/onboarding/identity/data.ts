import { VerificationMethodItem, AcceptedDocumentItem, VerificationRecommendationItem } from './types';

export const VERIFICATION_METHODS: VerificationMethodItem[] = [
  {
    id: 'document',
    title: 'Documento de identidad',
    badgeText: 'Más rápido',
    badgeVariant: 'fastest',
    description: 'Toma una foto de tu documento de identidad y una selfie. La verificación suele completarse en pocos minutos.',
  },
  {
    id: 'facial',
    title: 'Verificación facial',
    badgeText: 'Recomendada',
    badgeVariant: 'recommended',
    description: 'Realiza un escaneo facial en tiempo real. Es seguro, fácil y no requiere documentos adicionales.',
  },
  {
    id: 'bank',
    title: 'A través de tu banco',
    badgeText: 'Más segura',
    badgeVariant: 'secure',
    description: 'Verifica tu identidad usando tu cuenta bancaria. Es un proceso rápido y confiable.',
  },
];

export const ACCEPTED_DOCUMENTS: AcceptedDocumentItem[] = [
  {
    id: 'dni',
    title: 'DNI / CI',
    iconType: 'dni',
  },
  {
    id: 'passport',
    title: 'Pasaporte',
    iconType: 'passport',
  },
  {
    id: 'license',
    title: 'Carnet de conducir',
    iconType: 'license',
  },
];

export const FACIAL_RECOMMENDATIONS: VerificationRecommendationItem[] = [
  {
    id: 'light',
    text: 'Busca un lugar bien iluminado.',
    iconType: 'sun',
  },
  {
    id: 'clear',
    text: 'Mantén tu rostro visible y sin obstrucciones.',
    iconType: 'user',
  },
  {
    id: 'height',
    text: 'Sostén el dispositivo a la altura de tu cara.',
    iconType: 'phone',
  },
  {
    id: 'accessories',
    text: 'Evita usar gorro, gafas o accesorios que cubran tu rostro.',
    iconType: 'ban',
  },
];

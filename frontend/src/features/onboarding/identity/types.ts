export type VerificationStepId = 'method' | 'document' | 'facial' | 'confirmation';

export type MethodType = 'document' | 'facial' | 'bank';

export type StepState = 'pending' | 'active' | 'completed' | 'locked' | 'optional';

export interface VerificationMethodItem {
  id: MethodType;
  title: string;
  badgeText: string;
  badgeVariant: 'fastest' | 'recommended' | 'secure';
  description: string;
}

export interface AcceptedDocumentItem {
  id: string;
  title: string;
  iconType: 'dni' | 'passport' | 'license';
}

export interface VerificationRecommendationItem {
  id: string;
  text: string;
  iconType: 'sun' | 'user' | 'phone' | 'ban';
}

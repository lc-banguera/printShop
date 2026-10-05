export type IdentityStatus =
  | "PENDING"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED";

export interface OnboardingState {
  subscriptionStatus: "ACTIVE" | "INACTIVE" | "TRIAL";
  paymentStatus: "CONFIRMED" | "PENDING" | "FAILED";
  identityStatus: IdentityStatus;
  sellerActivationStatus: "NOT_ACTIVATED" | "ACTIVATED";
  storeConfigurationStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
}

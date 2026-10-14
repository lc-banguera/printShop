import { OnboardingState } from "./types";

// Centralized mock for the summary page. Adjust this to preview different states.
export const defaultOnboardingState: OnboardingState = {
  subscriptionStatus: "ACTIVE",
  paymentStatus: "CONFIRMED",
  identityStatus: "PENDING",
  sellerActivationStatus: "NOT_ACTIVATED",
  storeConfigurationStatus: "IN_PROGRESS",
};

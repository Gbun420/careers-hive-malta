export type FeatureEventPayload = {
  jobId: string;
  source?: string;
};

export function trackFeatureClick(_: FeatureEventPayload) {
  // Placeholder for analytics wiring.
}

export function trackCheckoutCreated(_: FeatureEventPayload & { sessionUrl?: string }) {
  // Placeholder for analytics wiring.
}

export function trackCheckoutFailed(_: FeatureEventPayload & { reason?: string }) {
  // Placeholder for analytics wiring.
}

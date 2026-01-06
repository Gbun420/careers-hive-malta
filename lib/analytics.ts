/**
 * Analytics utility for Careers Hive.
 * Adheres to the Dynamic Data Integration Guide for event tracking.
 */

type AnalyticsEvent = 
  | 'alert_signup_complete' 
  | 'signup_initiated' 
  | 'application_submitted' 
  | 'verification_requested'
  | 'alert_created'
  | 'alert_updated'
  | 'alert_disabled'
  | 'alert_digest_sent';

export const trackEvent = (event: AnalyticsEvent, properties?: Record<string, any>) => {
  // 1. Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${event}`, properties);
  }

  // 2. Implementation for Vercel Analytics (if available)
  try {
    // If you have @vercel/analytics installed:
    // import { track } from '@vercel/analytics';
    // track(event, properties);
  } catch (e) {
    // Silently fail if tracking is blocked or fails
  }

  // 3. Store in localStorage for debugging metric-to-event correlation
  try {
    const history = JSON.parse(localStorage.getItem('ch_event_history') || '[]');
    history.push({ event, properties, timestamp: new Date().toISOString() });
    localStorage.setItem('ch_event_history', JSON.stringify(history.slice(-50))); // Keep last 50
  } catch (e) {}
};

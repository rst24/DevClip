/**
 * Analytics tracking utility for conversion events
 */

export type AnalyticsEvent = 
  | 'upgrade_banner_shown'
  | 'upgrade_banner_clicked'
  | 'upgrade_modal_shown'
  | 'upgrade_modal_plan_selected'
  | 'credit_warning_shown'
  | 'credit_warning_clicked';

interface EventMetadata {
  [key: string]: any;
}

/**
 * Track a conversion event
 * Sends event to backend for logging
 */
export async function trackEvent(
  eventType: AnalyticsEvent,
  metadata?: EventMetadata
): Promise<void> {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ eventType, metadata }),
      credentials: 'include',
    });
  } catch (error) {
    // Silently fail - don't break UX for analytics
    console.error('Analytics tracking failed:', error);
  }
}

import { describe, it, expect } from 'vitest';
import {
  buildEmergencySmsSituation,
  formatEmergencySms,
  getSmsUri,
  getWhatsAppSmsFallbackUrl
} from '../src/lib/emergencySms';

describe('NightShift AI — Emergency SMS System', () => {
  const mockCoords = { lat: 19.0680, lng: 72.8745 };

  it('builds emergency SMS situation with default values and live tracking URL', () => {
    const sit = buildEmergencySmsSituation(mockCoords);

    expect(sit.workerName).toBe('Gurvesh Patil');
    expect(sit.workerPhone).toBe('+91 98765 43210');
    expect(sit.recipientPhone).toBe('+91 98200 11223');
    expect(sit.coords.lat).toBe(19.0680);
    expect(sit.coords.lng).toBe(72.8745);
    expect(sit.trackingUrl).toContain('view=contact_alert');
    expect(sit.trackingUrl).toContain('lat=19.068');
  });

  it('formats emergency SMS message with concise situational breakdown', () => {
    const sit = buildEmergencySmsSituation(mockCoords);
    const text = formatEmergencySms(sit);

    expect(text).toContain('EMERGENCY NIGHTSHIFT AI SOS ALERT');
    expect(text).toContain('Gurvesh Patil');
    expect(text).toContain('+91 98765 43210');
    expect(text).toContain('19.06800, 72.87450');
    expect(text).toContain(sit.trackingUrl);
    expect(text).toContain('Emergency Dispatch: tel:112');
  });

  it('generates valid SMS URI formatted with clean phone number and encoded body', () => {
    const uri = getSmsUri('+91 98200 11223', 'TEST ALERT');

    expect(uri.startsWith('sms:+919820011223')).toBe(true);
    expect(uri).toContain('body=TEST%20ALERT');
  });

  it('generates valid WhatsApp fallback link with clean digits and encoded text', () => {
    const waUrl = getWhatsAppSmsFallbackUrl('+91 98200 11223', 'TEST ALERT');

    expect(waUrl.startsWith('https://wa.me/919820011223')).toBe(true);
    expect(waUrl).toContain('text=TEST%20ALERT');
  });
});

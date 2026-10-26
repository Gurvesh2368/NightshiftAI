import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildEmergencySituation,
  formatEmergencyEmail,
  getGmailComposeUrl,
  getMailtoUrl,
  dispatchDirectApiEmergencyEmail,
  dispatchEmergencyNotification,
  triggerHapticFeedback,
  HARDCODED_SOS_MESSAGE,
  HIGH_PRIORITY_EMAIL_HEADERS
} from '../src/lib/emergencyEmail';

describe('NightShift AI — Emergency Mail & Alert System', () => {
  const mockCoords = { lat: 19.0680, lng: 72.8745 };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('builds emergency situation targeting affected user from database (NOT admin/dev)', () => {
    const sit = buildEmergencySituation(mockCoords, 'hold_button', 'SEVERE FLASH FLOOD & STRUCTURAL COLLAPSE');

    // Sharing email: patilgurveshp@gmail.com, Receiving email: shyammar12345@gmail.com
    expect(sit.recipientEmail).toBe('shyammar12345@gmail.com');
    expect(sit.workerEmail).toBe('patilgurveshp@gmail.com');
    expect(sit.familyEmail).toBe('shyammar12345@gmail.com');
    expect(sit.workerName).toBe('Gurvesh Patil');
    expect(sit.hazardType).toBe('SEVERE FLASH FLOOD & STRUCTURAL COLLAPSE');
    expect(sit.coords.lat).toBe(19.0680);
    expect(sit.coords.lng).toBe(72.8745);
    expect(sit.trackingUrl).toContain('view=contact_alert');
    expect(sit.trackingUrl).toContain('lat=19.068');

    // 4. Verify high-priority headers in situation payload
    expect(sit.headers).toBeDefined();
    expect(sit.headers?.['X-Priority']).toBe('1');
    expect(sit.headers?.['Importance']).toBe('high');
    expect(sit.headers?.['Priority']).toBe('urgent');
  });

  it('formats emergency email with strict 🚨EMERGENCY subject, hazard type, hardcoded SOS message, location, and evacuation instructions without form wording', () => {
    const sit = buildEmergencySituation(mockCoords, 'hold_button', 'HAZARDOUS CHEMICAL LEAK / INDUSTRIAL FIRE');
    const { subject, body } = formatEmergencyEmail(sit);

    // 2. Strict Subject line
    expect(subject).toBe('🚨EMERGENCY');

    // 3. Body template: Emergency Alert with hardcoded SOS message
    expect(body.toLowerCase()).not.toContain('form submitted');
    expect(body.toLowerCase()).not.toContain('contact form');
    expect(body).toContain('🚨EMERGENCY ALERT');
    expect(body).toContain(HARDCODED_SOS_MESSAGE);
    expect(body).toContain('HAZARD TYPE: HAZARDOUS CHEMICAL LEAK / INDUSTRIAL FIRE');
    expect(body).toContain('patilgurveshp@gmail.com');
    expect(body).toContain('shyammar12345@gmail.com');
    expect(body).toContain('19.06800, 72.87450');
    expect(body).toContain('IMMEDIATE SAFETY & EVACUATION INSTRUCTIONS');
    expect(body).toContain(sit.trackingUrl);
    expect(body).toContain('tel:112');
  });

  it('dispatches directly via background API without triggering OS-level mailto intents', async () => {
    const sit = buildEmergencySituation(mockCoords, 'hold_button');

    // Mock fetch specifically for the /api/send-emergency-email call
    let capturedPayload: any = null;
    const fetchSpy = vi.fn().mockImplementation(async (url: any, opts: any) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/send-emergency-email')) {
        capturedPayload = JSON.parse(opts?.body || '{}');
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            status: 'DELIVERED',
            messageId: 'msg_test_123',
            timestamp: new Date().toISOString()
          })
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({})
      };
    });
    vi.stubGlobal('fetch', fetchSpy);

    const result = await dispatchDirectApiEmergencyEmail(sit);

    expect(result.success).toBe(true);
    expect(result.status).toBe('DELIVERED');
    expect(result.recipient).toBe('shyammar12345@gmail.com');
    expect(result.familyEmail).toBe('shyammar12345@gmail.com');

    // Verify payload captured in the silent Direct API call
    expect(fetchSpy).toHaveBeenCalledWith('/api/send-emergency-email', expect.anything());
    expect(capturedPayload).toBeDefined();
    expect(capturedPayload.sharingEmail).toBe('patilgurveshp@gmail.com');
    expect(capturedPayload.receivingEmail).toBe('shyammar12345@gmail.com');
    expect(capturedPayload.sosMessage).toBe(HARDCODED_SOS_MESSAGE);
    expect(capturedPayload.coords.lat).toBe(19.0680);
    expect(capturedPayload.coords.lng).toBe(72.8745);
    expect(capturedPayload.subject).toBe('🚨EMERGENCY');
    expect(capturedPayload.headers['X-Priority']).toBe('1');
  });

  it('provides safe haptic vibration execution without throw', () => {
    expect(() => triggerHapticFeedback([100, 50, 100])).not.toThrow();
  });

  it('creates valid Gmail compose URL targeting receiving email with 🚨EMERGENCY subject', () => {
    const sit = buildEmergencySituation(mockCoords, 'hold_button');
    const gmailUrl = getGmailComposeUrl(sit);

    expect(gmailUrl).toContain('https://mail.google.com/mail/?view=cm&fs=1');
    expect(gmailUrl).toContain('to=shyammar12345%40gmail.com');
    expect(gmailUrl).toContain('%F0%9F%9A%A8EMERGENCY'); // encoded 🚨EMERGENCY
  });

  it('creates valid mailto link targeting receiving email with 🚨EMERGENCY subject', () => {
    const sit = buildEmergencySituation(mockCoords, 'hold_button');
    const mailtoUrl = getMailtoUrl(sit);

    expect(mailtoUrl.startsWith('mailto:shyammar12345@gmail.com')).toBe(true);
    expect(mailtoUrl).toContain('subject=%F0%9F%9A%A8EMERGENCY');
  });

  it('provides RFC compliant high-priority email headers for SMTP / Resend payload', () => {
    expect(HIGH_PRIORITY_EMAIL_HEADERS['X-Priority']).toBe('1');
    expect(HIGH_PRIORITY_EMAIL_HEADERS['X-MSMail-Priority']).toBe('High');
    expect(HIGH_PRIORITY_EMAIL_HEADERS['Importance']).toBe('high');
    expect(HIGH_PRIORITY_EMAIL_HEADERS['Priority']).toBe('urgent');
  });
});


import { describe, it, expect } from 'vitest';
import {
  buildEmergencySituation,
  formatEmergencyEmail,
  getGmailComposeUrl,
  getMailtoUrl,
  HIGH_PRIORITY_EMAIL_HEADERS
} from '../src/lib/emergencyEmail';

describe('NightShift AI — Emergency Mail & Disaster Alert System', () => {
  const mockCoords = { lat: 19.0680, lng: 72.8745 };

  it('builds emergency disaster situation targeting affected user from database (NOT admin/dev)', () => {
    const sit = buildEmergencySituation(mockCoords, 'hold_button', 'SEVERE FLASH FLOOD & STRUCTURAL COLLAPSE');

    // 1. Recipient dynamically targets affected user's email from db, NOT developer/admin
    expect(sit.recipientEmail).toBe('patilgurveshp@gmail.com');
    expect(sit.recipientEmail).not.toBe('cricledge8292@gmail.com');
    expect(sit.workerEmail).toBe('patilgurveshp@gmail.com');
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

  it('formats emergency email with strict 🚨EMERGENCY subject, hazard type, location, and evacuation instructions without form wording', () => {
    const sit = buildEmergencySituation(mockCoords, 'hold_button', 'HAZARDOUS CHEMICAL LEAK / INDUSTRIAL FIRE');
    const { subject, body } = formatEmergencyEmail(sit);

    // 2. Strict Subject line
    expect(subject).toBe('🚨EMERGENCY');

    // 3. Body template: Emergency Disaster Alert, NOT form submission
    expect(body.toLowerCase()).not.toContain('form submitted');
    expect(body.toLowerCase()).not.toContain('contact form');
    expect(body).toContain('🚨EMERGENCY DISASTER ALERT');
    expect(body).toContain('HAZARD TYPE: HAZARDOUS CHEMICAL LEAK / INDUSTRIAL FIRE');
    expect(body).toContain('patilgurveshp@gmail.com');
    expect(body).toContain('19.06800, 72.87450');
    expect(body).toContain('IMMEDIATE SAFETY & EVACUATION INSTRUCTIONS');
    expect(body).toContain(sit.trackingUrl);
    expect(body).toContain('tel:112');
  });

  it('creates valid Gmail compose URL targeting affected user with 🚨EMERGENCY subject', () => {
    const sit = buildEmergencySituation(mockCoords, 'hold_button');
    const gmailUrl = getGmailComposeUrl(sit);

    expect(gmailUrl).toContain('https://mail.google.com/mail/?view=cm&fs=1');
    expect(gmailUrl).toContain('to=patilgurveshp%40gmail.com');
    expect(gmailUrl).not.toContain('to=cricledge8292%40gmail.com');
    expect(gmailUrl).toContain('%F0%9F%9A%A8EMERGENCY'); // encoded 🚨EMERGENCY
  });

  it('creates valid mailto link targeting affected user with 🚨EMERGENCY subject', () => {
    const sit = buildEmergencySituation(mockCoords, 'hold_button');
    const mailtoUrl = getMailtoUrl(sit);

    expect(mailtoUrl.startsWith('mailto:patilgurveshp@gmail.com')).toBe(true);
    expect(mailtoUrl).not.toContain('mailto:cricledge8292@gmail.com');
    expect(mailtoUrl).toContain('subject=%F0%9F%9A%A8EMERGENCY');
  });

  it('provides RFC compliant high-priority email headers for SMTP / Resend payload', () => {
    expect(HIGH_PRIORITY_EMAIL_HEADERS['X-Priority']).toBe('1');
    expect(HIGH_PRIORITY_EMAIL_HEADERS['X-MSMail-Priority']).toBe('High');
    expect(HIGH_PRIORITY_EMAIL_HEADERS['Importance']).toBe('high');
    expect(HIGH_PRIORITY_EMAIL_HEADERS['Priority']).toBe('urgent');
  });
});


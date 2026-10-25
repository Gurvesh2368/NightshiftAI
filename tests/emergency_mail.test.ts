import { describe, it, expect } from 'vitest';
import {
  buildEmergencySituation,
  formatEmergencyEmail,
  getGmailComposeUrl,
  getMailtoUrl
} from '../src/lib/emergencyEmail';

describe('NightShift AI — Emergency Mail & Notification System', () => {
  const mockCoords = { lat: 19.0680, lng: 72.8745 };

  it('builds emergency situation targeting cricledge8292@gmail.com with CC to worker', () => {
    const sit = buildEmergencySituation(mockCoords, 'hold_button');

    expect(sit.recipientEmail).toBe('cricledge8292@gmail.com');
    expect(sit.workerEmail).toBe('patilgurveshp@gmail.com');
    expect(sit.workerName).toBe('Gurvesh Patil');
    expect(sit.coords.lat).toBe(19.0680);
    expect(sit.coords.lng).toBe(72.8745);
    expect(sit.trackingUrl).toContain('view=contact_alert');
    expect(sit.trackingUrl).toContain('lat=19.068');
  });

  it('formats emergency email with full situation breakdown', () => {
    const sit = buildEmergencySituation(mockCoords, 'hold_button');
    const { subject, body } = formatEmergencyEmail(sit);

    expect(subject).toBe('URGENT EMERGENCY SITUATION REPORT — NIGHTSHIFT AI');
    expect(body).toContain('URGENT EMERGENCY SITUATION REPORT');
    expect(body).toContain('cricledge8292@gmail.com');
    expect(body).toContain('patilgurveshp@gmail.com');
    expect(body).toContain('19.06800, 72.87450');
    expect(body).toContain(sit.trackingUrl);
    expect(body).toContain('tel:112');
  });

  it('creates valid Gmail compose URL with pre-filled recipient and content', () => {
    const sit = buildEmergencySituation(mockCoords, 'hold_button');
    const gmailUrl = getGmailComposeUrl(sit);

    expect(gmailUrl).toContain('https://mail.google.com/mail/?view=cm&fs=1');
    expect(gmailUrl).toContain('to=cricledge8292%40gmail.com');
    expect(gmailUrl).toContain('cc=patilgurveshp%40gmail.com');
    expect(gmailUrl).toContain('URGENT');
  });

  it('creates valid mailto link with encoded emergency parameters', () => {
    const sit = buildEmergencySituation(mockCoords, 'hold_button');
    const mailtoUrl = getMailtoUrl(sit);

    expect(mailtoUrl.startsWith('mailto:cricledge8292@gmail.com')).toBe(true);
    expect(mailtoUrl).toContain('cc=patilgurveshp%40gmail.com');
    expect(mailtoUrl).toContain('subject=');
  });
});


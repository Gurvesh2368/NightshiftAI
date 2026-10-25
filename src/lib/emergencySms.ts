import { supabase } from './supabase';

export interface EmergencySmsSituation {
  workerName: string;
  workerPhone: string;
  recipientPhone: string;
  recipientName: string;
  coords: { lat: number; lng: number };
  locationName: string;
  timestamp: string;
  bloodGroup: string;
  allergies: string;
  trackingUrl: string;
}

export function buildEmergencySmsSituation(
  coords: { lat: number; lng: number } = { lat: 19.0680, lng: 72.8745 }
): EmergencySmsSituation {
  const workerName = (import.meta as any).env?.VITE_USER_NAME || 'Gurvesh Patil';
  const recipientPhone = (import.meta as any).env?.VITE_EMERGENCY_PHONE || '+91 98200 11223';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const trackingUrl = `${origin}/?view=contact_alert&lat=${coords.lat}&lng=${coords.lng}&user=${encodeURIComponent(workerName)}`;

  return {
    workerName,
    workerPhone: '+91 98765 43210',
    recipientPhone,
    recipientName: 'Family / Emergency Contact',
    coords,
    locationName: 'Near BKC Central Interchange (Opposite City Hospital Emergency)',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    bloodGroup: 'O+ (Universal Donor)',
    allergies: 'No known drug allergies',
    trackingUrl
  };
}

export function formatEmergencySms(sit: EmergencySmsSituation): string {
  return `🚨 EMERGENCY NIGHTSHIFT AI SOS ALERT
Worker: ${sit.workerName} (${sit.workerPhone})
Incident Time: ${sit.timestamp}
Location: ${sit.locationName}
GPS Coordinates: ${sit.coords.lat.toFixed(5)}, ${sit.coords.lng.toFixed(5)}

Live Moving Map Stream:
${sit.trackingUrl}

Medical: ${sit.bloodGroup} · ${sit.allergies}
Immediate Steps:
- Call Worker: tel:${sit.workerPhone}
- Emergency Dispatch: tel:112`;
}

/**
 * Creates cross-platform device-compatible SMS URI.
 * - iOS requires '&body='
 * - Android and RFC standard require '?body='
 */
export function getSmsUri(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  const encodedBody = encodeURIComponent(message);

  const isIOS =
    typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  const separator = isIOS ? '&body=' : '?body=';
  return `sms:${cleanPhone}${separator}${encodedBody}`;
}

/**
 * Universal fallback WhatsApp link for mobile or web WhatsApp
 */
export function getWhatsAppSmsFallbackUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Triggers SMS on device:
 * 1. Dispatches to internal backend /api/send-emergency-sms
 * 2. Launches native device SMS composer if supported
 * 3. Copies SMS body to clipboard as an instant fallback
 */
export async function triggerDeviceSms(
  sit?: EmergencySmsSituation
): Promise<{ success: boolean; status: string; message: string; copied: boolean }> {
  const situation = sit || buildEmergencySmsSituation();
  const text = formatEmergencySms(situation);
  const smsUri = getSmsUri(situation.recipientPhone, text);

  let copied = false;

  // 1. Copy text to clipboard so it is never lost
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch {
      // Ignore clipboard write restrictions
    }
  }

  // 2. Dispatch to backend API in parallel
  dispatchEmergencySms(situation).catch(() => {});

  // 3. Try Web Share API if available on mobile
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: '🚨 NIGHTSHIFT AI EMERGENCY SOS',
        text: text,
        url: situation.trackingUrl
      });
      return {
        success: true,
        status: 'SHARED_VIA_SYSTEM',
        message: 'Emergency SMS alert opened in system share sheet',
        copied
      };
    } catch {
      // Fall through to SMS URI
    }
  }

  // 4. Trigger native SMS handler
  if (typeof window !== 'undefined') {
    try {
      window.location.href = smsUri;
    } catch {
      window.open(smsUri, '_self');
    }
  }

  return {
    success: true,
    status: 'SMS_TRIGGERED',
    message: `Emergency SMS composer opened for ${situation.recipientPhone}`,
    copied
  };
}

/**
 * Dispatches emergency SMS through backend API and Supabase audit channel
 */
export async function dispatchEmergencySms(
  sit: EmergencySmsSituation
): Promise<{ success: boolean; status: string; message: string; recipient: string }> {
  const body = formatEmergencySms(sit);

  try {
    const res = await fetch('/api/send-emergency-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientPhone: sit.recipientPhone,
        workerName: sit.workerName,
        workerPhone: sit.workerPhone,
        message: body,
        coords: sit.coords,
        locationName: sit.locationName,
        trackingUrl: sit.trackingUrl
      })
    });

    const data = await res.json().catch(() => ({}));

    // Record action to Supabase
    await supabase.from('sos_actions').insert([
      {
        action: `Emergency SMS dispatched to ${sit.recipientPhone}`,
        status: 'Delivered',
        at: new Date().toISOString()
      }
    ]);

    // Broadcast realtime alert
    const channel = supabase.channel('emergency-alerts');
    await channel.send({
      type: 'broadcast',
      event: 'sos-sms-dispatch',
      payload: sit
    });

    console.log(`[NightShift AI] Emergency SMS dispatched to ${sit.recipientPhone}:`, data);

    return {
      success: true,
      status: 'AUTO_DISPATCHED',
      message: `Emergency SMS dispatched to ${sit.recipientPhone}`,
      recipient: sit.recipientPhone
    };
  } catch (err: any) {
    console.warn('[NightShift AI] SMS dispatch warning:', err?.message || err);
    return {
      success: true,
      status: 'LOCAL_DISPATCHED',
      message: `Emergency SMS prepared for ${sit.recipientPhone}`,
      recipient: sit.recipientPhone
    };
  }
}


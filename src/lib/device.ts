import { AdminDevice } from '../types';

export function detectCurrentDeviceInfo(): {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  suggestedName: string;
} {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';

  // Detect device type
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  if (/iPad|Tablet|(android(?!.*mobile))/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/Mobile|iPhone|iPod|Android|BlackBerry|IEMobile/i.test(ua)) {
    deviceType = 'mobile';
  }

  // Detect OS
  let os = 'Outro';
  if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Windows NT/i.test(ua)) os = 'Windows';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Linux/i.test(ua)) os = 'Linux';

  // Detect Browser
  let browser = 'Navegador Web';
  if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Opera|OPR/i.test(ua)) browser = 'Opera';

  // Build suggested device name
  let prefix = 'Computador';
  if (deviceType === 'mobile') {
    prefix = os === 'iOS' ? 'iPhone' : 'Smartphone Android';
  } else if (deviceType === 'tablet') {
    prefix = os === 'iOS' ? 'iPad' : 'Tablet';
  } else if (os === 'macOS') {
    prefix = 'MacBook';
  } else if (os === 'Windows') {
    prefix = 'PC Windows';
  }

  const suggestedName = `${prefix} (${browser})`;

  return { deviceType, os, browser, suggestedName };
}

const STORAGE_KEY_DEVICE_ID = 'bg_admin_device_id';
const STORAGE_KEY_DEVICES_LIST = 'bg_admin_devices';

export function getCurrentDeviceId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_DEVICE_ID);
  } catch {
    return null;
  }
}

export function isCurrentDeviceRegistered(): boolean {
  return !!getCurrentDeviceId();
}

export function saveCurrentDeviceId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_DEVICE_ID, id);
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

export function clearCurrentDeviceId(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_DEVICE_ID);
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

export function getLocalDevicesList(): AdminDevice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DEVICES_LIST);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalDevicesList(devices: AdminDevice[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_DEVICES_LIST, JSON.stringify(devices));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

// Utilities for storing and checking guest order access keys in localStorage
const STORAGE_KEY = 'guest_order_access_v1';

function loadMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch (e) {
    return {};
  }
}

function saveMap(map: Record<string, string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    // ignore
  }
}

export function generateGuestOrderKey(length = 32) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  const rnd =
    typeof crypto !== 'undefined' && crypto.getRandomValues
      ? crypto.getRandomValues(new Uint8Array(length))
      : null;
  if (rnd) {
    for (let i = 0; i < length; i++) {
      out += chars[rnd[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++)
      out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

// Save a generated key for an orderId. Returns the key.
export function saveGuestOrderAccess(orderId: number | string, key?: string) {
  const id = String(orderId);
  const map = loadMap();
  const k = key || generateGuestOrderKey();
  map[id] = k;
  saveMap(map);
  return k;
}

export function hasGuestOrderAccess(orderId: number | string) {
  const id = String(orderId);
  const map = loadMap();
  return Boolean(map[id]);
}

export function getGuestOrderKey(orderId: number | string) {
  const id = String(orderId);
  const map = loadMap();
  return map[id] || null;
}

export function removeGuestOrderAccess(orderId: number | string) {
  const id = String(orderId);
  const map = loadMap();
  if (map[id]) {
    delete map[id];
    saveMap(map);
  }
}

export default {
  saveGuestOrderAccess,
  hasGuestOrderAccess,
  getGuestOrderKey,
  removeGuestOrderAccess,
};

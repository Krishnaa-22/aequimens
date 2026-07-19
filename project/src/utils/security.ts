export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(`aequimens:${pin}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function isValidPin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}

export function lockAequimensNow(): void {
  sessionStorage.removeItem('aequimens.sessionUnlocked');
  window.location.reload();
}

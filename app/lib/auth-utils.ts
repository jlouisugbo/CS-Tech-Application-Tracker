// Guest preference utilities and auth helpers

const GUEST_APPLY_KEY = 'guest_apply_preference';

export function getGuestApplyPreference(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const pref = localStorage.getItem(GUEST_APPLY_KEY);
    return pref === 'true';
  } catch {
    return false;
  }
}

export function setGuestApplyPreference(value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GUEST_APPLY_KEY, value.toString());
  } catch {
    // Ignore storage errors
  }
}

// Session refresh utility (placeholder - actual refresh handled by Supabase client)
export async function refreshSessionIfNeeded(): Promise<{ success: boolean; error?: any }> {
  // Session refresh is handled automatically by Supabase client
  // This is a placeholder for compatibility
  return Promise.resolve({ success: true });
}

// Auth debugging utility (placeholder)
export function enableAuthDebugging(enabled: boolean): void {
  // Debug logging is controlled via Supabase client config
  // This is a placeholder for compatibility
  if (typeof window !== 'undefined') {
    (window as any).__AUTH_DEBUG__ = enabled;
  }
}

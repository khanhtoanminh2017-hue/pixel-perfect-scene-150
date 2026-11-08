/** Two trial starts per browser. This is a demo convenience, not server-side DRM. */
export const FREE_PLAYS = 2;
const KEY = "van6_bai4_trial_starts_v1";
export function isFullVersion() { return import.meta.env.VITE_FULL_VERSION === "true"; }
export function playsUsed(): number {
  if (typeof window === "undefined") return 0;
  try { return Math.max(0, Number(localStorage.getItem(KEY) || 0) || 0); }
  catch { return 0; }
}
export function playsLeft(): number {
  return isFullVersion() ? Infinity : Math.max(0, FREE_PLAYS - playsUsed());
}
export function claimPlay(): boolean {
  if (isFullVersion()) return true;
  if (playsLeft() <= 0) return false;
  try { localStorage.setItem(KEY, String(playsUsed() + 1)); return true; }
  catch { return false; }
}

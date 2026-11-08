/** Bản giới thiệu: không chặn lượt chơi. Mua bản quyền là tùy chọn, xác minh thủ công. */
export const FREE_PLAYS = 2;
export function isFullVersion() { return import.meta.env.VITE_FULL_VERSION === "true"; }
export function playsUsed(): number { return 0; }
export function playsLeft(): number { return Infinity; }
export function claimPlay(): boolean { return true; }

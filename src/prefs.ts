export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const SNOW_KEY = 'xmas-snow';

/** 讀不到或被封鎖時回傳預設值：偏好只是方便，不能讓頁面壞掉 */
export function readToggle(store: KeyValueStore | null, key: string, fallback: boolean): boolean {
  try {
    const value = store?.getItem(key);
    if (value === 'on') {
      return true;
    }
    if (value === 'off') {
      return false;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export function writeToggle(store: KeyValueStore | null, key: string, value: boolean): void {
  try {
    store?.setItem(key, value ? 'on' : 'off');
  } catch {
    // 儲存被封鎖時只是記不住設定，當下的開關照常運作
  }
}

export function browserStore(win: Window): KeyValueStore | null {
  try {
    return win.localStorage;
  } catch {
    return null;
  }
}

/** 回傳 MediaQueryList，呼叫端可以監聽使用者中途改變設定 */
export function reducedMotionQuery(win: Window): MediaQueryList | null {
  return typeof win.matchMedia === 'function' ? win.matchMedia('(prefers-reduced-motion: reduce)') : null;
}

export function prefersReducedMotion(win: Window): boolean {
  return reducedMotionQuery(win)?.matches ?? false;
}

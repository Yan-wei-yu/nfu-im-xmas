/** 瀏覽器不支援 paint timing（或分頁在背景一直沒畫）時，load 之後最多等這麼久 */
export const FALLBACK_MS = 3000;

const FCP = 'first-contentful-paint';

/** 頁面 load 完才執行；已經 load 完就馬上執行 */
export function afterLoad(win: Window, fn: () => void): void {
  if (win.document.readyState === 'complete') {
    fn();
    return;
  }
  win.addEventListener('load', fn, { once: true });
}

function once(fn: () => void): () => void {
  let done = false;
  return () => {
    if (!done) {
      done = true;
      fn();
    }
  };
}

/**
 * 等瀏覽器真的畫出第一個內容（first-contentful-paint）才執行。
 * rAF 不夠：載入期間 Chrome 可能跑了 rAF 卻還沒送出畫面，字型請求就會排到首次繪製前面。
 * 不支援 paint timing 的瀏覽器退回「load 之後 FALLBACK_MS」。
 */
export function afterFirstPaint(win: Window, fn: () => void): void {
  const run = once(fn);
  if ((win.performance?.getEntriesByName?.(FCP)?.length ?? 0) > 0) {
    run();
    return;
  }
  const Observer = (win as Window & typeof globalThis).PerformanceObserver;
  if (typeof Observer === 'function' && Observer.supportedEntryTypes?.includes('paint')) {
    const observer = new Observer((list) => {
      if (list.getEntriesByName(FCP).length > 0) {
        observer.disconnect();
        run();
      }
    });
    observer.observe({ type: 'paint', buffered: true });
  }
  afterLoad(win, () => {
    win.setTimeout(run, FALLBACK_MS);
  });
}

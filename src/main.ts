import './styles/index.css';
import { initCountdown } from './countdown.ts';
import { initCountUp } from './countup.ts';
import { loadFonts } from './fonts.ts';
import { initNav } from './nav.ts';
import { safeInit } from './safe-init.ts';
import { afterFirstPaint } from './schedule.ts';
import { initSnow } from './snow/snow.ts';
import { initTree } from './tree/tree.ts';

document.documentElement.classList.add('js');

safeInit([
  ['nav', () => initNav(document)],
  ['countdown', () => initCountdown(document)],
  ['tree', () => initTree(window, document)],
  ['countup', () => initCountUp(window, document)],
  [
    'after-first-paint',
    () =>
      // 字型、飄雪與聖誕樹動畫都不影響首次繪製，等畫面出來之後才開始，避免搶主執行緒
      afterFirstPaint(window, () => {
        document.documentElement.classList.add('is-loaded');
        safeInit([
          ['fonts', () => void loadFonts(document)],
          ['snow', () => void initSnow({ win: window, doc: document })],
        ]);
      }),
  ],
]);

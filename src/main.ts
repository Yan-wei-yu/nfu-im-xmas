import './styles/index.css';
import { initCountdown } from './countdown.ts';
import { initCountUp } from './countup.ts';
import { afterLoad, loadFonts } from './fonts.ts';
import { initNav } from './nav.ts';
import { safeInit } from './safe-init.ts';
import { initSnow } from './snow/snow.ts';
import { initTree } from './tree/tree.ts';

document.documentElement.classList.add('js');

safeInit([
  ['nav', () => initNav(document)],
  ['countdown', () => initCountdown(document)],
  ['tree', () => initTree(window, document)],
  ['countup', () => initCountUp(window, document)],
  [
    'after-load',
    () =>
      // 字型、飄雪與聖誕樹動畫都不影響首次繪製，等 load 之後才開始，避免搶主執行緒
      afterLoad(window, () => {
        document.documentElement.classList.add('is-loaded');
        safeInit([
          ['fonts', () => void loadFonts(document)],
          ['snow', () => void initSnow({ win: window, doc: document })],
        ]);
      }),
  ],
]);

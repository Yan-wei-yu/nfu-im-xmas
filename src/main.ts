import './styles/index.css';
import { initCountdown } from './countdown.ts';
import { initCountUp } from './countup.ts';
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
  ['snow', () => void initSnow({ win: window, doc: document })],
]);

// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { christmasState, countdownText, initCountdown } from '../src/countdown.ts';

/** 台灣時間 → Date（台灣固定 UTC+8，沒有日光節約） */
const taipei = (iso: string): Date => new Date(`${iso}+08:00`);

describe('christmasState', () => {
  it.each([
    ['2026-11-26T12:00:00', { kind: 'before', days: 29 }],
    ['2026-12-24T23:59:59', { kind: 'before', days: 1 }],
    ['2026-12-25T00:00:00', { kind: 'day' }],
    ['2026-12-25T23:59:00', { kind: 'day' }],
    ['2026-12-26T00:00:00', { kind: 'after' }],
    ['2026-12-31T23:00:00', { kind: 'after' }],
    ['2027-01-10T09:00:00', { kind: 'before', days: 349 }],
  ])('%s (Taipei)', (iso, expected) => {
    expect(christmasState(taipei(iso))).toEqual(expected);
  });

  it('uses the Taipei date even when UTC is still on the 24th', () => {
    expect(christmasState(new Date('2026-12-24T16:00:00Z'))).toEqual({ kind: 'day' });
  });
});

describe('countdownText', () => {
  it('words each state', () => {
    expect(countdownText({ kind: 'before', days: 29 })).toBe('距離聖誕節還有 29 天');
    expect(countdownText({ kind: 'day' })).toBe('Merry Christmas！今天就是聖誕節');
    expect(countdownText({ kind: 'after' })).toBe('Merry Christmas & Happy New Year');
  });
});

describe('initCountdown', () => {
  it('replaces the fallback text in every countdown element', () => {
    document.body.innerHTML = '<p data-countdown>12/25 聖誕快樂</p>';
    initCountdown(document, taipei('2026-12-20T08:00:00'));
    expect(document.querySelector('[data-countdown]')?.textContent).toBe('距離聖誕節還有 5 天');
  });
});

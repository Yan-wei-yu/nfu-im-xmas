# 虎科資管聖誕版網站 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 依 `docs/superpowers/specs/2026-11-26-nfu-im-xmas-design.md` 做出「資料聖誕樹」風格的虎科資管聖誕版單頁網站，並部署到 Vercel。

**Architecture:** 內容全部放在 `src/data/site.ts`。`src/render/*` 是把資料轉成 HTML 字串的純函式，由 Vite 外掛在 build（與 dev）時填進 `index.html` 的 `<!-- @render:名稱 -->` 插入點。瀏覽器端的 `src/main.ts` 只加上互動：吊飾展開卡片、飄雪、倒數、數字跳動、手機選單。

**Tech Stack:** Vite 8、TypeScript 7（strict）、Vitest 5（jsdom 31）、Playwright 1.65、Vercel。

**Shell:** 指令以 PowerShell 撰寫，工作目錄為 `D:\code-industry\code\nfu-im-xmas`。commit 訊息用 conventional commits，中文說明，不加 Co-Authored-By。

---

## File Structure

| 檔案 | 職責 |
| --- | --- |
| `package.json`、`tsconfig.json`、`vite.config.ts` | 專案設定；`vite.config.ts` 掛上渲染外掛與 Vitest 設定 |
| `index.html` | 頁面骨架與 `<!-- @render:* -->` 插入點 |
| `public/favicon.svg`、`public/og.png` | 網站圖示、分享預覽圖 |
| `src/data/types.ts` | 內容型別 |
| `src/data/site.ts` | 全部內容 |
| `src/render/html.ts` | `escapeHtml`、`safeUrl`、`renderLink` |
| `src/render/icons.ts` | 六個特色圖示的 SVG |
| `src/render/sections.ts` | nav、hero、六大特色、成果、數字、夥伴、結尾、頁尾的渲染 |
| `src/render/head.ts` | `<title>` 與 meta／OG 標籤 |
| `src/render/tree-svg.ts` | 聖誕樹 SVG |
| `src/render/page.ts` | `renderPage`（全部區塊）與 `fillPlaceholders` |
| `src/tree/layout.ts` | 聖誕樹節點、連線、星星、吊飾座標（純函式） |
| `src/tree/tree.ts` | 點吊飾或網址 hash 時打開對應卡片 |
| `src/countdown.ts` | 台灣時間的倒數判斷與寫入畫面 |
| `src/prefs.ts` | localStorage 偏好、減少動態判斷 |
| `src/snow/model.ts` | 雪花數量、產生、移動（純函式） |
| `src/snow/snow.ts` | canvas 繪製、動畫迴圈、開關 |
| `src/countup.ts` | 數字與環形圖跳動 |
| `src/nav.ts` | 手機選單 |
| `src/safe-init.ts` | 逐一啟動模組、隔離錯誤 |
| `src/main.ts` | 進入點 |
| `src/styles/*.css` | 樣式 |
| `tests/*.test.ts` | Vitest 單元測試 |
| `e2e/site.spec.ts`、`playwright.config.ts` | 端對端測試 |
| `scripts/make-og.mjs` | 產生分享預覽圖 |
| `vercel.json` | 安全標頭與快取 |
| `README.md` | 開發、測試、更新內容、部署說明 |

---

### Task 1: 專案骨架

**Files:**
- Create: `package.json`、`tsconfig.json`、`vite.config.ts`、`.gitignore`、`.gitattributes`、`index.html`、`public/favicon.svg`、`src/main.ts`

- [ ] **Step 1: 建立 `package.json`**

```json
{
  "name": "nfu-im-xmas",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "coverage": "vitest run --coverage",
    "e2e": "playwright test",
    "og": "node scripts/make-og.mjs"
  }
}
```

- [ ] **Step 2: 安裝套件**

Run: `npm install -D vite@^8.3.8 typescript@^7.0.2 vitest@^5.1.2 @vitest/coverage-v8@^5.1.2 jsdom@^31.0.1 @playwright/test@^1.65.1`
Expected: 安裝完成，沒有 peer dependency 錯誤。

- [ ] **Step 3: 建立 `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "types": ["vite/client"],
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src", "tests", "e2e", "vite.config.ts", "playwright.config.ts"]
}
```

- [ ] **Step 4: 建立 `vite.config.ts`（渲染外掛在 Task 6 加上）**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/main.ts'],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
```

- [ ] **Step 5: 建立 `.gitignore` 與 `.gitattributes`**

`.gitignore`：

```
node_modules/
dist/
coverage/
test-results/
playwright-report/
.vercel/
.env*
```

`.gitattributes`：

```
* text=auto eol=lf
*.png binary
```

- [ ] **Step 6: 建立 `index.html`**

```html
<!doctype html>
<html lang="zh-Hant-TW">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- @render:head -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Noto+Sans+TC:wght@400;700;900&display=swap"
    />
  </head>
  <body>
    <a class="skip-link" href="#main">跳到主要內容</a>
    <canvas class="snow" aria-hidden="true"></canvas>
    <!-- @render:nav -->
    <main id="main">
      <!-- @render:hero -->
      <!-- @render:highlights -->
      <!-- @render:gifts -->
      <!-- @render:stats -->
      <!-- @render:partners -->
      <!-- @render:cta -->
    </main>
    <!-- @render:footer -->
    <button class="snow-toggle" type="button" aria-pressed="true" hidden>飄雪</button>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 7: 建立 `public/favicon.svg` 與暫時的 `src/main.ts`**

`public/favicon.svg`：

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#050A1F"/>
  <g stroke="#3DDC84" stroke-width="1.5">
    <line x1="16" y1="8" x2="11" y2="15"/><line x1="16" y1="8" x2="21" y2="15"/>
    <line x1="11" y1="15" x2="7" y2="23"/><line x1="11" y1="15" x2="16" y2="23"/>
    <line x1="21" y1="15" x2="16" y2="23"/><line x1="21" y1="15" x2="25" y2="23"/>
  </g>
  <circle cx="16" cy="6" r="2.5" fill="#F2C94C"/>
  <circle cx="11" cy="15" r="2" fill="#FF5A5F"/><circle cx="21" cy="15" r="2" fill="#4CC9F0"/>
  <circle cx="7" cy="23" r="2" fill="#4CC9F0"/><circle cx="16" cy="23" r="2" fill="#3DDC84"/>
  <circle cx="25" cy="23" r="2" fill="#FF5A5F"/>
  <rect x="14.5" y="25" width="3" height="4" fill="#9AA8C7"/>
</svg>
```

`src/main.ts`（Task 11 換成正式內容）：

```ts
export {};
```

- [ ] **Step 8: 確認建置可以跑**

Run: `npx vite build`
Expected: 產生 `dist/index.html`，沒有錯誤。

- [ ] **Step 9: Commit**

```powershell
git add package.json package-lock.json tsconfig.json vite.config.ts .gitignore .gitattributes index.html public src
git commit -m "chore: 建立 Vite + TypeScript 專案骨架"
```

---

### Task 2: 內容型別與資料

**Files:**
- Create: `src/data/types.ts`、`src/data/site.ts`
- Test: `tests/data.test.ts`

- [ ] **Step 1: 建立 `src/data/types.ts`**

```ts
export type LightColor = 'ice' | 'pine' | 'berry';

export type IconName = 'chip' | 'chart' | 'briefcase' | 'globe' | 'trophy' | 'cap';

export type HighlightId = 'ai' | 'data' | 'intern' | 'global' | 'project' | 'career';

export interface Link {
  readonly label: string;
  readonly url: string;
}

export interface Highlight {
  readonly id: HighlightId;
  readonly title: string;
  readonly tagline: string;
  readonly points: readonly [string, string];
  readonly links: readonly Link[];
  readonly color: LightColor;
  readonly icon: IconName;
  /** 吊飾位置：layer 從 1 起算（樹頂），index 從該層最左邊 0 起算 */
  readonly ornament: { readonly layer: number; readonly index: number };
}

export interface Gift {
  readonly date: string;
  readonly category: '亮眼成果' | '學長姐故事';
  readonly title: string;
  readonly url: string;
}

export type Stat =
  | { readonly kind: 'ring'; readonly value: number; readonly suffix: string; readonly label: string }
  | { readonly kind: 'count'; readonly value: number; readonly suffix: string; readonly label: string }
  | { readonly kind: 'venn'; readonly parts: readonly [string, string, string]; readonly label: string };

export interface Site {
  readonly meta: {
    readonly title: string;
    readonly description: string;
    readonly url: string;
    readonly ogImage: string;
    readonly themeColor: string;
  };
  readonly nav: { readonly brand: string; readonly items: readonly Link[]; readonly official: Link };
  readonly hero: {
    readonly org: string;
    readonly eyebrow: string;
    readonly titleLines: readonly [string, string];
    readonly subtitle: string;
    readonly countdownFallback: string;
    readonly treeLabel: string;
  };
  readonly highlightsSection: { readonly title: string; readonly lead: string };
  readonly highlights: readonly Highlight[];
  readonly giftsSection: { readonly title: string; readonly lead: string; readonly video: Link; readonly more: Link };
  readonly gifts: readonly Gift[];
  readonly statsSection: { readonly title: string };
  readonly stats: readonly Stat[];
  readonly partnersSection: { readonly title: string };
  readonly partners: readonly string[];
  readonly cta: { readonly title: string; readonly lead: string; readonly primary: Link; readonly secondary: Link };
  readonly footer: {
    readonly org: string;
    readonly address: string;
    readonly tel: string;
    readonly fax: string;
    readonly email: string;
    readonly quickLinks: readonly Link[];
    readonly disclaimer: string;
  };
}
```

- [ ] **Step 2: 寫失敗的資料測試 `tests/data.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { site } from '../src/data/site';
import type { Link } from '../src/data/types';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function allUrls(): string[] {
  const links: Link[] = [
    ...site.nav.items,
    site.nav.official,
    ...site.highlights.flatMap((h) => h.links),
    site.giftsSection.video,
    site.giftsSection.more,
    site.cta.primary,
    site.cta.secondary,
    ...site.footer.quickLinks,
  ];
  return [...links.map((l) => l.url), ...site.gifts.map((g) => g.url), site.meta.url, site.meta.ogImage];
}

describe('site data', () => {
  it('has six highlights with unique ids and filled fields', () => {
    expect(site.highlights).toHaveLength(6);
    expect(new Set(site.highlights.map((h) => h.id)).size).toBe(6);
    for (const h of site.highlights) {
      expect(h.title.trim()).not.toBe('');
      expect(h.tagline.trim()).not.toBe('');
      h.points.forEach((p) => expect(p.trim()).not.toBe(''));
      expect(h.links.length).toBeGreaterThan(0);
    }
  });

  it('places ornaments where the spec says', () => {
    const placements = Object.fromEntries(site.highlights.map((h) => [h.id, h.ornament]));
    expect(placements).toEqual({
      ai: { layer: 2, index: 0 },
      data: { layer: 3, index: 2 },
      intern: { layer: 4, index: 1 },
      global: { layer: 5, index: 3 },
      project: { layer: 6, index: 0 },
      career: { layer: 6, index: 5 },
    });
  });

  it('uses only https, mailto or in-page urls', () => {
    for (const url of allUrls()) {
      expect(url).toMatch(/^(https:\/\/|mailto:|#)/);
    }
  });

  it('lists six gifts, newest first, with ISO dates', () => {
    expect(site.gifts).toHaveLength(6);
    site.gifts.forEach((g) => expect(g.date).toMatch(ISO_DATE));
    const dates = site.gifts.map((g) => g.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it('drops the student name from the logo award title', () => {
    const award = site.gifts.find((g) => g.title.includes('LOGO'));
    expect(award?.title.startsWith('本系同學')).toBe(true);
  });

  it('has four stats and eight partners', () => {
    expect(site.stats).toHaveLength(4);
    expect(site.partners).toHaveLength(8);
  });
});
```

- [ ] **Step 3: 確認測試失敗**

Run: `npx vitest run tests/data.test.ts`
Expected: FAIL，找不到 `../src/data/site`。

- [ ] **Step 4: 建立 `src/data/site.ts`**

```ts
import type { Site } from './types';

const OFFICIAL_ORIGIN = 'https://im.nfu.edu.tw';
const official = (path: string): string => `${OFFICIAL_ORIGIN}${path}`;
/** 官網路徑裡的「＿」是全形底線 */
const INDUSTRY = '/zh_tw/Industry%EF%BC%BFAcademic';
const SITE_URL = 'https://nfu-im-xmas.vercel.app';

export const site: Site = {
  meta: {
    title: '虎科資管 Merry Christmas｜聖誕版系網（非官方）',
    description:
      '國立虎尾科技大學資訊管理系的聖誕主題網站：六大亮點特色、2026 成果與數字。個人製作，非官方網站。',
    url: `${SITE_URL}/`,
    ogImage: `${SITE_URL}/og.png`,
    themeColor: '#050A1F',
  },
  nav: {
    brand: '虎科資管 × Xmas',
    items: [
      { label: '特色', url: '#highlights' },
      { label: '成果', url: '#gifts' },
      { label: '數字', url: '#stats' },
      { label: '聯絡', url: '#contact' },
    ],
    official: { label: '官方系網', url: `${OFFICIAL_ORIGIN}/` },
  },
  hero: {
    org: '國立虎尾科技大學 資訊管理系',
    eyebrow: '> merry_xmas()',
    titleLines: ['虎科資管', 'Merry Christmas'],
    subtitle: 'AI × 數據 × 商管',
    countdownFallback: '12/25 聖誕快樂',
    treeLabel: '資料聖誕樹：點吊飾看六大亮點特色',
  },
  highlightsSection: {
    title: '六大亮點特色',
    lead: '培養跨域力，成就未來力。點樹上的吊飾或下面的卡片，看每個特色的重點。',
  },
  highlights: [
    {
      id: 'ai',
      title: 'AI 智慧應用',
      tagline: '學習 AI 技術與應用，開創智慧未來',
      points: [
        '從智慧醫療、金融科技到生成式 AI，培養資料分析、機器學習與系統整合能力',
        '透過實作專題、產學合作與真實案例，學會用 AI 解決產業問題',
      ],
      links: [{ label: '到官網看更多', url: official('/zh_tw/about/ai') }],
      color: 'ice',
      icon: 'chip',
      ornament: { layer: 2, index: 0 },
    },
    {
      id: 'data',
      title: '大數據分析',
      tagline: '數據驅動決策，解鎖商業價值',
      points: [
        '結合 AI、資料分析、雲端與系統整合，把產業痛點變成可執行的方案',
        '實際專案：雲林縣政府住商 e 化用電健診、大林慈濟醫院自動化排班、台化靜電集塵設備參數優化',
      ],
      links: [{ label: '到官網看更多', url: official('/zh_tw/about/bigdata') }],
      color: 'pine',
      icon: 'chart',
      ornament: { layer: 3, index: 2 },
    },
    {
      id: 'intern',
      title: '企業實習',
      tagline: '與企業接軌，累積實戰經驗',
      points: [
        '日四技、技優專班、夜四技與碩士班都有學生到企業實習，分暑期與學期制',
        '實習單位橫跨科技、製造、醫療與農業生技，例如友達光電、上銀科技、欣銓科技',
      ],
      links: [{ label: '到官網看更多', url: official(`${INDUSTRY}/off_campus`) }],
      color: 'berry',
      icon: 'briefcase',
      ornament: { layer: 4, index: 1 },
    },
    {
      id: 'global',
      title: '海外交流',
      tagline: '拓展國際視野，豐富學習經驗',
      points: [
        '交換與研習足跡遍及美國、日本、德國、泰國、加拿大',
        '合作學校包括美國德州大學聖安東尼奧校區（UTSA）、日本近畿大學、群馬大學、泰國北曼谷國王科技大學',
      ],
      links: [{ label: '到官網看更多', url: official(`${INDUSTRY}/Overseas`) }],
      color: 'ice',
      icon: 'globe',
      ornament: { layer: 5, index: 3 },
    },
    {
      id: 'project',
      title: '專題競賽',
      tagline: '挑戰創新競賽，展現實力',
      points: [
        '大三開始做專題、參加校外競賽，累積 100+ 件專題與競賽成果',
        '近年題目：即時 AI 全端網頁生成、AI 機車震動故障診斷、食品影像辨識系統',
      ],
      links: [
        {
          label: '專題影片',
          url: 'https://www.youtube.com/@%E5%9C%8B%E7%AB%8B%E8%99%8E%E5%B0%BE%E7%A7%91%E6%8A%80%E5%A4%A7%E5%AD%B8-f4y/playlists',
        },
        { label: '專題列表', url: official('/zh_tw/s_info/u_project') },
      ],
      color: 'berry',
      icon: 'trophy',
      ornament: { layer: 6, index: 0 },
    },
    {
      id: 'career',
      title: '就業升學',
      tagline: '多元出路選擇，成就職涯夢想',
      points: [
        '四年藍圖：大一打基礎、大二練專業、大三做專題與考證照、大四實習或海外交換',
        '出路：AI 工程師、資料分析師、軟體工程師、ERP 顧問，也可以升碩士班或走 4+1 預研生',
      ],
      links: [{ label: '到官網看更多', url: official('/zh_tw/about/further') }],
      color: 'pine',
      icon: 'cap',
      ornament: { layer: 6, index: 5 },
    },
  ],
  giftsSection: {
    title: '2026 成果禮物盒',
    lead: '今年系上收到的禮物：亮眼成果，還有學長姐的故事。',
    video: {
      label: '60 秒認識虎科資管',
      url: official('/zh_tw/news/videos/%E8%B3%87%E8%A8%8A%E7%AE%A1%E7%90%86%E7%B3%BB%E7%B0%A1%E4%BB%8B-26697713'),
    },
    more: { label: '更多最新消息', url: official('/zh_tw/news') },
  },
  gifts: [
    {
      date: '2026-06-18',
      category: '亮眼成果',
      title: '胡念祖老師帶領學生產學技術交流',
      url: official(
        '/zh_tw/news/newstall/%E8%83%A1%E5%BF%B5%E7%A5%96%E8%80%81%E5%B8%AB%E5%B8%B6%E9%A0%98%E5%AD%B8%E7%94%9F%E7%94%A2%E5%AD%B8%E6%8A%80%E8%A1%93%E4%BA%A4%E6%B5%81-39106589',
      ),
    },
    {
      date: '2026-06-18',
      category: '亮眼成果',
      title: '資安升級：AI助力守護數位邊界',
      url: official(
        '/zh_tw/news/newstall/%E8%B3%87%E5%AE%89%E5%8D%87%E7%B4%9A-AI%E5%8A%A9%E5%8A%9B%E5%AE%88%E8%AD%B7%E6%95%B8%E4%BD%8D%E9%82%8A%E7%95%8C-47146575',
      ),
    },
    {
      date: '2026-06-18',
      category: '亮眼成果',
      title: '學生時期，就具備改變社會的千萬級影響力',
      url: official(
        '/zh_tw/news/newstall/%E5%AD%B8%E7%94%9F%E6%99%82%E6%9C%9F-%E5%B0%B1%E5%85%B7%E5%82%99%E6%94%B9%E8%AE%8A%E7%A4%BE%E6%9C%83%E7%9A%84%E5%8D%83%E8%90%AC%E7%B4%9A%E5%BD%B1%E9%9F%BF%E5%8A%9B-63026983',
      ),
    },
    {
      date: '2026-06-18',
      category: '亮眼成果',
      title: '產業對接：畢業即戰力，提早佈署職涯藍圖',
      url: official(
        '/zh_tw/news/newstall/%E7%94%A2%E6%A5%AD%E5%B0%8D%E6%8E%A5-%E7%95%A2%E6%A5%AD%E5%8D%B3%E6%88%B0%E5%8A%9B-%E6%8F%90%E6%97%A9%E4%BD%88%E7%BD%B2%E8%81%B7%E6%B6%AF%E8%97%8D%E5%9C%96-1482294',
      ),
    },
    {
      date: '2026-06-18',
      category: '學長姐故事',
      title: '本系碩士班同學申請美國德州大學聖安東尼奧分校（UTSA）碩士班雙聯學制成功通過',
      url: official(
        '/zh_tw/news/videos/%E6%9C%AC%E7%B3%BB%E7%A2%A9%E5%A3%AB%E7%8F%AD%E5%90%8C%E5%AD%B8%E7%94%B3%E8%AB%8B%E7%BE%8E%E5%9C%8B%E5%BE%B7%E5%B7%9E%E5%A4%A7%E5%AD%B8%E8%81%96%E5%AE%89%E6%9D%B1%E5%B0%BC%E5%A5%A7%E5%88%86%E6%A0%A1-UTSA-%E7%A2%A9%E5%A3%AB%E7%8F%AD%E9%9B%99%E8%81%AF%E5%AD%B8%E5%88%B6%E6%88%90%E5%8A%9F%E9%80%9A%E9%81%8E-78086612',
      ),
    },
    {
      date: '2026-06-17',
      category: '學長姐故事',
      title: '本系同學參加臺灣證券交易所「臺灣創新板 LOGO 設計徵選比賽」榮獲個人組第一名金獎',
      url: official(
        '/news/newstall/-%E8%B3%87%E7%AE%A1%E7%B3%BB-%E5%85%AC%E5%91%8A-%E7%8B%82%E8%B3%80-%E6%9C%AC%E7%B3%BB%E9%99%B3%E5%BD%A5%E6%9A%9F%E5%90%8C%E5%AD%B8%E5%8F%83%E5%8A%A0%E8%87%BA%E7%81%A3%E8%AD%89%E5%88%B8%E4%BA%A4%E6%98%93%E6%89%80-%E8%87%BA%E7%81%A3%E5%89%B5%E6%96%B0%E6%9D%BFLOGO%E8%A8%AD%E8%A8%88%E5%BE%B4%E9%81%B8%E6%AF%94%E8%B3%BD-%E6%A6%AE%E7%8D%B2%E5%80%8B%E4%BA%BA%E7%B5%84%E7%AC%AC%E4%B8%80%E5%90%8D%E9%87%91%E7%8D%8E-%E5%9C%8B%E7%AB%8B%E8%99%8E%E5%B0%BE%E7%A7%91%E6%8A%80%E5%A4%A7%E5%AD%B8-%E8%B3%87%E8%A8%8A%E7%AE%A1%E7%90%86%E7%B3%BB-38941858',
      ),
    },
  ],
  statsSection: { title: '數字見證實力' },
  stats: [
    { kind: 'ring', value: 95, suffix: '%', label: '畢業生升學／就業率' },
    { kind: 'count', value: 50, suffix: '+', label: '企業合作實習機會' },
    { kind: 'count', value: 100, suffix: '+', label: '專題競賽成果' },
    { kind: 'venn', parts: ['AI', '數據', '商管'], label: '跨域整合能力' },
  ],
  partnersSection: { title: '產學合作夥伴' },
  partners: ['IBM', 'SAP', 'Microsoft', 'Oracle', '雲林縣政府', '資策會', '工研院', '品印三維'],
  cta: {
    title: '下一個改變未來的人，也許就是你',
    lead: '加入虎科資管，開啟你的無限可能！',
    primary: { label: '了解課程', url: official('/zh_tw/course') },
    secondary: { label: '加入虎科資管 LINE', url: 'https://line.me/R/ti/p/@218jnlb' },
  },
  footer: {
    org: '國立虎尾科技大學 資訊管理系',
    address: '632 雲林縣虎尾鎮文化路 64 號',
    tel: '05-6315731',
    fax: '05-6364127',
    email: 'imoffice@nfu.edu.tw',
    quickLinks: [
      { label: '最新消息', url: official('/zh_tw/news') },
      { label: '系所簡介', url: official('/zh_tw/about') },
      { label: '師資簡介', url: official('/zh_tw/faculty') },
      { label: '課程特色', url: official('/zh_tw/course') },
      { label: '招生資訊', url: official('/zh_tw/admission') },
      { label: '學生園區', url: official('/zh_tw/s_info') },
      { label: '產學研究', url: official(INDUSTRY) },
    ],
    disclaimer:
      '本站為個人製作的聖誕主題非官方網站，內容整理自虎科資管系網（2026/11/26），正式資訊以系網為準。',
  },
};
```

- [ ] **Step 5: 確認測試通過**

Run: `npx vitest run tests/data.test.ts`
Expected: PASS（6 tests）。

- [ ] **Step 6: Commit**

```powershell
git add src/data tests/data.test.ts
git commit -m "feat: 聖誕版系網的內容資料與型別"
```

---

### Task 3: HTML 工具函式

**Files:**
- Create: `src/render/html.ts`
- Test: `tests/html.test.ts`

- [ ] **Step 1: 寫失敗的測試 `tests/html.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { escapeHtml, renderLink, safeUrl } from '../src/render/html';

describe('escapeHtml', () => {
  it('escapes the five html special characters', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  });

  it('leaves plain text untouched', () => {
    expect(escapeHtml('虎科資管 AI × 數據')).toBe('虎科資管 AI × 數據');
  });
});

describe('safeUrl', () => {
  it.each(['https://im.nfu.edu.tw/', 'mailto:imoffice@nfu.edu.tw', '#highlights'])('accepts %s', (url) => {
    expect(safeUrl(url)).toBe(url);
  });

  it.each(['javascript:alert(1)', 'http://im.nfu.edu.tw/', '/zh_tw/news', 'data:text/html,hi'])(
    'rejects %s',
    (url) => {
      expect(() => safeUrl(url)).toThrow(/Unsafe URL/);
    },
  );
});

describe('renderLink', () => {
  it('opens external links in a new tab and says so to screen readers', () => {
    const html = renderLink({ label: '官方系網', url: 'https://im.nfu.edu.tw/' });
    expect(html).toBe(
      '<a href="https://im.nfu.edu.tw/" target="_blank" rel="noopener noreferrer">官方系網<span class="sr-only">（另開新分頁）</span></a>',
    );
  });

  it('keeps in-page and mailto links in the same tab', () => {
    expect(renderLink({ label: '特色', url: '#highlights' })).toBe('<a href="#highlights">特色</a>');
    expect(renderLink({ label: 'Email', url: 'mailto:a@b.tw' })).toBe('<a href="mailto:a@b.tw">Email</a>');
  });

  it('adds a class and a decorative arrow when asked', () => {
    const html = renderLink({ label: '了解課程', url: '#x' }, { className: 'btn btn--primary', arrow: true });
    expect(html).toBe('<a class="btn btn--primary" href="#x">了解課程<span aria-hidden="true"> ↗</span></a>');
  });

  it('escapes labels and refuses unsafe urls', () => {
    expect(renderLink({ label: '<b>', url: '#x' })).toContain('&lt;b&gt;');
    expect(() => renderLink({ label: 'x', url: 'javascript:void(0)' })).toThrow(/Unsafe URL/);
  });
});
```

- [ ] **Step 2: 確認測試失敗**

Run: `npx vitest run tests/html.test.ts`
Expected: FAIL，找不到 `../src/render/html`。

- [ ] **Step 3: 建立 `src/render/html.ts`**

```ts
import type { Link } from '../data/types';

const ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => ESCAPES[ch] ?? ch);
}

const SAFE_URL = /^(https:\/\/|mailto:|#)/;

/** 只允許 https:、mailto: 與頁內錨點，其他網址在 build 時就丟錯 */
export function safeUrl(url: string): string {
  if (!SAFE_URL.test(url)) {
    throw new Error(`Unsafe URL: ${url}`);
  }
  return url;
}

export interface LinkOptions {
  readonly className?: string;
  readonly arrow?: boolean;
}

export function renderLink(link: Link, options: LinkOptions = {}): string {
  const href = escapeHtml(safeUrl(link.url));
  const external = link.url.startsWith('https://');
  const cls = options.className ? ` class="${escapeHtml(options.className)}"` : '';
  const target = external ? ' target="_blank" rel="noopener noreferrer"' : '';
  const arrow = options.arrow ? '<span aria-hidden="true"> ↗</span>' : '';
  const note = external ? '<span class="sr-only">（另開新分頁）</span>' : '';
  return `<a${cls} href="${href}"${target}>${escapeHtml(link.label)}${arrow}${note}</a>`;
}
```

- [ ] **Step 4: 確認測試通過**

Run: `npx vitest run tests/html.test.ts`
Expected: PASS（13 tests）。

- [ ] **Step 5: Commit**

```powershell
git add src/render/html.ts tests/html.test.ts
git commit -m "feat: HTML 跳脫、網址檢查與連結渲染"
```

---

### Task 4: 聖誕樹座標

**Files:**
- Create: `src/tree/layout.ts`
- Test: `tests/tree-layout.test.ts`

- [ ] **Step 1: 寫失敗的測試 `tests/tree-layout.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { TREE, computeTreeLayout, starPoints } from '../src/tree/layout';

const ORNAMENTS = [
  { key: 'ai', layer: 2, index: 0 },
  { key: 'career', layer: 6, index: 5 },
];

describe('computeTreeLayout', () => {
  const layout = computeTreeLayout(ORNAMENTS);

  it('builds 21 nodes in 6 layers', () => {
    expect(layout.nodes).toHaveLength(21);
    for (let layer = 1; layer <= TREE.layers; layer += 1) {
      expect(layout.nodes.filter((n) => n.layer === layer)).toHaveLength(layer);
    }
  });

  it('links every node to its two neighbours one layer down', () => {
    expect(layout.edges).toHaveLength(30);
    const byId = new Map(layout.nodes.map((n) => [n.id, n]));
    for (const edge of layout.edges) {
      const from = byId.get(edge.from);
      const to = byId.get(edge.to);
      expect(from && to).toBeTruthy();
      expect(to!.layer).toBe(from!.layer + 1);
      expect([from!.index, from!.index + 1]).toContain(to!.index);
      expect([edge.x1, edge.y1, edge.x2, edge.y2]).toEqual([from!.x, from!.y, to!.x, to!.y]);
    }
  });

  it('keeps every shape inside the view box', () => {
    for (const n of layout.nodes) {
      expect(n.x).toBeGreaterThanOrEqual(0);
      expect(n.x).toBeLessThanOrEqual(layout.width);
      expect(n.y).toBeGreaterThanOrEqual(0);
      expect(n.y).toBeLessThanOrEqual(layout.height);
    }
    expect(layout.trunk.y + layout.trunk.height).toBeLessThanOrEqual(layout.height);
    expect(layout.star.y).toBeGreaterThan(0);
  });

  it('hangs ornaments on the requested nodes', () => {
    expect(layout.ornaments.map((o) => [o.key, o.node.id])).toEqual([
      ['ai', 'n-2-0'],
      ['career', 'n-6-5'],
    ]);
  });

  it('rejects ornaments outside the tree or on the same node', () => {
    expect(() => computeTreeLayout([{ key: 'x', layer: 7, index: 0 }])).toThrow(/No tree node/);
    expect(() =>
      computeTreeLayout([
        { key: 'a', layer: 3, index: 1 },
        { key: 'b', layer: 3, index: 1 },
      ]),
    ).toThrow(/share a node/);
  });

  it('is deterministic', () => {
    expect(computeTreeLayout(ORNAMENTS)).toEqual(layout);
  });
});

describe('starPoints', () => {
  it('returns ten points starting at the top tip', () => {
    const points = starPoints(200, 40, 20, 8).split(' ');
    expect(points).toHaveLength(10);
    expect(points[0]).toBe('200,20');
  });
});
```

- [ ] **Step 2: 確認測試失敗**

Run: `npx vitest run tests/tree-layout.test.ts`
Expected: FAIL，找不到 `../src/tree/layout`。

- [ ] **Step 3: 建立 `src/tree/layout.ts`**

```ts
export interface TreeNode {
  readonly id: string;
  readonly layer: number;
  readonly index: number;
  readonly x: number;
  readonly y: number;
}

export interface TreeEdge {
  readonly from: string;
  readonly to: string;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

export interface OrnamentInput {
  readonly key: string;
  readonly layer: number;
  readonly index: number;
}

export interface OrnamentPlacement {
  readonly key: string;
  readonly node: TreeNode;
}

export interface TreeLayout {
  readonly width: number;
  readonly height: number;
  readonly nodes: readonly TreeNode[];
  readonly edges: readonly TreeEdge[];
  readonly star: { readonly x: number; readonly y: number; readonly points: string };
  readonly trunk: { readonly x: number; readonly y: number; readonly width: number; readonly height: number };
  readonly ornaments: readonly OrnamentPlacement[];
}

export const TREE = {
  width: 400,
  height: 440,
  layers: 6,
  centerX: 200,
  topY: 84,
  layerGap: 58,
  nodeGap: 58,
} as const;

const round = (n: number): number => Math.round(n * 100) / 100;

const nodeId = (layer: number, index: number): string => `n-${layer}-${index}`;

export function starPoints(cx: number, cy: number, outer: number, inner: number): string {
  return Array.from({ length: 10 }, (_, i) => {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    return `${round(cx + radius * Math.cos(angle))},${round(cy + radius * Math.sin(angle))}`;
  }).join(' ');
}

function buildNodes(): TreeNode[] {
  const nodes: TreeNode[] = [];
  for (let layer = 1; layer <= TREE.layers; layer += 1) {
    for (let index = 0; index < layer; index += 1) {
      nodes.push({
        id: nodeId(layer, index),
        layer,
        index,
        x: round(TREE.centerX + (index - (layer - 1) / 2) * TREE.nodeGap),
        y: TREE.topY + (layer - 1) * TREE.layerGap,
      });
    }
  }
  return nodes;
}

function lookup(byId: ReadonlyMap<string, TreeNode>, layer: number, index: number): TreeNode {
  const node = byId.get(nodeId(layer, index));
  if (!node) {
    throw new Error(`No tree node at layer ${layer}, index ${index}`);
  }
  return node;
}

export function computeTreeLayout(ornaments: readonly OrnamentInput[]): TreeLayout {
  const nodes = buildNodes();
  const byId = new Map(nodes.map((n) => [n.id, n]));

  const edges = nodes
    .filter((n) => n.layer < TREE.layers)
    .flatMap((n) =>
      [n.index, n.index + 1].map((childIndex) => {
        const child = lookup(byId, n.layer + 1, childIndex);
        return { from: n.id, to: child.id, x1: n.x, y1: n.y, x2: child.x, y2: child.y };
      }),
    );

  const placements = ornaments.map((o) => ({ key: o.key, node: lookup(byId, o.layer, o.index) }));
  if (new Set(placements.map((p) => p.node.id)).size !== placements.length) {
    throw new Error('Two ornaments share a node');
  }

  const starY = TREE.topY - 46;
  const bottomY = TREE.topY + (TREE.layers - 1) * TREE.layerGap;
  return {
    width: TREE.width,
    height: TREE.height,
    nodes,
    edges,
    star: { x: TREE.centerX, y: starY, points: starPoints(TREE.centerX, starY, 20, 8.5) },
    trunk: { x: TREE.centerX - 13, y: bottomY + 12, width: 26, height: 40 },
    ornaments: placements,
  };
}
```

- [ ] **Step 4: 確認測試通過**

Run: `npx vitest run tests/tree-layout.test.ts`
Expected: PASS（7 tests）。

- [ ] **Step 5: Commit**

```powershell
git add src/tree/layout.ts tests/tree-layout.test.ts
git commit -m "feat: 資料聖誕樹的節點與吊飾座標"
```

---

### Task 5: 特色圖示與聖誕樹 SVG

**Files:**
- Create: `src/render/icons.ts`、`src/render/tree-svg.ts`
- Test: `tests/tree-svg.test.ts`

- [ ] **Step 1: 寫失敗的測試 `tests/tree-svg.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { site } from '../src/data/site';
import type { Highlight, IconName } from '../src/data/types';
import { renderIcon } from '../src/render/icons';
import { layoutForHighlights, renderTreeSvg } from '../src/render/tree-svg';

const count = (html: string, pattern: RegExp): number => html.match(pattern)?.length ?? 0;

describe('renderIcon', () => {
  it.each<IconName>(['chip', 'chart', 'briefcase', 'globe', 'trophy', 'cap'])('draws %s as a decorative svg', (name) => {
    const svg = renderIcon(name);
    expect(svg).toMatch(/^<svg class="icon"[^>]*aria-hidden="true">/);
    expect(svg).toMatch(/<(path|rect|circle|ellipse)/);
  });
});

describe('renderTreeSvg', () => {
  const layout = layoutForHighlights(site.highlights);
  const svg = renderTreeSvg(layout, site.highlights, site.hero.treeLabel);

  it('labels the tree for screen readers', () => {
    expect(svg).toContain(`role="group" aria-label="${site.hero.treeLabel}"`);
  });

  it('links each ornament to its highlight card', () => {
    for (const h of site.highlights) {
      expect(svg).toContain(`<a class="ornament ornament--${h.color}" href="#hl-${h.id}" aria-label="${h.title}">`);
    }
    expect(count(svg, /<a class="ornament/g)).toBe(6);
  });

  it('draws 30 edges, 30 data flows and 15 plain nodes', () => {
    expect(count(svg, /<line x1=/g)).toBe(30);
    expect(count(svg, /class="tree__flow /g)).toBe(30);
    expect(count(svg, /class="tree__node /g)).toBe(15);
  });

  it('escapes ornament titles', () => {
    const tricky: Highlight = { ...site.highlights[0]!, title: 'A<B' };
    const html = renderTreeSvg(layoutForHighlights([tricky]), [tricky], 'tree');
    expect(html).toContain('aria-label="A&lt;B"');
    expect(html).not.toContain('A<B');
  });

  it('fails when an ornament has no matching highlight', () => {
    expect(() => renderTreeSvg(layout, site.highlights.slice(1), 'tree')).toThrow(/No highlight for ornament/);
  });
});
```

- [ ] **Step 2: 確認測試失敗**

Run: `npx vitest run tests/tree-svg.test.ts`
Expected: FAIL，找不到 `../src/render/icons`。

- [ ] **Step 3: 建立 `src/render/icons.ts`**

```ts
import type { IconName } from '../data/types';

const SHAPES: Readonly<Record<IconName, string>> = {
  chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="10" y="10" width="4" height="4"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
  chart: '<path d="M3 21h18"/><rect x="5" y="12" width="3" height="7"/><rect x="10.5" y="8" width="3" height="11"/><rect x="16" y="4" width="3" height="15"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/>',
  globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM12 13v4M8 20h8M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4"/>',
  cap: '<path d="M2 9l10-5 10 5-10 5zM6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6"/>',
};

export function renderIcon(name: IconName): string {
  return (
    '<svg class="icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" ' +
    `stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SHAPES[name]}</svg>`
  );
}
```

- [ ] **Step 4: 建立 `src/render/tree-svg.ts`**

```ts
import type { Highlight } from '../data/types';
import { computeTreeLayout, type OrnamentPlacement, type TreeLayout } from '../tree/layout';
import { escapeHtml } from './html';

/** 標籤寬度用字數估算：每字 14px，左右各留 8px */
const LABEL_CHAR_WIDTH = 14;
const LABEL_PADDING = 16;
const FLOW_GROUPS = 5;

export function layoutForHighlights(highlights: readonly Highlight[]): TreeLayout {
  return computeTreeLayout(
    highlights.map((h) => ({ key: h.id, layer: h.ornament.layer, index: h.ornament.index })),
  );
}

function renderOrnament(placement: OrnamentPlacement, highlight: Highlight): string {
  const { x, y } = placement.node;
  const title = escapeHtml(highlight.title);
  const width = highlight.title.length * LABEL_CHAR_WIDTH + LABEL_PADDING;
  return (
    `<a class="ornament ornament--${highlight.color}" href="#hl-${highlight.id}" aria-label="${title}">` +
    `<circle class="ornament__halo" cx="${x}" cy="${y}" r="20"/>` +
    `<circle class="ornament__ball" cx="${x}" cy="${y}" r="12"/>` +
    `<g class="ornament__label" aria-hidden="true">` +
    `<rect x="${x - width / 2}" y="${y - 50}" width="${width}" height="26" rx="13"/>` +
    `<text x="${x}" y="${y - 32}" text-anchor="middle">${title}</text>` +
    `</g></a>`
  );
}

export function renderTreeSvg(layout: TreeLayout, highlights: readonly Highlight[], label: string): string {
  const byId = new Map<string, Highlight>(highlights.map((h) => [h.id, h]));
  const ornamentNodes = new Set(layout.ornaments.map((o) => o.node.id));

  const edges = layout.edges
    .map((e) => `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}"/>`)
    .join('');
  // 資料由下往上流：光點從子節點畫向父節點
  const flows = layout.edges
    .map(
      (e, i) =>
        `<line class="tree__flow tree__flow--t${i % FLOW_GROUPS}" x1="${e.x2}" y1="${e.y2}" x2="${e.x1}" y2="${e.y1}"/>`,
    )
    .join('');
  const nodes = layout.nodes
    .filter((n) => !ornamentNodes.has(n.id))
    .map(
      (n) =>
        `<circle class="tree__node tree__node--t${(n.layer + n.index) % FLOW_GROUPS}" cx="${n.x}" cy="${n.y}" r="5"/>`,
    )
    .join('');
  const ornaments = layout.ornaments
    .map((o) => {
      const highlight = byId.get(o.key);
      if (!highlight) {
        throw new Error(`No highlight for ornament ${o.key}`);
      }
      return renderOrnament(o, highlight);
    })
    .join('');
  const { trunk, star } = layout;

  return (
    `<svg class="tree" viewBox="0 0 ${layout.width} ${layout.height}" role="group" aria-label="${escapeHtml(label)}">` +
    `<g class="tree__edges" aria-hidden="true">${edges}</g>` +
    `<g class="tree__flows" aria-hidden="true">${flows}</g>` +
    `<g aria-hidden="true">${nodes}` +
    `<rect class="tree__trunk" x="${trunk.x}" y="${trunk.y}" width="${trunk.width}" height="${trunk.height}" rx="3"/>` +
    `<polygon class="tree__star" points="${star.points}"/></g>` +
    `<g class="tree__ornaments">${ornaments}</g>` +
    `</svg>`
  );
}
```

- [ ] **Step 5: 確認測試通過**

Run: `npx vitest run tests/tree-svg.test.ts`
Expected: PASS（11 tests）。

- [ ] **Step 6: Commit**

```powershell
git add src/render/icons.ts src/render/tree-svg.ts tests/tree-svg.test.ts
git commit -m "feat: 特色圖示與資料聖誕樹 SVG"
```

---

### Task 6: 各區塊與 head 的渲染

**Files:**
- Create: `src/render/sections.ts`、`src/render/head.ts`
- Test: `tests/sections.test.ts`

- [ ] **Step 1: 寫失敗的測試 `tests/sections.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { site } from '../src/data/site';
import { renderHead } from '../src/render/head';
import {
  renderCta,
  renderFooter,
  renderGifts,
  renderHero,
  renderHighlights,
  renderNav,
  renderPartners,
  renderStats,
} from '../src/render/sections';

const count = (html: string, pattern: RegExp): number => html.match(pattern)?.length ?? 0;

describe('renderNav', () => {
  const html = renderNav(site.nav);

  it('links to the four in-page sections and the official site', () => {
    for (const item of site.nav.items) {
      expect(html).toContain(`href="${item.url}"`);
    }
    expect(html).toContain('href="https://im.nfu.edu.tw/" target="_blank" rel="noopener noreferrer"');
  });

  it('ships the mobile toggle hidden until JS wires it up', () => {
    expect(html).toContain('aria-expanded="false" aria-controls="nav-menu" hidden');
    expect(html).toContain('id="nav-menu"');
  });
});

describe('renderHero', () => {
  const html = renderHero(site.hero, '<svg class="tree"></svg>');

  it('shows both title lines, the countdown fallback and the tree', () => {
    expect(html).toContain('<h1 class="hero__title" id="hero-title">');
    expect(html).toContain('虎科資管');
    expect(html).toContain('Merry Christmas');
    expect(html).toContain('data-countdown aria-live="polite">12/25 聖誕快樂</p>');
    expect(html).toContain('<div class="hero__tree"><svg class="tree"></svg></div>');
  });
});

describe('renderHighlights', () => {
  const html = renderHighlights(site.highlightsSection, site.highlights);

  it('renders one details card per highlight with points and links', () => {
    expect(count(html, /<details class="hl /g)).toBe(6);
    for (const h of site.highlights) {
      expect(html).toContain(`id="hl-${h.id}"`);
      h.points.forEach((p) => expect(html).toContain(`<li>${p}</li>`));
    }
    expect(html).toContain('<span class="hl__index">01</span>');
    expect(html).toContain('<span class="hl__index">06</span>');
    expect(count(html, /class="hl__link"/g)).toBe(7);
  });
});

describe('renderGifts', () => {
  const html = renderGifts(site.giftsSection, site.gifts);

  it('lists six gifts with machine-readable dates and external links', () => {
    expect(count(html, /<li class="gift">/g)).toBe(6);
    expect(html).toContain('<time class="gift__date" datetime="2026-06-17">2026-06-17</time>');
    expect(count(html, /class="gift__title" href="https:\/\/im\.nfu\.edu\.tw/g)).toBe(6);
  });

  it('links the intro video and the full news list', () => {
    expect(html).toContain('60 秒認識虎科資管');
    expect(html).toContain('href="https://im.nfu.edu.tw/zh_tw/news"');
  });
});

describe('renderStats', () => {
  const html = renderStats(site.statsSection, site.stats);

  it('prints final numbers in the html so they show without JS', () => {
    expect(html).toContain('data-countup="95" data-suffix="%">95%</p>');
    expect(html).toContain('data-countup="50" data-suffix="+">50+</p>');
    expect(html).toContain('data-countup="100" data-suffix="+">100+</p>');
  });

  it('fills the ring to 95 percent and labels the venn diagram', () => {
    expect(html).toContain('stroke-dasharray="326.73" stroke-dashoffset="16.34" data-ring="95"');
    expect(html).toContain('AI × 數據 × 商管');
  });
});

describe('renderPartners, renderCta and renderFooter', () => {
  it('renders eight partner tags', () => {
    expect(count(renderPartners(site.partnersSection, site.partners), /<li class="partner">/g)).toBe(8);
  });

  it('renders a primary and a ghost call to action', () => {
    const html = renderCta(site.cta);
    expect(html).toContain('class="btn btn--primary" href="https://im.nfu.edu.tw/zh_tw/course"');
    expect(html).toContain('class="btn btn--ghost" href="https://line.me/R/ti/p/@218jnlb"');
  });

  it('renders contact details, quick links and the disclaimer', () => {
    const html = renderFooter(site.footer);
    expect(html).toContain('<footer class="site-footer" id="contact">');
    expect(html).toContain('href="mailto:imoffice@nfu.edu.tw"');
    expect(count(html, /class="footer__link"/g)).toBe(7);
    expect(html).toContain(site.footer.disclaimer);
  });
});

describe('renderHead', () => {
  it('writes title, canonical and open graph tags', () => {
    const html = renderHead(site.meta);
    expect(html).toContain(`<title>${site.meta.title}</title>`);
    expect(html).toContain('<link rel="canonical" href="https://nfu-im-xmas.vercel.app/" />');
    expect(html).toContain('<meta property="og:image" content="https://nfu-im-xmas.vercel.app/og.png" />');
  });

  it('escapes quotes in meta content', () => {
    expect(renderHead({ ...site.meta, description: 'a "quoted" text' })).toContain(
      'content="a &quot;quoted&quot; text"',
    );
  });
});
```

- [ ] **Step 2: 確認測試失敗**

Run: `npx vitest run tests/sections.test.ts`
Expected: FAIL，找不到 `../src/render/head`。

- [ ] **Step 3: 建立 `src/render/head.ts`**

```ts
import type { Site } from '../data/types';
import { escapeHtml, safeUrl } from './html';

export function renderHead(meta: Site['meta']): string {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const url = escapeHtml(safeUrl(meta.url));
  const image = escapeHtml(safeUrl(meta.ogImage));
  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta name="theme-color" content="${escapeHtml(meta.themeColor)}" />`,
    `<link rel="canonical" href="${url}" />`,
    '<meta property="og:type" content="website" />',
    '<meta property="og:locale" content="zh_TW" />',
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    '<meta name="twitter:card" content="summary_large_image" />',
  ].join('\n    ');
}
```

- [ ] **Step 4: 建立 `src/render/sections.ts`**

```ts
import type { Gift, Highlight, Site, Stat } from '../data/types';
import { escapeHtml, renderLink } from './html';
import { renderIcon } from './icons';

const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = Math.round(2 * Math.PI * RING_RADIUS * 100) / 100;

const GIFT_BOX =
  '<svg class="gift__box" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">' +
  '<rect class="gift__base" x="4" y="10" width="16" height="11" rx="1.5"/>' +
  '<rect class="gift__lid" x="3" y="6" width="18" height="4" rx="1"/>' +
  '<path class="gift__ribbon" d="M12 6v15"/></svg>';

function sectionHead(id: string, title: string, lead?: string): string {
  const leadHtml = lead ? `<p class="section__lead">${escapeHtml(lead)}</p>` : '';
  return `<div class="section__head"><h2 class="section__title" id="${id}">${escapeHtml(title)}</h2>${leadHtml}</div>`;
}

export function renderNav(nav: Site['nav']): string {
  const items = nav.items.map((item) => `<li>${renderLink(item, { className: 'nav__link' })}</li>`).join('');
  const official = renderLink(nav.official, { className: 'nav__link nav__link--official', arrow: true });
  return (
    '<header class="site-header"><nav class="nav" aria-label="主選單">' +
    `<a class="nav__brand" href="#top">${escapeHtml(nav.brand)}</a>` +
    '<button class="nav__toggle" type="button" aria-expanded="false" aria-controls="nav-menu" hidden>選單</button>' +
    `<ul class="nav__menu" id="nav-menu">${items}<li>${official}</li></ul>` +
    '</nav></header>'
  );
}

export function renderHero(hero: Site['hero'], treeSvg: string): string {
  const [line1, line2] = hero.titleLines;
  return (
    '<section class="hero" id="top" aria-labelledby="hero-title">' +
    '<div class="hero__text">' +
    `<p class="hero__org">${escapeHtml(hero.org)}</p>` +
    `<p class="hero__eyebrow"><code>${escapeHtml(hero.eyebrow)}</code></p>` +
    '<h1 class="hero__title" id="hero-title">' +
    `<span class="hero__line">${escapeHtml(line1)}</span>` +
    `<span class="hero__line hero__line--accent">${escapeHtml(line2)}</span></h1>` +
    `<p class="hero__subtitle">${escapeHtml(hero.subtitle)}</p>` +
    `<p class="hero__countdown" data-countdown aria-live="polite">${escapeHtml(hero.countdownFallback)}</p>` +
    '</div>' +
    `<div class="hero__tree">${treeSvg}</div>` +
    '</section>'
  );
}

function renderHighlight(h: Highlight, order: number): string {
  const points = h.points.map((p) => `<li>${escapeHtml(p)}</li>`).join('');
  const links = h.links.map((l) => renderLink(l, { className: 'hl__link', arrow: true })).join('');
  return (
    `<details class="hl hl--${h.id} hl--${h.color}" id="hl-${h.id}">` +
    '<summary class="hl__summary">' +
    `<span class="hl__index">${String(order + 1).padStart(2, '0')}</span>` +
    `<span class="hl__icon">${renderIcon(h.icon)}</span>` +
    `<span class="hl__title">${escapeHtml(h.title)}</span>` +
    `<span class="hl__tagline">${escapeHtml(h.tagline)}</span>` +
    '</summary>' +
    `<div class="hl__body"><ul class="hl__points">${points}</ul><p class="hl__links">${links}</p></div>` +
    '</details>'
  );
}

export function renderHighlights(section: Site['highlightsSection'], highlights: readonly Highlight[]): string {
  return (
    '<section class="section highlights" id="highlights" aria-labelledby="highlights-title">' +
    sectionHead('highlights-title', section.title, section.lead) +
    `<div class="highlights__grid">${highlights.map((h, i) => renderHighlight(h, i)).join('')}</div>` +
    '</section>'
  );
}

function renderGift(g: Gift): string {
  return (
    `<li class="gift">${GIFT_BOX}` +
    `<time class="gift__date" datetime="${escapeHtml(g.date)}">${escapeHtml(g.date)}</time>` +
    `<span class="gift__tag">${escapeHtml(g.category)}</span>` +
    renderLink({ label: g.title, url: g.url }, { className: 'gift__title' }) +
    '</li>'
  );
}

export function renderGifts(section: Site['giftsSection'], gifts: readonly Gift[]): string {
  return (
    '<section class="section gifts" id="gifts" aria-labelledby="gifts-title">' +
    sectionHead('gifts-title', section.title, section.lead) +
    `<p class="gifts__video">${renderLink(section.video, { className: 'chip-link', arrow: true })}</p>` +
    `<ol class="gifts__list">${gifts.map(renderGift).join('')}</ol>` +
    `<p class="gifts__more">${renderLink(section.more, { className: 'text-link', arrow: true })}</p>` +
    '</section>'
  );
}

function statValue(value: number, suffix: string): string {
  const s = escapeHtml(suffix);
  return `<p class="stat__value" data-countup="${value}" data-suffix="${s}">${value}${s}</p>`;
}

function renderStat(stat: Stat): string {
  const label = `<figcaption class="stat__label">${escapeHtml(stat.label)}</figcaption>`;
  switch (stat.kind) {
    case 'ring': {
      const offset = Math.round(RING_CIRCUMFERENCE * (1 - stat.value / 100) * 100) / 100;
      return (
        '<figure class="stat stat--ring">' +
        '<svg class="ring" viewBox="0 0 120 120" aria-hidden="true">' +
        `<circle class="ring__track" cx="60" cy="60" r="${RING_RADIUS}"/>` +
        `<circle class="ring__value" cx="60" cy="60" r="${RING_RADIUS}" stroke-dasharray="${RING_CIRCUMFERENCE}" stroke-dashoffset="${offset}" data-ring="${stat.value}"/>` +
        `</svg>${statValue(stat.value, stat.suffix)}${label}</figure>`
      );
    }
    case 'count':
      return `<figure class="stat stat--count">${statValue(stat.value, stat.suffix)}${label}</figure>`;
    case 'venn': {
      const [a, b, c] = [escapeHtml(stat.parts[0]), escapeHtml(stat.parts[1]), escapeHtml(stat.parts[2])];
      return (
        '<figure class="stat stat--venn">' +
        '<svg class="venn" viewBox="0 0 160 140" aria-hidden="true">' +
        '<circle class="venn__a" cx="58" cy="56" r="40"/>' +
        '<circle class="venn__b" cx="102" cy="56" r="40"/>' +
        '<circle class="venn__c" cx="80" cy="94" r="40"/>' +
        `<text x="40" y="50">${a}</text>` +
        `<text x="120" y="50" text-anchor="end">${b}</text>` +
        `<text x="80" y="120" text-anchor="middle">${c}</text>` +
        '</svg>' +
        `<p class="stat__value stat__value--text">${a} × ${b} × ${c}</p>${label}</figure>`
      );
    }
  }
}

export function renderStats(section: Site['statsSection'], stats: readonly Stat[]): string {
  return (
    '<section class="section stats" id="stats" aria-labelledby="stats-title">' +
    sectionHead('stats-title', section.title) +
    `<div class="stats__grid">${stats.map(renderStat).join('')}</div>` +
    '</section>'
  );
}

export function renderPartners(section: Site['partnersSection'], partners: readonly string[]): string {
  const items = partners.map((p) => `<li class="partner">${escapeHtml(p)}</li>`).join('');
  return (
    '<section class="section partners" aria-labelledby="partners-title">' +
    sectionHead('partners-title', section.title) +
    `<ul class="partners__list">${items}</ul>` +
    '</section>'
  );
}

export function renderCta(cta: Site['cta']): string {
  return (
    '<section class="section cta" aria-labelledby="cta-title">' +
    `<h2 class="cta__title" id="cta-title">${escapeHtml(cta.title)}</h2>` +
    `<p class="cta__lead">${escapeHtml(cta.lead)}</p>` +
    '<div class="cta__actions">' +
    renderLink(cta.primary, { className: 'btn btn--primary', arrow: true }) +
    renderLink(cta.secondary, { className: 'btn btn--ghost', arrow: true }) +
    '</div></section>'
  );
}

export function renderFooter(footer: Site['footer']): string {
  const links = footer.quickLinks.map((l) => `<li>${renderLink(l, { className: 'footer__link' })}</li>`).join('');
  return (
    '<footer class="site-footer" id="contact">' +
    '<div class="footer__grid">' +
    '<address class="footer__contact">' +
    `<p class="footer__org">${escapeHtml(footer.org)}</p>` +
    `<p>${escapeHtml(footer.address)}</p>` +
    `<p>電話 ${escapeHtml(footer.tel)}　傳真 ${escapeHtml(footer.fax)}</p>` +
    `<p>${renderLink({ label: footer.email, url: `mailto:${footer.email}` })}</p>` +
    '</address>' +
    '<nav class="footer__nav" aria-labelledby="footer-links-title">' +
    '<h2 class="footer__heading" id="footer-links-title">系網快速連結</h2>' +
    `<ul class="footer__links">${links}</ul></nav>` +
    '</div>' +
    `<p class="footer__disclaimer">${escapeHtml(footer.disclaimer)}</p>` +
    '<p class="footer__top"><a href="#top">回到頁首 ↑</a></p>' +
    '</footer>'
  );
}
```

- [ ] **Step 5: 確認測試通過**

Run: `npx vitest run tests/sections.test.ts`
Expected: PASS（13 tests）。

- [ ] **Step 6: Commit**

```powershell
git add src/render/sections.ts src/render/head.ts tests/sections.test.ts
git commit -m "feat: 各區塊與 head 的 HTML 渲染"
```

---

### Task 7: 頁面組裝與 Vite 渲染外掛

**Files:**
- Create: `src/render/page.ts`
- Modify: `vite.config.ts`（整檔換掉）
- Test: `tests/page.test.ts`

- [ ] **Step 1: 寫失敗的測試 `tests/page.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { site } from '../src/data/site';
import { fillPlaceholders, renderPage } from '../src/render/page';

describe('renderPage', () => {
  it('renders every placeholder used by index.html', () => {
    expect(Object.keys(renderPage(site)).sort()).toEqual(
      ['cta', 'footer', 'gifts', 'head', 'hero', 'highlights', 'nav', 'partners', 'stats'].sort(),
    );
  });
});

describe('fillPlaceholders', () => {
  it('replaces each marker with its html', () => {
    const html = '<main><!-- @render:a --><!-- @render:b --></main>';
    expect(fillPlaceholders(html, { a: '<p>A</p>', b: '<p>B</p>' })).toBe('<main><p>A</p><p>B</p></main>');
  });

  it('fails on a marker without a renderer', () => {
    expect(() => fillPlaceholders('<!-- @render:missing -->', {})).toThrow(/No renderer for "missing"/);
  });

  it('fails on a renderer whose marker is missing', () => {
    expect(() => fillPlaceholders('<main></main>', { extra: '<p></p>' })).toThrow(/Unused renderer "extra"/);
  });

  it('keeps $ sequences in the html literally', () => {
    expect(fillPlaceholders('<!-- @render:a -->', { a: '$& $1' })).toBe('$& $1');
  });
});
```

- [ ] **Step 2: 確認測試失敗**

Run: `npx vitest run tests/page.test.ts`
Expected: FAIL，找不到 `../src/render/page`。

- [ ] **Step 3: 建立 `src/render/page.ts`**

```ts
import type { Site } from '../data/types';
import { renderHead } from './head';
import {
  renderCta,
  renderFooter,
  renderGifts,
  renderHero,
  renderHighlights,
  renderNav,
  renderPartners,
  renderStats,
} from './sections';
import { layoutForHighlights, renderTreeSvg } from './tree-svg';

export type RenderedSections = Readonly<Record<string, string>>;

export function renderPage(site: Site): RenderedSections {
  const tree = renderTreeSvg(layoutForHighlights(site.highlights), site.highlights, site.hero.treeLabel);
  return {
    head: renderHead(site.meta),
    nav: renderNav(site.nav),
    hero: renderHero(site.hero, tree),
    highlights: renderHighlights(site.highlightsSection, site.highlights),
    gifts: renderGifts(site.giftsSection, site.gifts),
    stats: renderStats(site.statsSection, site.stats),
    partners: renderPartners(site.partnersSection, site.partners),
    cta: renderCta(site.cta),
    footer: renderFooter(site.footer),
  };
}

const MARKER = /<!-- @render:([a-z]+) -->/g;

export function fillPlaceholders(html: string, sections: RenderedSections): string {
  const used = new Set<string>();
  const filled = html.replace(MARKER, (_match, name: string) => {
    const section = sections[name];
    if (section === undefined) {
      throw new Error(`No renderer for "${name}"`);
    }
    used.add(name);
    return section;
  });
  const unused = Object.keys(sections).find((name) => !used.has(name));
  if (unused) {
    throw new Error(`Unused renderer "${unused}"`);
  }
  return filled;
}
```

- [ ] **Step 4: 確認測試通過**

Run: `npx vitest run tests/page.test.ts`
Expected: PASS（5 tests）。

- [ ] **Step 5: 把外掛接上 `vite.config.ts`（整檔換成下面內容）**

```ts
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import { site } from './src/data/site';
import { fillPlaceholders, renderPage } from './src/render/page';

function renderSite(): Plugin {
  return {
    name: 'render-site',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => fillPlaceholders(html, renderPage(site)),
    },
  };
}

export default defineConfig({
  plugins: [renderSite()],
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/main.ts'],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
```

- [ ] **Step 6: 確認 build 後內容已寫進 HTML**

Run: `npm run build; Select-String -Path dist/index.html -Pattern 'id="hl-ai"','LOGO','@render:' | ForEach-Object { $_.Pattern }`
Expected: build 成功；輸出含 `id="hl-ai"` 和 `LOGO`，不含 `@render:`。

- [ ] **Step 7: Commit**

```powershell
git add src/render/page.ts vite.config.ts tests/page.test.ts
git commit -m "feat: build 時把內容渲染進 index.html"
```

---

### Task 8: 聖誕倒數

**Files:**
- Create: `src/countdown.ts`
- Test: `tests/countdown.test.ts`

- [ ] **Step 1: 寫失敗的測試 `tests/countdown.test.ts`**

```ts
// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { christmasState, countdownText, initCountdown } from '../src/countdown';

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
```

- [ ] **Step 2: 確認測試失敗**

Run: `npx vitest run tests/countdown.test.ts`
Expected: FAIL，找不到 `../src/countdown`。

- [ ] **Step 3: 建立 `src/countdown.ts`**

```ts
export type ChristmasState = { readonly kind: 'before'; readonly days: number } | { readonly kind: 'day' } | { readonly kind: 'after' };

/** 台灣固定 UTC+8，沒有日光節約 */
const TAIPEI_OFFSET_MS = 8 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function christmasState(now: Date): ChristmasState {
  const taipei = new Date(now.getTime() + TAIPEI_OFFSET_MS);
  const year = taipei.getUTCFullYear();
  const month = taipei.getUTCMonth() + 1;
  const day = taipei.getUTCDate();
  if (month === 12 && day === 25) {
    return { kind: 'day' };
  }
  if (month === 12 && day > 25) {
    return { kind: 'after' };
  }
  const today = Date.UTC(year, month - 1, day);
  const christmas = Date.UTC(year, 11, 25);
  return { kind: 'before', days: Math.round((christmas - today) / DAY_MS) };
}

export function countdownText(state: ChristmasState): string {
  switch (state.kind) {
    case 'before':
      return `距離聖誕節還有 ${state.days} 天`;
    case 'day':
      return 'Merry Christmas！今天就是聖誕節';
    case 'after':
      return 'Merry Christmas & Happy New Year';
  }
}

export function initCountdown(root: ParentNode, now: Date = new Date()): void {
  const text = countdownText(christmasState(now));
  root.querySelectorAll<HTMLElement>('[data-countdown]').forEach((el) => {
    el.textContent = text;
  });
}
```

- [ ] **Step 4: 確認測試通過**

Run: `npx vitest run tests/countdown.test.ts`
Expected: PASS（10 tests）。

- [ ] **Step 5: Commit**

```powershell
git add src/countdown.ts tests/countdown.test.ts
git commit -m "feat: 以台灣時間計算的聖誕倒數"
```

---

### Task 9: 偏好設定與減少動態

**Files:**
- Create: `src/prefs.ts`
- Test: `tests/prefs.test.ts`

- [ ] **Step 1: 寫失敗的測試 `tests/prefs.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { browserStore, prefersReducedMotion, readToggle, writeToggle, type KeyValueStore } from '../src/prefs';

function memoryStore(): KeyValueStore & { readonly data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

const throwingStore: KeyValueStore = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
};

describe('readToggle / writeToggle', () => {
  it('round-trips on and off', () => {
    const store = memoryStore();
    writeToggle(store, 'xmas-snow', false);
    expect(store.data.get('xmas-snow')).toBe('off');
    expect(readToggle(store, 'xmas-snow', true)).toBe(false);
    writeToggle(store, 'xmas-snow', true);
    expect(readToggle(store, 'xmas-snow', false)).toBe(true);
  });

  it('falls back when nothing usable is stored', () => {
    const store = memoryStore();
    store.data.set('xmas-snow', 'maybe');
    expect(readToggle(store, 'xmas-snow', true)).toBe(true);
    expect(readToggle(memoryStore(), 'xmas-snow', false)).toBe(false);
    expect(readToggle(null, 'xmas-snow', true)).toBe(true);
  });

  it('never throws when storage is blocked', () => {
    expect(readToggle(throwingStore, 'xmas-snow', true)).toBe(true);
    expect(() => writeToggle(throwingStore, 'xmas-snow', true)).not.toThrow();
  });
});

describe('browserStore', () => {
  it('returns null when reading localStorage throws', () => {
    const win = {
      get localStorage(): Storage {
        throw new Error('SecurityError');
      },
    } as unknown as Window;
    expect(browserStore(win)).toBeNull();
  });

  it('returns localStorage when available', () => {
    const store = memoryStore();
    expect(browserStore({ localStorage: store } as unknown as Window)).toBe(store);
  });
});

describe('prefersReducedMotion', () => {
  const withMatch = (matches: boolean) => ({ matchMedia: () => ({ matches }) }) as unknown as Window;

  it('follows the media query', () => {
    expect(prefersReducedMotion(withMatch(true))).toBe(true);
    expect(prefersReducedMotion(withMatch(false))).toBe(false);
  });

  it('assumes motion is fine when matchMedia is missing', () => {
    expect(prefersReducedMotion({} as Window)).toBe(false);
  });
});
```

- [ ] **Step 2: 確認測試失敗**

Run: `npx vitest run tests/prefs.test.ts`
Expected: FAIL，找不到 `../src/prefs`。

- [ ] **Step 3: 建立 `src/prefs.ts`**

```ts
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

export function prefersReducedMotion(win: Window): boolean {
  return typeof win.matchMedia === 'function' && win.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
```

- [ ] **Step 4: 確認測試通過**

Run: `npx vitest run tests/prefs.test.ts`
Expected: PASS（7 tests）。

- [ ] **Step 5: Commit**

```powershell
git add src/prefs.ts tests/prefs.test.ts
git commit -m "feat: 偏好讀寫與減少動態判斷"
```

---

### Task 10: 雪花模型

**Files:**
- Create: `src/snow/model.ts`
- Test: `tests/snow-model.test.ts`

- [ ] **Step 1: 寫失敗的測試 `tests/snow-model.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { SNOW, createFlake, flakeCount, flakeX, stepFlake, type Flake } from '../src/snow/model';

/** 可重現的亂數（mulberry32） */
function seeded(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const flake: Flake = { x: 100, y: 50, speed: 40, drift: 10, phase: 0, size: 2, alpha: 0.8, glyph: null };

describe('flakeCount', () => {
  it.each([
    [320, 568, 40],
    [1440, 900, 108],
    [3840, 2160, 160],
  ])('%i x %i -> %i flakes', (w, h, expected) => {
    expect(flakeCount(w, h)).toBe(expected);
  });
});

describe('createFlake', () => {
  it('keeps flakes on screen with sane ranges', () => {
    const rand = seeded(1);
    for (let i = 0; i < 500; i += 1) {
      const f = createFlake(rand, 800, 600);
      expect(f.x).toBeGreaterThanOrEqual(0);
      expect(f.x).toBeLessThanOrEqual(800);
      expect(f.y).toBeGreaterThanOrEqual(0);
      expect(f.y).toBeLessThanOrEqual(600);
      expect(f.alpha).toBeGreaterThan(0);
      expect(f.alpha).toBeLessThanOrEqual(0.9);
    }
  });

  it('makes about a quarter of the flakes 0 or 1 glyphs', () => {
    const rand = seeded(42);
    const flakes = Array.from({ length: 4000 }, () => createFlake(rand, 800, 600));
    const glyphs = flakes.filter((f) => f.glyph !== null);
    expect(Math.abs(glyphs.length / flakes.length - SNOW.glyphRatio)).toBeLessThan(0.05);
    expect(new Set(glyphs.map((f) => f.glyph))).toEqual(new Set(['0', '1']));
  });
});

describe('stepFlake', () => {
  it('falls by speed x time and advances the sway phase', () => {
    const next = stepFlake(flake, 500, 600);
    expect(next.y).toBe(70);
    expect(next.phase).toBe(0.5);
    expect(flake.y).toBe(50);
  });

  it('wraps to just above the top after leaving the bottom', () => {
    const next = stepFlake({ ...flake, y: 601 }, 100, 600);
    expect(next.y).toBe(-2);
  });
});

describe('flakeX', () => {
  it('sways within the drift range', () => {
    expect(flakeX({ ...flake, phase: Math.PI / 2 })).toBeCloseTo(110);
    expect(flakeX({ ...flake, phase: -Math.PI / 2 })).toBeCloseTo(90);
  });
});
```

- [ ] **Step 2: 確認測試失敗**

Run: `npx vitest run tests/snow-model.test.ts`
Expected: FAIL，找不到 `../src/snow/model`。

- [ ] **Step 3: 建立 `src/snow/model.ts`**

```ts
export interface Flake {
  readonly x: number;
  readonly y: number;
  /** 每秒落下的 px */
  readonly speed: number;
  /** 左右晃動的幅度 px */
  readonly drift: number;
  readonly phase: number;
  /** 圓點是半徑，字元雪是字級 */
  readonly size: number;
  readonly alpha: number;
  readonly glyph: '0' | '1' | null;
}

export type Random = () => number;

export const SNOW = { areaPerFlake: 12000, min: 40, max: 160, glyphRatio: 0.25 } as const;

export function flakeCount(width: number, height: number): number {
  const raw = Math.round((width * height) / SNOW.areaPerFlake);
  return Math.min(SNOW.max, Math.max(SNOW.min, raw));
}

const between = (rand: Random, min: number, max: number): number => min + rand() * (max - min);

export function createFlake(rand: Random, width: number, height: number): Flake {
  const isGlyph = rand() < SNOW.glyphRatio;
  return {
    x: rand() * width,
    y: rand() * height,
    speed: between(rand, 18, 60),
    drift: between(rand, 4, 14),
    phase: rand() * Math.PI * 2,
    size: isGlyph ? between(rand, 10, 14) : between(rand, 1, 2.5),
    alpha: isGlyph ? between(rand, 0.35, 0.7) : between(rand, 0.4, 0.9),
    glyph: isGlyph ? (rand() < 0.5 ? '0' : '1') : null,
  };
}

export function stepFlake(flake: Flake, dtMs: number, height: number): Flake {
  const y = flake.y + (flake.speed * dtMs) / 1000;
  return {
    ...flake,
    y: y > height + flake.size ? -flake.size : y,
    phase: flake.phase + dtMs / 1000,
  };
}

export function flakeX(flake: Flake): number {
  return flake.x + Math.sin(flake.phase) * flake.drift;
}
```

- [ ] **Step 4: 確認測試通過**

Run: `npx vitest run tests/snow-model.test.ts`
Expected: PASS（8 tests）。

- [ ] **Step 5: Commit**

```powershell
git add src/snow/model.ts tests/snow-model.test.ts
git commit -m "feat: 資料雪的數量、產生與移動計算"
```

---

### Task 11: 飄雪畫布與開關

**Files:**
- Create: `src/snow/snow.ts`
- Test: `tests/snow.test.ts`

- [ ] **Step 1: 寫失敗的測試 `tests/snow.test.ts`**

```ts
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initSnow } from '../src/snow/snow';

let frames: FrameRequestCallback[] = [];

function fakeContext(): CanvasRenderingContext2D {
  return {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    fillText: vi.fn(),
    fillStyle: '',
    font: '',
  } as unknown as CanvasRenderingContext2D;
}

function setHidden(hidden: boolean): void {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
  document.dispatchEvent(new Event('visibilitychange'));
}

const toggle = (): HTMLButtonElement => document.querySelector<HTMLButtonElement>('.snow-toggle')!;
const canvas = (): HTMLCanvasElement => document.querySelector<HTMLCanvasElement>('canvas.snow')!;

beforeEach(() => {
  document.body.innerHTML =
    '<canvas class="snow"></canvas><button class="snow-toggle" type="button" aria-pressed="true" hidden>飄雪</button>';
  localStorage.clear();
  frames = [];
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => fakeContext() as never);
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    frames.push(cb);
    return frames.length;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
  setHidden(false);
  Reflect.deleteProperty(window, 'matchMedia');
});

describe('initSnow', () => {
  it('does nothing without a canvas or a 2d context', () => {
    document.body.innerHTML = '';
    expect(initSnow({ win: window, doc: document })).toBeNull();
    document.body.innerHTML = '<canvas class="snow"></canvas><button class="snow-toggle" hidden></button>';
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    expect(initSnow({ win: window, doc: document })).toBeNull();
    expect(toggle().hidden).toBe(true);
  });

  it('starts snowing and shows the toggle', () => {
    const snow = initSnow({ win: window, doc: document, random: () => 0.5 })!;
    expect(snow.isRunning()).toBe(true);
    expect(toggle().hidden).toBe(false);
    expect(toggle().getAttribute('aria-pressed')).toBe('true');
    frames.shift()?.(16);
    frames.shift()?.(32);
    expect(snow.isRunning()).toBe(true);
  });

  it('turns off, hides the canvas and remembers the choice', () => {
    const snow = initSnow({ win: window, doc: document })!;
    toggle().click();
    expect(snow.isRunning()).toBe(false);
    expect(canvas().hidden).toBe(true);
    expect(toggle().getAttribute('aria-pressed')).toBe('false');
    expect(localStorage.getItem('xmas-snow')).toBe('off');
    toggle().click();
    expect(snow.isRunning()).toBe(true);
    expect(localStorage.getItem('xmas-snow')).toBe('on');
  });

  it('pauses while the tab is hidden', () => {
    const snow = initSnow({ win: window, doc: document })!;
    setHidden(true);
    expect(snow.isRunning()).toBe(false);
    setHidden(false);
    expect(snow.isRunning()).toBe(true);
  });

  it('stays off by default when reduced motion is requested', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    const snow = initSnow({ win: window, doc: document })!;
    expect(snow.isRunning()).toBe(false);
    expect(toggle().getAttribute('aria-pressed')).toBe('false');
  });

  it('respects a stored choice over the reduced motion default', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    localStorage.setItem('xmas-snow', 'on');
    expect(initSnow({ win: window, doc: document })!.isRunning()).toBe(true);
  });

  it('draws both dots and 0/1 glyphs', () => {
    const ctx = fakeContext();
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(ctx as never);
    let i = 0;
    const alternating = (): number => (i++ % 2 === 0 ? 0.1 : 0.9);
    initSnow({ win: window, doc: document, random: alternating });
    frames.shift()?.(16);
    expect(ctx.fillText).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: 確認測試失敗**

Run: `npx vitest run tests/snow.test.ts`
Expected: FAIL，找不到 `../src/snow/snow`。

- [ ] **Step 3: 建立 `src/snow/snow.ts`**

```ts
import { SNOW_KEY, browserStore, prefersReducedMotion, readToggle, writeToggle } from '../prefs';
import { createFlake, flakeCount, flakeX, stepFlake, type Flake, type Random } from './model';

export interface SnowDeps {
  readonly win: Window;
  readonly doc: Document;
  readonly random?: Random;
}

export interface SnowController {
  readonly isRunning: () => boolean;
  readonly setEnabled: (enabled: boolean) => void;
}

const MAX_DPR = 2;
const MAX_STEP_MS = 100;
/** 與 --color-text 相同的 RGB */
const SNOW_RGB = '232, 238, 249';
const GLYPH_FONT = '"JetBrains Mono", ui-monospace, monospace';

export function initSnow({ win, doc, random = Math.random }: SnowDeps): SnowController | null {
  const canvas = doc.querySelector<HTMLCanvasElement>('canvas.snow');
  const toggle = doc.querySelector<HTMLButtonElement>('.snow-toggle');
  const ctx = canvas?.getContext('2d') ?? null;
  if (!canvas || !toggle || !ctx) {
    return null;
  }

  const store = browserStore(win);
  let enabled = readToggle(store, SNOW_KEY, !prefersReducedMotion(win));
  let flakes: Flake[] = [];
  let width = 0;
  let height = 0;
  let frame: number | null = null;
  let last = 0;

  const resize = (): void => {
    const dpr = Math.min(win.devicePixelRatio || 1, MAX_DPR);
    width = win.innerWidth;
    height = win.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    flakes = Array.from({ length: flakeCount(width, height) }, () => createFlake(random, width, height));
  };

  const draw = (): void => {
    ctx.clearRect(0, 0, width, height);
    for (const f of flakes) {
      ctx.fillStyle = `rgba(${SNOW_RGB}, ${f.alpha})`;
      if (f.glyph) {
        ctx.font = `${f.size}px ${GLYPH_FONT}`;
        ctx.fillText(f.glyph, flakeX(f), f.y);
      } else {
        ctx.beginPath();
        ctx.arc(flakeX(f), f.y, f.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const tick = (time: number): void => {
    const dt = last ? Math.min(time - last, MAX_STEP_MS) : 16;
    last = time;
    flakes = flakes.map((f) => stepFlake(f, dt, height));
    draw();
    frame = win.requestAnimationFrame(tick);
  };

  const start = (): void => {
    if (frame !== null || !enabled || doc.hidden) {
      return;
    }
    last = 0;
    frame = win.requestAnimationFrame(tick);
  };

  const stop = (): void => {
    if (frame !== null) {
      win.cancelAnimationFrame(frame);
      frame = null;
    }
  };

  const render = (): void => {
    canvas.hidden = !enabled;
    toggle.setAttribute('aria-pressed', String(enabled));
    if (enabled) {
      start();
    } else {
      stop();
      ctx.clearRect(0, 0, width, height);
    }
  };

  const setEnabled = (next: boolean): void => {
    enabled = next;
    writeToggle(store, SNOW_KEY, next);
    render();
  };

  toggle.hidden = false;
  toggle.addEventListener('click', () => setEnabled(!enabled));
  doc.addEventListener('visibilitychange', () => (doc.hidden ? stop() : start()));
  win.addEventListener('resize', resize);
  resize();
  render();

  return { isRunning: () => frame !== null, setEnabled };
}
```

- [ ] **Step 4: 確認測試通過**

Run: `npx vitest run tests/snow.test.ts`
Expected: PASS（7 tests）。

- [ ] **Step 5: Commit**

```powershell
git add src/snow/snow.ts tests/snow.test.ts
git commit -m "feat: 飄雪畫布、開關與分頁暫停"
```

---

### Task 12: 數字跳動

**Files:**
- Create: `src/countup.ts`
- Test: `tests/countup.test.ts`

- [ ] **Step 1: 寫失敗的測試 `tests/countup.test.ts`**

```ts
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { COUNTUP_MS, easeOutCubic, initCountUp, valueAt } from '../src/countup';
import { site } from '../src/data/site';
import { renderStats } from '../src/render/sections';

class FakeObserver {
  static last: FakeObserver | null = null;
  observed: Element[] = [];
  constructor(private readonly callback: IntersectionObserverCallback) {
    FakeObserver.last = this;
  }
  observe(el: Element): void {
    this.observed.push(el);
  }
  unobserve(el: Element): void {
    this.observed = this.observed.filter((e) => e !== el);
  }
  disconnect(): void {
    this.observed = [];
  }
  reveal(el: Element): void {
    const entry = { isIntersecting: true, target: el } as IntersectionObserverEntry;
    this.callback([entry], this as unknown as IntersectionObserver);
  }
}

let frames: FrameRequestCallback[] = [];
const values = (): string[] =>
  [...document.querySelectorAll('[data-countup]')].map((el) => el.textContent ?? '');

beforeEach(() => {
  document.body.innerHTML = renderStats(site.statsSection, site.stats);
  frames = [];
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    frames.push(cb);
    return frames.length;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(window, 'IntersectionObserver');
  Reflect.deleteProperty(window, 'matchMedia');
  FakeObserver.last = null;
});

describe('easing', () => {
  it('eases out and clamps to [0, 1]', () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(0.5)).toBe(0.875);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(-1)).toBe(0);
    expect(easeOutCubic(2)).toBe(1);
  });

  it('rounds intermediate values', () => {
    expect(valueAt(95, 0)).toBe(0);
    expect(valueAt(95, COUNTUP_MS / 2)).toBe(83);
    expect(valueAt(95, COUNTUP_MS)).toBe(95);
  });
});

describe('initCountUp', () => {
  it('leaves final numbers alone when motion is reduced', () => {
    window.IntersectionObserver = FakeObserver as unknown as typeof IntersectionObserver;
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    initCountUp(window, document);
    expect(values()).toEqual(['95%', '50+', '100+']);
  });

  it('leaves final numbers alone without IntersectionObserver', () => {
    initCountUp(window, document);
    expect(values()).toEqual(['95%', '50+', '100+']);
  });

  it('counts up from zero once a stat scrolls into view', () => {
    window.IntersectionObserver = FakeObserver as unknown as typeof IntersectionObserver;
    initCountUp(window, document);
    expect(values()).toEqual(['0%', '0+', '0+']);

    const ringFigure = document.querySelector('.stat--ring')!;
    FakeObserver.last!.reveal(ringFigure);
    expect(FakeObserver.last!.observed).not.toContain(ringFigure);
    frames.shift()?.(1000);
    frames.shift()?.(1000 + COUNTUP_MS / 2);
    expect(values()[0]).toBe('83%');
    frames.shift()?.(1000 + COUNTUP_MS);
    expect(values()).toEqual(['95%', '0+', '0+']);
    expect(frames).toHaveLength(0);

    const offset = Number(document.querySelector('circle[data-ring]')!.getAttribute('stroke-dashoffset'));
    expect(offset).toBeCloseTo(16.34, 1);
  });

  it('ignores observer entries that are not intersecting', () => {
    window.IntersectionObserver = FakeObserver as unknown as typeof IntersectionObserver;
    initCountUp(window, document);
    const figure = document.querySelector('.stat--count')!;
    const entry = { isIntersecting: false, target: figure } as IntersectionObserverEntry;
    (FakeObserver.last as unknown as { callback: IntersectionObserverCallback }).callback(
      [entry],
      FakeObserver.last as unknown as IntersectionObserver,
    );
    expect(frames).toHaveLength(0);
  });
});
```

- [ ] **Step 2: 確認測試失敗**

Run: `npx vitest run tests/countup.test.ts`
Expected: FAIL，找不到 `../src/countup`。

- [ ] **Step 3: 建立 `src/countup.ts`**

```ts
import { prefersReducedMotion } from './prefs';

export const COUNTUP_MS = 1200;
const VISIBLE_THRESHOLD = 0.4;

interface Counter {
  readonly figure: Element;
  readonly el: HTMLElement;
  readonly target: number;
  readonly suffix: string;
  readonly ring: SVGCircleElement | null;
}

export function easeOutCubic(t: number): number {
  const clamped = Math.min(Math.max(t, 0), 1);
  return 1 - (1 - clamped) ** 3;
}

export function valueAt(target: number, elapsedMs: number, durationMs: number = COUNTUP_MS): number {
  return Math.round(target * easeOutCubic(elapsedMs / durationMs));
}

function show(counter: Counter, value: number): void {
  counter.el.textContent = `${value}${counter.suffix}`;
  if (counter.ring) {
    const circumference = Number(counter.ring.getAttribute('stroke-dasharray'));
    counter.ring.setAttribute('stroke-dashoffset', String(circumference * (1 - value / 100)));
  }
}

function animate(win: Window, counter: Counter): void {
  let start: number | null = null;
  const step = (time: number): void => {
    start ??= time;
    const elapsed = time - start;
    show(counter, valueAt(counter.target, elapsed));
    if (elapsed < COUNTUP_MS) {
      win.requestAnimationFrame(step);
    }
  };
  win.requestAnimationFrame(step);
}

function toCounter(el: HTMLElement): Counter {
  const figure = el.closest('.stat') ?? el;
  return {
    figure,
    el,
    target: Number(el.dataset.countup),
    suffix: el.dataset.suffix ?? '',
    ring: figure.querySelector<SVGCircleElement>('circle[data-ring]'),
  };
}

/** HTML 裡已經是終值；只有能播動畫時才先歸零，捲到時再跳回終值 */
export function initCountUp(win: Window, doc: Document): void {
  if (prefersReducedMotion(win) || typeof win.IntersectionObserver !== 'function') {
    return;
  }
  const counters = [...doc.querySelectorAll<HTMLElement>('[data-countup]')].map(toCounter);
  const observer = new win.IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const counter = counters.find((c) => c.figure === entry.target);
        if (!entry.isIntersecting || !counter) {
          continue;
        }
        observer.unobserve(entry.target);
        animate(win, counter);
      }
    },
    { threshold: VISIBLE_THRESHOLD },
  );
  for (const counter of counters) {
    show(counter, 0);
    observer.observe(counter.figure);
  }
}
```

- [ ] **Step 4: 確認測試通過**

Run: `npx vitest run tests/countup.test.ts`
Expected: PASS（6 tests）。

- [ ] **Step 5: Commit**

```powershell
git add src/countup.ts tests/countup.test.ts
git commit -m "feat: 捲動到數字區時跳動數字與環形圖"
```

---

### Task 13: 吊飾互動、手機選單與進入點

**Files:**
- Create: `src/tree/tree.ts`、`src/nav.ts`、`src/safe-init.ts`
- Modify: `src/main.ts`（整檔換掉）
- Test: `tests/interactions.test.ts`

- [ ] **Step 1: 寫失敗的測試 `tests/interactions.test.ts`**

```ts
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { site } from '../src/data/site';
import { initNav } from '../src/nav';
import { renderHighlights, renderNav } from '../src/render/sections';
import { layoutForHighlights, renderTreeSvg } from '../src/render/tree-svg';
import { safeInit } from '../src/safe-init';
import { initTree, openHighlight } from '../src/tree/tree';

const details = (id: string): HTMLDetailsElement => document.getElementById(`hl-${id}`) as HTMLDetailsElement;

describe('openHighlight', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = renderHighlights(site.highlightsSection, site.highlights) + '<p id="hl-fake"></p>';
  });
  afterEach(() => vi.useRealTimers());

  it('opens the card and lights it briefly', () => {
    expect(openHighlight(window, document, '#hl-ai')).toBe(details('ai'));
    expect(details('ai').open).toBe(true);
    expect(details('ai').classList.contains('is-lit')).toBe(true);
    vi.advanceTimersByTime(1600);
    expect(details('ai').classList.contains('is-lit')).toBe(false);
  });

  it('ignores hashes that are not highlight cards', () => {
    expect(openHighlight(window, document, '#gifts')).toBeNull();
    expect(openHighlight(window, document, '#hl-missing')).toBeNull();
    expect(openHighlight(window, document, '#hl-fake')).toBeNull();
  });
});

describe('initTree', () => {
  beforeEach(() => {
    const tree = renderTreeSvg(layoutForHighlights(site.highlights), site.highlights, 'tree');
    document.body.innerHTML = tree + renderHighlights(site.highlightsSection, site.highlights);
    history.replaceState(null, '', '#');
  });

  it('opens the matching card when an ornament is clicked', () => {
    initTree(window, document);
    document.querySelector('a.ornament[href="#hl-global"]')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(details('global').open).toBe(true);
  });

  it('opens the card named in the url on load and on hash change', () => {
    history.replaceState(null, '', '#hl-career');
    initTree(window, document);
    expect(details('career').open).toBe(true);
    history.replaceState(null, '', '#hl-data');
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    expect(details('data').open).toBe(true);
  });
});

describe('initNav', () => {
  beforeEach(() => {
    document.body.innerHTML = renderNav(site.nav);
  });

  const toggle = (): HTMLButtonElement => document.querySelector<HTMLButtonElement>('.nav__toggle')!;
  const header = (): HTMLElement => document.querySelector<HTMLElement>('.site-header')!;

  it('reveals the toggle and opens and closes the menu', () => {
    initNav(document);
    expect(toggle().hidden).toBe(false);
    expect(header().classList.contains('has-js')).toBe(true);
    toggle().click();
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    expect(header().classList.contains('is-open')).toBe(true);
    toggle().click();
    expect(header().classList.contains('is-open')).toBe(false);
  });

  it('closes after picking a link or pressing Escape', () => {
    initNav(document);
    toggle().click();
    document.querySelector<HTMLAnchorElement>('.nav__menu a')!.click();
    expect(header().classList.contains('is-open')).toBe(false);
    toggle().click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(toggle());
  });

  it('does nothing when the nav is missing', () => {
    document.body.innerHTML = '';
    expect(() => initNav(document)).not.toThrow();
  });
});

describe('safeInit', () => {
  it('keeps going after a failing task and reports it', () => {
    const report = vi.fn();
    const ran: string[] = [];
    const failed = safeInit(
      [
        ['a', () => ran.push('a')],
        ['b', () => {
          throw new Error('boom');
        }],
        ['c', () => ran.push('c')],
      ],
      report,
    );
    expect(ran).toEqual(['a', 'c']);
    expect(failed).toEqual(['b']);
    expect(report).toHaveBeenCalledWith('b', expect.any(Error));
  });

  it('logs failures to console.error by default', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    safeInit([
      ['x', () => {
        throw new Error('nope');
      }],
    ]);
    expect(spy).toHaveBeenCalledWith('[init] x failed', expect.any(Error));
    spy.mockRestore();
  });
});
```

- [ ] **Step 2: 確認測試失敗**

Run: `npx vitest run tests/interactions.test.ts`
Expected: FAIL，找不到 `../src/nav`。

- [ ] **Step 3: 建立 `src/tree/tree.ts`**

```ts
const HIGHLIGHT_PREFIX = '#hl-';
const LIT_MS = 1600;

/** 打開網址 hash 指到的特色卡片，並讓它亮一下 */
export function openHighlight(win: Window, doc: Document, hash: string): HTMLDetailsElement | null {
  if (!hash.startsWith(HIGHLIGHT_PREFIX)) {
    return null;
  }
  const target = doc.getElementById(hash.slice(1));
  if (!target || target.tagName !== 'DETAILS') {
    return null;
  }
  const card = target as HTMLDetailsElement;
  card.open = true;
  card.classList.add('is-lit');
  win.setTimeout(() => card.classList.remove('is-lit'), LIT_MS);
  return card;
}

export function initTree(win: Window, doc: Document): void {
  doc.querySelectorAll<SVGAElement>('a.ornament').forEach((ornament) => {
    ornament.addEventListener('click', () => {
      openHighlight(win, doc, ornament.getAttribute('href') ?? '');
    });
  });
  win.addEventListener('hashchange', () => {
    openHighlight(win, doc, win.location.hash);
  });
  openHighlight(win, doc, win.location.hash);
}
```

- [ ] **Step 4: 建立 `src/nav.ts`**

```ts
export function initNav(doc: Document): void {
  const header = doc.querySelector<HTMLElement>('.site-header');
  const toggle = doc.querySelector<HTMLButtonElement>('.nav__toggle');
  const menu = doc.getElementById('nav-menu');
  if (!header || !toggle || !menu) {
    return;
  }

  const isOpen = (): boolean => toggle.getAttribute('aria-expanded') === 'true';
  const setOpen = (open: boolean): void => {
    toggle.setAttribute('aria-expanded', String(open));
    header.classList.toggle('is-open', open);
  };

  header.classList.add('has-js');
  toggle.hidden = false;
  toggle.addEventListener('click', () => setOpen(!isOpen()));
  menu.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a')) {
      setOpen(false);
    }
  });
  doc.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });
}
```

- [ ] **Step 5: 建立 `src/safe-init.ts`**

```ts
export type InitTask = readonly [name: string, run: () => void];
export type ErrorReporter = (name: string, error: unknown) => void;

const logError: ErrorReporter = (name, error) => {
  console.error(`[init] ${name} failed`, error);
};

/** 逐一啟動互動模組；一個壞掉不影響其他，回傳失敗的模組名稱 */
export function safeInit(tasks: readonly InitTask[], report: ErrorReporter = logError): string[] {
  const failed: string[] = [];
  for (const [name, run] of tasks) {
    try {
      run();
    } catch (error) {
      failed.push(name);
      report(name, error);
    }
  }
  return failed;
}
```

- [ ] **Step 6: 把 `src/main.ts` 換成正式內容**

```ts
import { initCountdown } from './countdown';
import { initCountUp } from './countup';
import { initNav } from './nav';
import { safeInit } from './safe-init';
import { initSnow } from './snow/snow';
import { initTree } from './tree/tree';

document.documentElement.classList.add('js');

safeInit([
  ['nav', () => initNav(document)],
  ['countdown', () => initCountdown(document)],
  ['tree', () => initTree(window, document)],
  ['countup', () => initCountUp(window, document)],
  ['snow', () => void initSnow({ win: window, doc: document })],
]);
```

- [ ] **Step 7: 確認測試通過，且全部單元測試都綠燈**

Run: `npx vitest run`
Expected: PASS（全部 test files，含本任務新增的 9 tests）。

- [ ] **Step 8: Commit**

```powershell
git add src/tree/tree.ts src/nav.ts src/safe-init.ts src/main.ts tests/interactions.test.ts
git commit -m "feat: 吊飾展開特色卡、手機選單與模組啟動"
```

---

### Task 14: 樣式（一）：變數、基礎、導覽、主視覺

**Files:**
- Create: `src/styles/tokens.css`、`src/styles/base.css`、`src/styles/nav.css`、`src/styles/hero.css`、`src/styles/index.css`
- Modify: `src/main.ts`（第一行加入樣式 import）

- [ ] **Step 1: 建立 `src/styles/tokens.css`**

```css
:root {
  color-scheme: dark;

  --color-bg: #050a1f;
  --color-surface: #0b1430;
  --color-surface-2: #101c40;
  --color-grid: #12204a;
  --color-line: #1d2c5c;
  --color-text: #e8eef9;
  --color-text-muted: #9aa8c7;
  --color-pine: #3ddc84;
  --color-berry: #ff5a5f;
  --color-ice: #4cc9f0;
  --color-gold: #f2c94c;
  --color-trunk: #5b4636;

  --font-sans: 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, Consolas, monospace;

  --text-hero: clamp(2.5rem, 1.2rem + 5vw, 5rem);
  --text-section: clamp(1.75rem, 1.2rem + 2vw, 2.5rem);
  --text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --text-small: 0.875rem;

  --space-section: clamp(4rem, 3rem + 5vw, 8rem);
  --gutter: clamp(1rem, 0.5rem + 2.5vw, 2.5rem);
  --content-width: 72rem;
  --header-height: 4rem;
  --radius-card: 18px;
  --radius-pill: 999px;

  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}
```

- [ ] **Step 2: 建立 `src/styles/base.css`**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

[hidden] {
  display: none !important;
}

html {
  -webkit-text-size-adjust: 100%;
}

@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }
}

body {
  margin: 0;
  min-height: 100vh;
  background-color: var(--color-bg);
  background-image:
    linear-gradient(var(--color-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-grid) 1px, transparent 1px);
  background-size: 48px 48px;
  background-position: center top;
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: 1.7;
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  background:
    radial-gradient(60rem 40rem at 75% -10%, rgb(76 201 240 / 0.12), transparent 60%),
    radial-gradient(50rem 30rem at 5% 110%, rgb(61 220 132 / 0.08), transparent 60%);
}

h1,
h2,
h3,
p {
  margin: 0;
}

a {
  color: var(--color-ice);
  text-underline-offset: 0.2em;
}

a:hover {
  color: color-mix(in srgb, var(--color-ice) 70%, white);
}

:focus-visible {
  outline: 2px solid var(--color-ice);
  outline-offset: 3px;
  border-radius: 4px;
}

code {
  font-family: var(--font-mono);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.skip-link {
  position: absolute;
  top: 0.75rem;
  left: var(--gutter);
  z-index: 100;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-pill);
  background: var(--color-gold);
  color: var(--color-bg);
  font-weight: 700;
  transform: translateY(-200%);
  transition: transform var(--duration-fast) var(--ease-out-expo);
}

.skip-link:focus {
  transform: translateY(0);
}

.section {
  width: min(100% - 2 * var(--gutter), var(--content-width));
  margin-inline: auto;
  padding-top: var(--space-section);
  scroll-margin-top: var(--header-height);
}

.section__head {
  display: grid;
  gap: 0.75rem;
  max-width: 40rem;
  margin-bottom: clamp(2rem, 1.5rem + 2vw, 3rem);
}

.section__title {
  font-size: var(--text-section);
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: 0.02em;
}

.section__title::before {
  content: '// ';
  font-family: var(--font-mono);
  font-size: 0.6em;
  font-weight: 400;
  vertical-align: 0.25em;
  color: var(--color-pine);
}

.section__lead {
  color: var(--color-text-muted);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 3rem;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-pill);
  font-weight: 700;
  text-decoration: none;
  transition:
    transform var(--duration-fast) var(--ease-out-expo),
    background-color var(--duration-fast),
    color var(--duration-fast),
    box-shadow var(--duration-normal);
}

.btn:active {
  transform: translateY(1px);
}

.btn--primary {
  background: var(--color-berry);
  color: var(--color-bg);
}

.btn--primary:hover {
  background: color-mix(in srgb, var(--color-berry) 85%, white);
  color: var(--color-bg);
  box-shadow: 0 0 2rem rgb(255 90 95 / 0.45);
}

.btn--ghost {
  border: 1.5px solid var(--color-ice);
  color: var(--color-ice);
}

.btn--ghost:hover {
  background: var(--color-ice);
  color: var(--color-bg);
}

.chip-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.9rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  font-family: var(--font-mono);
  font-size: var(--text-small);
  text-decoration: none;
  transition: border-color var(--duration-fast);
}

.chip-link:hover {
  border-color: var(--color-ice);
}

.text-link {
  font-weight: 700;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 3: 建立 `src/styles/nav.css`**

```css
.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid var(--color-line);
  background: rgb(5 10 31 / 0.82);
  backdrop-filter: blur(10px);
}

.nav {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  width: min(100% - 2 * var(--gutter), var(--content-width));
  min-height: var(--header-height);
  margin-inline: auto;
}

.nav__brand {
  color: var(--color-text);
  font-weight: 900;
  text-decoration: none;
  white-space: nowrap;
}

.nav__brand:hover {
  color: var(--color-berry);
}

.nav__menu {
  display: flex;
  gap: 0.25rem;
  min-width: 0;
  margin: 0 0 0 auto;
  padding: 0;
  overflow-x: auto;
  list-style: none;
}

.nav__link {
  display: block;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-pill);
  color: var(--color-text-muted);
  font-size: 0.95rem;
  text-decoration: none;
  white-space: nowrap;
  transition:
    color var(--duration-fast),
    background-color var(--duration-fast);
}

.nav__link:hover {
  background: var(--color-surface-2);
  color: var(--color-text);
}

.nav__link--official {
  color: var(--color-ice);
}

.nav__toggle {
  margin-left: auto;
  padding: 0.45rem 1rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--color-text);
  font: inherit;
  cursor: pointer;
}

@media (max-width: 767.98px) {
  .has-js .nav__menu {
    position: absolute;
    top: 100%;
    right: calc(-1 * var(--gutter));
    left: calc(-1 * var(--gutter));
    display: none;
    flex-direction: column;
    margin: 0;
    padding: 0.75rem var(--gutter) 1rem;
    border-bottom: 1px solid var(--color-line);
    background: var(--color-bg);
  }

  .has-js.is-open .nav__menu {
    display: flex;
  }

  .has-js .nav__link {
    padding-block: 0.75rem;
  }
}

@media (min-width: 768px) {
  .nav__toggle {
    display: none;
  }
}
```

- [ ] **Step 4: 建立 `src/styles/hero.css`**

```css
.hero {
  display: grid;
  align-items: center;
  gap: 2rem;
  width: min(100% - 2 * var(--gutter), var(--content-width));
  margin-inline: auto;
  padding-top: clamp(2.5rem, 1rem + 6vw, 6rem);
  scroll-margin-top: var(--header-height);
}

@media (min-width: 768px) {
  .hero {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  }
}

.hero__org {
  color: var(--color-text-muted);
  font-size: var(--text-small);
  letter-spacing: 0.08em;
}

.hero__eyebrow {
  margin-top: 1.25rem;
  color: var(--color-pine);
  font-size: 0.95rem;
}

.hero__eyebrow code::after {
  content: '_';
  animation: blink 1.1s steps(1) infinite;
}

.hero__title {
  margin-top: 0.5rem;
  font-size: var(--text-hero);
  font-weight: 900;
  line-height: 1.05;
}

.hero__line {
  display: block;
}

.hero__line--accent {
  margin-top: 0.15em;
  color: var(--color-berry);
  font-size: 0.72em;
  font-weight: 700;
}

.hero__subtitle {
  margin-top: 1rem;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  letter-spacing: 0.1em;
}

.hero__countdown {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 2rem;
  padding: 0.6rem 1.1rem;
  border: 1px solid rgb(242 201 76 / 0.45);
  border-radius: var(--radius-pill);
  background: rgb(242 201 76 / 0.06);
  color: var(--color-gold);
  font-family: var(--font-mono);
  font-size: 0.95rem;
}

.hero__countdown::before {
  content: '';
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--color-gold);
  box-shadow: 0 0 0.75rem var(--color-gold);
  animation: twinkle 2.4s ease-in-out infinite;
}

.hero__tree {
  justify-self: center;
  width: min(100%, 26rem);
}

.tree {
  display: block;
  width: 100%;
  height: auto;
}

.tree__edges line {
  stroke: var(--color-line);
  stroke-width: 1.5;
}

.tree__flow {
  stroke: var(--color-pine);
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-dasharray: 2 70;
  animation: flow 3.2s linear infinite;
}

.tree__flow--t1 { animation-delay: -0.6s; }
.tree__flow--t2 { animation-delay: -1.3s; }
.tree__flow--t3 { animation-delay: -1.9s; }
.tree__flow--t4 { animation-delay: -2.6s; }

.tree__node {
  fill: var(--color-pine);
  opacity: 0.55;
  animation: twinkle 2.8s ease-in-out infinite;
}

.tree__node--t1 { animation-delay: 0.4s; }
.tree__node--t2 { animation-delay: 0.8s; }
.tree__node--t3 { animation-delay: 1.2s; }
.tree__node--t4 { animation-delay: 1.6s; }

.tree__star {
  fill: var(--color-gold);
  filter: drop-shadow(0 0 10px rgb(242 201 76 / 0.7));
  transform-box: fill-box;
  transform-origin: center;
  animation: star 4s ease-in-out infinite;
}

.tree__trunk {
  fill: var(--color-trunk);
}

.ornament {
  cursor: pointer;
  outline: none;
}

.ornament--ice { --ornament-color: var(--color-ice); }
.ornament--pine { --ornament-color: var(--color-pine); }
.ornament--berry { --ornament-color: var(--color-berry); }

.ornament__halo {
  fill: var(--ornament-color);
  opacity: 0.18;
  transform-box: fill-box;
  transform-origin: center;
  animation: halo 2.6s ease-in-out infinite;
}

.ornament__ball {
  fill: var(--ornament-color);
  stroke: var(--color-bg);
  stroke-width: 3;
  transform-box: fill-box;
  transform-origin: center;
  transition: transform var(--duration-normal) var(--ease-out-expo);
}

.ornament__label {
  opacity: 0;
  transform: translateY(4px);
  pointer-events: none;
  transition:
    opacity var(--duration-fast),
    transform var(--duration-normal) var(--ease-out-expo);
}

.ornament__label rect {
  fill: var(--color-surface-2);
  stroke: var(--ornament-color);
}

.ornament__label text {
  fill: var(--color-text);
  font-size: 13px;
  font-weight: 700;
}

.ornament:hover .ornament__ball,
.ornament:focus-visible .ornament__ball {
  transform: scale(1.25);
}

.ornament:hover .ornament__label,
.ornament:focus-visible .ornament__label {
  opacity: 1;
  transform: none;
}

.ornament:focus-visible .ornament__halo {
  opacity: 1;
  fill-opacity: 0.25;
  stroke: var(--color-ice);
  stroke-width: 2;
}

@keyframes flow {
  to { stroke-dashoffset: -72; }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 1; }
}

@keyframes halo {
  0%, 100% { transform: scale(1); opacity: 0.15; }
  50% { transform: scale(1.25); opacity: 0.3; }
}

@keyframes star {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.08) rotate(8deg); }
}

@keyframes blink {
  50% { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .tree__flow {
    display: none;
  }

  .tree__node,
  .tree__star,
  .ornament__halo,
  .hero__countdown::before,
  .hero__eyebrow code::after {
    animation: none;
  }
}
```

- [ ] **Step 5: 建立暫時的 `src/styles/index.css`（Task 15 補齊其餘檔案）**

```css
@import './tokens.css';
@import './base.css';
@import './nav.css';
@import './hero.css';
```

- [ ] **Step 6: 在 `src/main.ts` 第一行加入樣式**

```ts
import './styles/index.css';
```

- [ ] **Step 7: 確認可以建置**

Run: `npm run build`
Expected: 成功，`dist/assets/` 有一個 `.css` 檔。

- [ ] **Step 8: Commit**

```powershell
git add src/styles src/main.ts
git commit -m "style: 色彩變數、基礎樣式、導覽列與聖誕樹主視覺"
```

---

### Task 15: 樣式（二）：特色、成果、數字、結尾、飄雪

**Files:**
- Create: `src/styles/highlights.css`、`src/styles/gifts.css`、`src/styles/stats.css`、`src/styles/closing.css`、`src/styles/snow.css`
- Modify: `src/styles/index.css`（整檔換掉）

- [ ] **Step 1: 建立 `src/styles/highlights.css`**

```css
.highlights__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}

@media (min-width: 768px) {
  .highlights__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hl--ai {
    grid-column: 1 / -1;
  }
}

@media (min-width: 1024px) {
  .highlights__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-template-areas:
      'ai ai data data'
      'ai ai intern global'
      'project project career career';
  }

  .hl--ai { grid-area: ai; }
  .hl--data { grid-area: data; }
  .hl--intern { grid-area: intern; }
  .hl--global { grid-area: global; }
  .hl--project { grid-area: project; }
  .hl--career { grid-area: career; }
}

.hl {
  --hl-color: var(--color-ice);
  --hl-pad: clamp(1.25rem, 1rem + 1vw, 1.75rem);
  position: relative;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  background: linear-gradient(160deg, var(--color-surface-2), var(--color-surface));
  scroll-margin-top: calc(var(--header-height) + 2rem);
  transition:
    border-color var(--duration-normal),
    box-shadow var(--duration-normal),
    transform var(--duration-normal) var(--ease-out-expo);
}

.hl--pine { --hl-color: var(--color-pine); }
.hl--berry { --hl-color: var(--color-berry); }

.hl:hover,
.hl[open],
.hl.is-lit {
  border-color: var(--hl-color);
  box-shadow:
    0 0 0 1px var(--hl-color),
    0 0 2.5rem color-mix(in srgb, var(--hl-color) 25%, transparent);
}

.hl:hover {
  transform: translateY(-2px);
}

.hl__summary {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-areas:
    'icon index'
    'title title'
    'tagline tagline';
  gap: 0.5rem 1rem;
  padding: var(--hl-pad);
  border-radius: inherit;
  list-style: none;
  cursor: pointer;
}

.hl__summary::-webkit-details-marker {
  display: none;
}

.hl__summary::after {
  content: '+';
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  color: var(--hl-color);
  font-family: var(--font-mono);
  font-size: 1.25rem;
  transition: transform var(--duration-normal) var(--ease-out-expo);
}

.hl[open] .hl__summary::after {
  transform: rotate(45deg);
}

.hl__index {
  grid-area: index;
  align-self: center;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: var(--text-small);
}

.hl__icon {
  grid-area: icon;
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid color-mix(in srgb, var(--hl-color) 40%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--hl-color) 12%, transparent);
  color: var(--hl-color);
  transition:
    background-color var(--duration-normal),
    color var(--duration-normal);
}

.hl:hover .hl__icon,
.hl[open] .hl__icon,
.hl.is-lit .hl__icon {
  background: var(--hl-color);
  color: var(--color-bg);
}

.hl__title {
  grid-area: title;
  margin-top: 0.5rem;
  font-size: clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem);
  font-weight: 900;
}

.hl--ai .hl__title {
  font-size: clamp(1.5rem, 1.2rem + 1.4vw, 2.25rem);
}

.hl__tagline {
  grid-area: tagline;
  color: var(--color-text-muted);
}

.hl__body {
  padding: 0 var(--hl-pad) var(--hl-pad);
}

.hl__points {
  display: grid;
  gap: 0.6rem;
  margin: 0;
  padding: 1rem 0 0;
  border-top: 1px dashed var(--color-line);
  list-style: none;
}

.hl__points li {
  position: relative;
  padding-left: 1.25rem;
}

.hl__points li::before {
  content: '›';
  position: absolute;
  left: 0;
  color: var(--hl-color);
  font-family: var(--font-mono);
}

.hl__links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
  margin-top: 1rem;
}

.hl__link {
  color: var(--hl-color);
  font-weight: 700;
}
```

- [ ] **Step 2: 建立 `src/styles/gifts.css`**

```css
.gifts__video {
  margin: -1rem 0 2rem;
}

.gifts__list {
  margin: 0 0 0 0.75rem;
  padding: 0;
  border-left: 1px solid var(--color-line);
  list-style: none;
}

.gift {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-areas:
    'date tag'
    'title title';
  align-items: center;
  gap: 0.35rem 0.75rem;
  padding: 1rem 0 1rem 2rem;
  border-bottom: 1px dashed var(--color-line);
}

@media (min-width: 768px) {
  .gift {
    grid-template-columns: 7.5rem auto 1fr;
    grid-template-areas: 'date tag title';
  }
}

.gift__box {
  position: absolute;
  top: 1.1rem;
  left: -0.75rem;
  width: 1.5rem;
  height: 1.5rem;
  background: var(--color-bg);
  overflow: visible;
}

.gift__base {
  fill: var(--color-surface-2);
  stroke: var(--color-berry);
  stroke-width: 1.5;
}

.gift__lid {
  fill: var(--color-berry);
  transform-box: fill-box;
  transform-origin: 0% 100%;
  transition: transform var(--duration-normal) var(--ease-out-expo);
}

.gift__ribbon {
  stroke: var(--color-pine);
  stroke-width: 1.5;
}

.gift:hover .gift__lid,
.gift:focus-within .gift__lid {
  transform: translate(-1px, -4px) rotate(-18deg);
}

.gift__date {
  grid-area: date;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: var(--text-small);
}

.gift__tag {
  grid-area: tag;
  justify-self: start;
  padding: 0.1rem 0.6rem;
  border: 1px solid color-mix(in srgb, var(--color-pine) 45%, transparent);
  border-radius: var(--radius-pill);
  color: var(--color-pine);
  font-family: var(--font-mono);
  font-size: 0.8rem;
}

.gift__title {
  grid-area: title;
  color: var(--color-text);
  font-weight: 700;
  text-decoration: none;
}

.gift__title:hover {
  color: var(--color-ice);
  text-decoration: underline;
}

.gifts__more {
  margin-top: 1.5rem;
}
```

- [ ] **Step 3: 建立 `src/styles/stats.css`**

```css
.stats__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}

@media (min-width: 768px) {
  .stats__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .stats__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.stat {
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 0.5rem;
  margin: 0;
  padding: 1.75rem 1.25rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  text-align: center;
}

.stat__value {
  color: var(--color-pine);
  font-family: var(--font-mono);
  font-size: clamp(2.5rem, 2rem + 2vw, 3.25rem);
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  line-height: 1;
}

.stat__value--text {
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: 1.25rem;
  font-weight: 900;
}

.stat__label {
  color: var(--color-text-muted);
  font-size: var(--text-small);
}

.stat--ring {
  grid-template-areas:
    'ring'
    'label';
}

.stat--ring .ring,
.stat--ring .stat__value {
  grid-area: ring;
}

.stat--ring .stat__value {
  align-self: center;
  font-size: 2rem;
}

.stat--ring .stat__label {
  grid-area: label;
}

.ring {
  width: 8.5rem;
  height: 8.5rem;
  transform: rotate(-90deg);
}

.ring__track,
.ring__value {
  fill: none;
  stroke-width: 10;
}

.ring__track {
  stroke: var(--color-line);
}

.ring__value {
  stroke: var(--color-pine);
  stroke-linecap: round;
}

.venn {
  width: 9rem;
  height: auto;
}

.venn circle {
  fill-opacity: 0.12;
  stroke-width: 1.5;
}

.venn__a { fill: var(--color-ice); stroke: var(--color-ice); }
.venn__b { fill: var(--color-pine); stroke: var(--color-pine); }
.venn__c { fill: var(--color-berry); stroke: var(--color-berry); }

.venn text {
  fill: var(--color-text);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 700;
}
```

- [ ] **Step 4: 建立 `src/styles/closing.css`**

```css
.partners__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.partner {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-line);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 0.95rem;
  transition:
    color var(--duration-fast),
    border-color var(--duration-fast);
}

.partner:hover {
  border-color: var(--color-ice);
  color: var(--color-text);
}

.cta {
  display: grid;
  justify-items: center;
  gap: 1rem;
  padding-bottom: var(--space-section);
  text-align: center;
}

.cta__title {
  max-width: 20ch;
  font-size: clamp(1.75rem, 1rem + 3.5vw, 3.5rem);
  font-weight: 900;
  line-height: 1.25;
  text-wrap: balance;
}

.cta__lead {
  color: var(--color-text-muted);
}

.cta__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.site-footer {
  padding: 3rem var(--gutter) 2rem;
  border-top: 1px solid var(--color-line);
  background: rgb(5 10 31 / 0.85);
}

.footer__grid {
  display: grid;
  gap: 2rem;
  width: min(100%, var(--content-width));
  margin-inline: auto;
}

@media (min-width: 768px) {
  .footer__grid {
    grid-template-columns: 1fr 1fr;
  }
}

.footer__contact {
  display: grid;
  gap: 0.25rem;
  color: var(--color-text-muted);
  font-style: normal;
}

.footer__org {
  color: var(--color-text);
  font-weight: 700;
}

.footer__heading {
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.footer__link {
  color: var(--color-text-muted);
}

.footer__link:hover {
  color: var(--color-ice);
}

.footer__disclaimer,
.footer__top {
  width: min(100%, var(--content-width));
  margin: 2rem auto 0;
  color: var(--color-text-muted);
  font-size: var(--text-small);
}

.footer__top {
  margin-top: 0.75rem;
}
```

- [ ] **Step 5: 建立 `src/styles/snow.css`**

```css
.snow {
  position: fixed;
  inset: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.snow-toggle {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 20;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  background: rgb(11 20 48 / 0.9);
  color: var(--color-text);
  font: 500 0.9rem var(--font-mono);
  cursor: pointer;
  transition:
    border-color var(--duration-fast),
    color var(--duration-fast);
}

.snow-toggle::before {
  content: '\2744\FE0E';
  color: var(--color-ice);
}

.snow-toggle::after {
  content: '開';
}

.snow-toggle[aria-pressed='false'],
.snow-toggle[aria-pressed='false']::before {
  color: var(--color-text-muted);
}

.snow-toggle[aria-pressed='false']::after {
  content: '關';
}

.snow-toggle:hover {
  border-color: var(--color-ice);
}
```

- [ ] **Step 6: 把 `src/styles/index.css` 換成完整清單**

```css
@import './tokens.css';
@import './base.css';
@import './nav.css';
@import './hero.css';
@import './highlights.css';
@import './gifts.css';
@import './stats.css';
@import './closing.css';
@import './snow.css';
```

- [ ] **Step 7: 確認可以建置，且 CSS 在預算內**

Run: `npm run build`
Expected: 成功；Vite 輸出的 `.css` gzip 大小 < 15 kB、`.js` gzip 大小 < 80 kB。

- [ ] **Step 8: Commit**

```powershell
git add src/styles
git commit -m "style: 特色格、成果時間軸、數字儀表板、結尾與飄雪開關"
```

---

### Task 16: Vercel 設定、預覽伺服器套用同一組安全標頭、README

**Files:**
- Create: `vercel.json`、`README.md`
- Modify: `tsconfig.json`（加 `resolveJsonModule`）、`vite.config.ts`（整檔換掉）

- [ ] **Step 1: 建立 `vercel.json`**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'"
        },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

- [ ] **Step 2: 在 `tsconfig.json` 的 `compilerOptions` 加一行**

```json
    "resolveJsonModule": true,
```

- [ ] **Step 3: `vite.config.ts` 整檔換成下面內容（`vite preview` 套用和 Vercel 相同的標頭，E2E 就能抓到 CSP 違規）**

```ts
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import { site } from './src/data/site';
import { fillPlaceholders, renderPage } from './src/render/page';
import vercel from './vercel.json';

function renderSite(): Plugin {
  return {
    name: 'render-site',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => fillPlaceholders(html, renderPage(site)),
    },
  };
}

const securityHeaders = Object.fromEntries(
  (vercel.headers.find((rule) => rule.source === '/(.*)')?.headers ?? []).map((h) => [h.key, h.value]),
);

export default defineConfig({
  plugins: [renderSite()],
  preview: { headers: securityHeaders },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/main.ts'],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
```

- [ ] **Step 4: 建立 `README.md`**

````markdown
# 虎科資管 × Merry Christmas

國立虎尾科技大學資訊管理系的聖誕主題網站：資料聖誕樹、六大亮點特色、2026 成果禮物盒與數字儀表板。

> 本站為個人製作的聖誕主題非官方網站，內容整理自[虎科資管系網](https://im.nfu.edu.tw/)（2026/11/26），正式資訊以系網為準。

- 正式網址：https://nfu-im-xmas.vercel.app
- 技術：Vite + TypeScript（不用框架），內容在 build 時寫進 HTML

## 本機開發

```powershell
npm install
npm run dev
```

## 測試

```powershell
npm test              # 單元測試
npm run coverage      # 覆蓋率（門檻 80%）
npx playwright install chromium
npm run e2e           # 端對端測試，會自動 build 並啟動 preview
```

## 更新內容

所有文字和連結都在 `src/data/site.ts`，改完存檔即可，不需要動 HTML：

- `highlights`：六大特色（標題、標語、兩點重點、連結、燈色、吊飾位置）
- `gifts`：成果禮物盒（日期由新到舊）
- `stats`、`partners`、`cta`、`footer`：數字、合作夥伴、結尾邀請、頁尾

連結只接受 `https://`、`mailto:` 和 `#` 開頭，其他寫法在 build 時會直接報錯。

## 分享預覽圖

```powershell
npm run build
npm run og            # 輸出 public/og.png（1200×630）
```

## 部署

`main` 分支接在 Vercel（yan-wei-yus-projects）。push 到 `main` 就會自動部署正式網址，其他分支會產生預覽網址。安全標頭寫在 `vercel.json`，`vite preview` 也會套用同一組。
````

- [ ] **Step 5: 確認建置與測試仍然通過**

Run: `npm run build; npx vitest run`
Expected: 兩者都成功。

- [ ] **Step 6: Commit**

```powershell
git add vercel.json README.md tsconfig.json vite.config.ts
git commit -m "chore: Vercel 安全標頭、preview 套用相同標頭與 README"
```

---

### Task 17: 端對端測試

**Files:**
- Create: `playwright.config.ts`、`e2e/site.spec.ts`、`e2e/review.spec.ts`

- [ ] **Step 1: 安裝 Chromium**

Run: `npx playwright install chromium`
Expected: 下載完成。

- [ ] **Step 2: 建立 `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
```

- [ ] **Step 3: 建立 `e2e/site.spec.ts`**

```ts
import { expect, test, type Page } from '@playwright/test';

const WIDTHS = [320, 375, 768, 1024, 1440];

/** 測試不依賴外部網路：Google Fonts 一律回空的 CSS */
async function stubFonts(page: Page): Promise<void> {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) =>
    route.fulfill({ status: 200, contentType: 'text/css', body: '' }),
  );
}

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('requestfailed', (req) => errors.push(`request failed: ${req.url()}`));
  return errors;
}

test.beforeEach(async ({ page }) => {
  await stubFonts(page);
});

test('loads without errors and shows every section', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  for (const selector of ['#top', '#highlights', '#gifts', '#stats', '.partners', '.cta', '#contact']) {
    await expect(page.locator(selector)).toBeVisible();
  }
  await expect(page.locator('[data-countdown]')).toContainText(/聖誕|Christmas/);
  expect(errors).toEqual([]);
});

test('nav links scroll to their sections', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.locator('#nav-menu').getByRole('link', { name: '數字', exact: true }).click();
  await expect(page).toHaveURL(/#stats$/);
  await expect(page.locator('#stats')).toBeInViewport();
});

test('clicking an ornament opens its highlight card', async ({ page }) => {
  await page.goto('/');
  await page.locator('a.ornament[href="#hl-ai"]').click();
  await expect(page.locator('#hl-ai')).toHaveAttribute('open', '');
  await expect(page.locator('#hl-ai')).toBeInViewport();
});

test('keyboard users can open a card from the tree', async ({ page }) => {
  await page.goto('/');
  await page.locator('a.ornament[href="#hl-global"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#hl-global')).toHaveAttribute('open', '');
});

test('snow toggle turns off and is remembered', async ({ page }) => {
  await page.goto('/');
  const toggle = page.locator('.snow-toggle');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('canvas.snow')).toBeHidden();
  await page.reload();
  await expect(page.locator('.snow-toggle')).toHaveAttribute('aria-pressed', 'false');
});

test('mobile menu opens and closes', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/');
  const menu = page.locator('#nav-menu');
  await expect(menu).toBeHidden();
  await page.locator('.nav__toggle').click();
  await expect(menu).toBeVisible();
  await menu.getByRole('link', { name: '成果', exact: true }).click();
  await expect(menu).toBeHidden();
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('keeps snow off and shows final numbers', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.snow-toggle')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('canvas.snow')).toBeHidden();
    await expect(page.locator('[data-countup]')).toHaveText(['95%', '50+', '100+']);
  });
});

for (const width of WIDTHS) {
  test(`no horizontal scroll at ${width}px with every card open`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    await page.evaluate(() => {
      document.querySelectorAll('details').forEach((d) => {
        d.open = true;
      });
    });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}
```

- [ ] **Step 4: 建立 `e2e/review.spec.ts`（產生給使用者確認版面的截圖）**

```ts
import { expect, test } from '@playwright/test';

const SHOTS = [
  { name: 'mobile', width: 375 },
  { name: 'desktop', width: 1440 },
] as const;

for (const shot of SHOTS) {
  test(`review screenshot: ${shot.name}`, async ({ page }) => {
    await page.setViewportSize({ width: shot.width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#stats').scrollIntoViewIfNeeded();
    await expect(page.locator('[data-countup]').first()).toHaveText('95%');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `test-results/review-${shot.name}.png`, fullPage: true });
  });
}
```

- [ ] **Step 5: 執行端對端測試**

Run: `npm run e2e`
Expected: 全部通過（site.spec.ts 12 tests、review.spec.ts 2 tests），`test-results/` 底下有 `review-mobile.png`、`review-desktop.png`。

- [ ] **Step 6: Commit**

```powershell
git add playwright.config.ts e2e
git commit -m "test: Playwright 端對端測試與版面確認截圖"
```

---

### Task 18: 分享預覽圖

**Files:**
- Create: `scripts/make-og.mjs`、`public/og.png`（由腳本產生）

- [ ] **Step 1: 建立 `scripts/make-og.mjs`**

```js
import { chromium } from '@playwright/test';
import { preview } from 'vite';

const OUT = 'public/og.png';
const PORT = 4174;

const server = await preview({ preview: { port: PORT, strictPort: true } });
try {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1200, height: 630 },
      reducedMotion: 'reduce',
      bypassCSP: true,
    });
    await page.goto(`http://localhost:${PORT}/`);
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: '.snow-toggle, .skip-link { display: none !important; }' });
    await page.screenshot({ path: OUT });
    console.log(`Saved ${OUT}`);
  } finally {
    await browser.close();
  }
} finally {
  await server.close();
}
```

- [ ] **Step 2: 產生圖片**

Run: `npm run build; npm run og`
Expected: 輸出 `Saved public/og.png`，圖片是 1200×630 的主視覺（標題＋聖誕樹）。

- [ ] **Step 3: 看一下圖片，確認標題和聖誕樹都在畫面內**

用 Read 工具打開 `public/og.png` 檢查。

- [ ] **Step 4: Commit**

```powershell
git add scripts/make-og.mjs public/og.png
git commit -m "feat: 1200x630 分享預覽圖"
```

---

### Task 19: 整體驗證、程式審查與版面確認

**Files:**
- 依審查結果修改（若有）

- [ ] **Step 1: 單元測試與覆蓋率**

Run: `npm run coverage`
Expected: 全部通過；lines、functions、branches、statements 皆 ≥ 80%（未達門檻 Vitest 會直接失敗）。

- [ ] **Step 2: 端對端測試**

Run: `npm run e2e`
Expected: 14 tests 全部通過。

- [ ] **Step 3: 檢查所有外部連結都連得到**

```powershell
$html = Get-Content dist/index.html -Raw -Encoding UTF8
$urls = [regex]::Matches($html, 'href="(https://[^"]+)"') | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique
foreach ($u in $urls) {
  try { $code = (Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 20 -MaximumRedirection 5).StatusCode } catch { $code = $_.Exception.Message }
  "$code  $u"
}
```

Expected: 每一行都是 `200`。不是 200 的連結，回官網找正確網址後改 `src/data/site.ts`。

- [ ] **Step 4: 效能與無障礙量測（行動版）**

另開終端機執行 `npm run preview -- --port 4173`，再執行：

Run: `npx lighthouse http://localhost:4173 --only-categories=performance,accessibility --form-factor=mobile --output=json --output-path=test-results/lighthouse.json --quiet --chrome-flags="--headless=new"`

讀取結果：

```powershell
$r = Get-Content test-results/lighthouse.json -Raw -Encoding UTF8 | ConvertFrom-Json
"LCP: $($r.audits.'largest-contentful-paint'.displayValue)"
"CLS: $($r.audits.'cumulative-layout-shift'.displayValue)"
"Performance: $($r.categories.performance.score)  Accessibility: $($r.categories.accessibility.score)"
```

Expected: LCP < 2.5 s、CLS < 0.1、Accessibility ≥ 0.95。未達標就修正後重跑 Step 1–4。

- [ ] **Step 5: 程式審查**

用 code-reviewer agent 審查 `src/`、`tests/`、`e2e/`、`vite.config.ts`、`vercel.json`。修掉所有 CRITICAL 與 HIGH，能修的 MEDIUM 一併修，修完重跑 Step 1–2。

- [ ] **Step 6: 給使用者確認版面**

把 `test-results/review-desktop.png`、`test-results/review-mobile.png` 傳給使用者，並開本機預覽讓他實際操作。等使用者說「版面 OK」才進入 Task 20；有修改就改完、重跑 Step 1–2、重新截圖再確認。

- [ ] **Step 7: Commit（若 Step 3–6 有修改）**

```powershell
git add -A
git commit -m "fix: 依驗證與審查結果修正"
```

---

### Task 20: 部署到 Vercel

**前提：** 使用者已在 Task 19 說「版面 OK」。

- [ ] **Step 1: 使用者登入 Vercel CLI**

請使用者在終端機執行 `npx vercel@67 login`，在瀏覽器完成登入（Claude 不代為輸入任何帳密）。之後確認：

Run: `npx vercel@67 whoami`
Expected: 印出使用者的 Vercel 帳號名稱。

- [ ] **Step 2: 建立 GitHub 公開 repo 並推上去**

Run: `gh repo create Yan-wei-yu/nfu-im-xmas --public --source . --remote origin --push --description "虎科資管聖誕版網站（個人製作、非官方）"`
Expected: repo 建立完成，`main` 已推上 GitHub。

- [ ] **Step 3: 建立並連結 Vercel 專案**

Run: `npx vercel@67 link --yes --scope yan-wei-yus-projects --project nfu-im-xmas`
Expected: 產生 `.vercel/project.json`（已在 `.gitignore`）。

- [ ] **Step 4: 接上 GitHub，之後 push 就自動部署**

Run: `npx vercel@67 git connect --yes`
Expected: 顯示已連到 `Yan-wei-yu/nfu-im-xmas`。

- [ ] **Step 5: 第一次正式部署**

Run: `npx vercel@67 deploy --prod --yes`
Expected: 印出正式網址。

- [ ] **Step 6: 確認正式網址名稱**

Run: `npx vercel@67 project ls --scope yan-wei-yus-projects`
Expected: `nfu-im-xmas` 的正式網址為 `https://nfu-im-xmas.vercel.app`。若不同（名稱被用走），把 `src/data/site.ts` 的 `SITE_URL` 與 `README.md` 的正式網址改成實際網址，重跑 `npx vitest run`，然後：

```powershell
git add src/data/site.ts README.md
git commit -m "fix: 改用實際的 Vercel 正式網址"
git push
```

- [ ] **Step 7: 驗證正式站**

```powershell
$r = Invoke-WebRequest -Uri https://nfu-im-xmas.vercel.app/ -UseBasicParsing
"status: $($r.StatusCode)"
"csp: $($r.Headers['Content-Security-Policy'])"
(Invoke-WebRequest -Uri https://nfu-im-xmas.vercel.app/og.png -Method Head -UseBasicParsing).StatusCode
```

Expected: 200、CSP 標頭存在、`og.png` 回 200（網址以 Step 6 確認的為準）。再用瀏覽器打開正式網址，確認飄雪、吊飾、倒數都正常，截圖給使用者。


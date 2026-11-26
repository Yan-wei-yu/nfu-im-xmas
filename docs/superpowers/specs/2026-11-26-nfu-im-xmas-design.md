# 虎科資管聖誕版網站（nfu-im-xmas）設計規格

- 日期：2026-11-26
- 狀態：設計三段皆已確認，待實作計畫
- 內容來源：虎科資管系官網首頁 https://im.nfu.edu.tw/ 及其特色子頁，2026-11-26 擷取

## 1. 目標與範圍

把虎科資管系官網首頁重做成聖誕節主題的單頁網站，以個人作品的名義部署在 Vercel。

**成功標準**

1. 正式網址可公開瀏覽，預計為 `nfu-im-xmas.vercel.app`；若名稱已被使用，改用 `nfu-im-xmas-2026`。
2. 第 2 節列出的八個區塊內容與官網一致，每則項目都連回官網原頁。
3. 寬度 320px 到 1440px 都沒有橫向捲動，版面經使用者確認「版面 OK」。
4. 效能：行動版 LCP < 2.5 秒、CLS < 0.1；JS ≤ 80 KB gzip、CSS ≤ 15 KB gzip。
5. 單元測試覆蓋率 ≥ 80%，端對端測試全數通過。

**不做**：多頁面、即時抓取官網消息、後台、英文版、背景音樂、流量分析。

**發布名義**：個人作品、非官方網站。系名只用文字呈現，不放系上 Logo 圖檔，也不放合作夥伴的 Logo。

## 2. 頁面結構與內容

單頁網站，由上到下共八個區塊。所有文字內容集中在 `src/data/site.ts`。官網相對路徑一律轉成以 `https://im.nfu.edu.tw` 開頭的絕對網址。

### 2.1 導覽列

- 左邊字標「虎科資管 × Xmas」，點了回到頁首。
- 選單是頁內錨點：特色（`#highlights`）、成果（`#gifts`）、數字（`#stats`）、聯絡（`#contact`），另加一顆「官方系網 ↗」連到 https://im.nfu.edu.tw/ 。
- 寬度 < 768px：有 JS 時收成漢堡選單（按鈕帶 `aria-expanded`）；沒有 JS 時，選單排成一列可橫向滑動。

### 2.2 主視覺

- 左邊：大標「虎科資管」，下一行「Merry Christmas」；副標「AI × 數據 × 商管」；再下面是聖誕倒數（規則見 3.6）。
- 右邊：資料節點聖誕樹（見 3.3），樹上六顆吊飾對應六大特色。
- 寬度 < 768px 時，聖誕樹移到標題下方。

### 2.3 六大亮點特色（`#highlights`）

每張卡片平常顯示名稱和一句標語；展開後多顯示兩點重點和「到官網看更多 ↗」。卡片用 `<details>`／`<summary>`，沒有 JS 也能展開。

| id | 名稱 | 標語 | 展開重點 | 看更多連結 |
| --- | --- | --- | --- | --- |
| `ai` | AI 智慧應用 | 學習 AI 技術與應用，開創智慧未來 | ①從智慧醫療、金融科技到生成式 AI，培養資料分析、機器學習與系統整合能力 ②透過實作專題、產學合作與真實案例，學會用 AI 解決產業問題 | `/zh_tw/about/ai` |
| `data` | 大數據分析 | 數據驅動決策，解鎖商業價值 | ①結合 AI、資料分析、雲端與系統整合，把產業痛點變成可執行的方案 ②實際專案：雲林縣政府住商 e 化用電健診、大林慈濟醫院自動化排班、台化靜電集塵設備參數優化 | `/zh_tw/about/bigdata` |
| `intern` | 企業實習 | 與企業接軌，累積實戰經驗 | ①日四技、技優專班、夜四技與碩士班都有學生到企業實習，分暑期與學期制 ②實習單位橫跨科技、製造、醫療與農業生技，例如友達光電、上銀科技、欣銓科技 | `/zh_tw/Industry＿Academic/off_campus` |
| `global` | 海外交流 | 拓展國際視野，豐富學習經驗 | ①交換與研習足跡遍及美國、日本、德國、泰國、加拿大 ②合作學校包括美國德州大學聖安東尼奧校區（UTSA）、日本近畿大學、群馬大學、泰國北曼谷國王科技大學 | `/zh_tw/Industry＿Academic/Overseas` |
| `project` | 專題競賽 | 挑戰創新競賽，展現實力 | ①大三開始做專題、參加校外競賽，累積 100+ 件專題與競賽成果 ②近年題目：即時 AI 全端網頁生成、AI 機車震動故障診斷、食品影像辨識系統 | 專題影片：官網首頁連結的 YouTube 頻道播放清單；專題列表：`/zh_tw/s_info/u_project` |
| `career` | 就業升學 | 多元出路選擇，成就職涯夢想 | ①四年藍圖：大一打基礎、大二練專業、大三做專題與考證照、大四實習或海外交換 ②出路：AI 工程師、資料分析師、軟體工程師、ERP 顧問，也可以升碩士班或走 4+1 預研生 | `/zh_tw/about/further` |

網址中的「＿」是全形底線，存進資料檔時寫成 `%EF%BC%BF`。

### 2.4 2026 成果禮物盒（`#gifts`）

依日期由新到舊排列，共六則，每則都連到官網原文：

| 日期 | 分類 | 標題 |
| --- | --- | --- |
| 2026-06-18 | 亮眼成果 | 胡念祖老師帶領學生產學技術交流 |
| 2026-06-18 | 亮眼成果 | 資安升級：AI助力守護數位邊界 |
| 2026-06-18 | 亮眼成果 | 學生時期，就具備改變社會的千萬級影響力 |
| 2026-06-18 | 亮眼成果 | 產業對接：畢業即戰力，提早佈署職涯藍圖 |
| 2026-06-18 | 學長姐故事 | 本系碩士班同學申請美國德州大學聖安東尼奧分校（UTSA）碩士班雙聯學制成功通過 |
| 2026-06-17 | 學長姐故事 | 本系同學參加臺灣證券交易所「臺灣創新板 LOGO 設計徵選比賽」榮獲個人組第一名金獎 |

- 最後一則的官網標題含學生全名，本站省略姓名，點進官網原文仍看得到。
- 區塊標題旁放「60 秒認識虎科資管 ↗」，連到官網的「資訊管理系簡介」影片頁。
- 區塊底部放「更多最新消息 ↗」，連到 `/zh_tw/news`。

### 2.5 數字見證實力（`#stats`）

| 數字 | 說明 | 呈現 |
| --- | --- | --- |
| 95% | 畢業生升學／就業率 | 環形圖 |
| 50+ | 企業合作實習機會 | 跳動數字 |
| 100+ | 專題競賽成果 | 跳動數字 |
| AI × 數據 × 商管 | 跨域整合能力 | 三個交集的圓 |

### 2.6 產學合作夥伴

只放文字標籤：IBM、SAP、Microsoft、Oracle、雲林縣政府、資策會、工研院、品印三維。

### 2.7 結尾邀請

- 大字：「下一個改變未來的人，也許就是你」
- 小字：「加入虎科資管，開啟你的無限可能！」
- 主按鈕「了解課程」連到 `/zh_tw/course`；次按鈕「加入虎科資管 LINE」連到 https://line.me/R/ti/p/@218jnlb 。

### 2.8 頁尾（`#contact`）

- 國立虎尾科技大學 資訊管理系
- 632 雲林縣虎尾鎮文化路 64 號
- 電話 05-6315731、傳真 05-6364127、Email imoffice@nfu.edu.tw（`mailto:` 連結）
- 系網快速連結：最新消息、系所簡介、師資簡介、課程特色、招生資訊、學生園區、產學研究（分別連到 `/zh_tw/news`、`/zh_tw/about`、`/zh_tw/faculty`、`/zh_tw/course`、`/zh_tw/admission`、`/zh_tw/s_info`、`/zh_tw/Industry＿Academic`）
- 聲明：「本站為個人製作的聖誕主題非官方網站，內容整理自虎科資管系網（2026/11/26），正式資訊以系網為準。」

所有連到外部網站的連結都加上 `target="_blank" rel="noopener noreferrer"`，頁內錨點則不加。

## 3. 視覺與互動

### 3.1 色彩（`src/styles/tokens.css`）

| 變數 | 色碼 | 用途 |
| --- | --- | --- |
| `--color-bg` | `#050A1F` | 頁面底色，接近官網的 `#000421` |
| `--color-surface` | `#0B1430` | 卡片、儀表底色 |
| `--color-grid` | `#12204A` | 背景座標格線 |
| `--color-text` | `#E8EEF9` | 主要文字 |
| `--color-text-muted` | `#9AA8C7` | 次要文字（對比約 8:1） |
| `--color-pine` | `#3DDC84` | 聖誕樹、正向數字 |
| `--color-berry` | `#FF5A5F` | 重點、主要按鈕；按鈕上的文字用 `--color-bg`，不用白字 |
| `--color-ice` | `#4CC9F0` | 連結、鍵盤焦點框 |
| `--color-gold` | `#F2C94C` | 只用在樹頂星星與倒數 |

六大特色的燈色依序是：AI 冰藍、大數據 松綠、企業實習 聖誕紅、海外交流 冰藍、專題競賽 聖誕紅、就業升學 松綠。吊飾和卡片的亮燈邊框共用同一個顏色。

### 3.2 字體與尺寸

- 中文：Noto Sans TC，字重 400／700／900。
- 等寬：JetBrains Mono，字重 400／500，用在數字、日期、分類標籤、`merry_xmas()` 之類的點綴。
- 都從 Google Fonts 載入，加 `display=swap`。備援字體：`"PingFang TC", "Microsoft JhengHei", system-ui, sans-serif`；等寬備援：`ui-monospace, Consolas, monospace`。
- 主標 `clamp(2.5rem, 1.2rem + 5vw, 5rem)`；區塊標題 `clamp(1.75rem, 1.2rem + 2vw, 2.5rem)`；內文 `clamp(1rem, 0.95rem + 0.25vw, 1.125rem)`；區塊上下間距 `clamp(4rem, 3rem + 5vw, 8rem)`。
- 斷點：手機 < 768px、平板 768–1023px、桌機 ≥ 1024px。

### 3.3 主視覺聖誕樹

- 由 `src/tree/layout.ts` 純函式算出座標，build 時直接產生 SVG 寫進 HTML。
- 21 個節點分 6 層（第 1 層 1 個、第 6 層 6 個），每個節點連到下一層相鄰的兩個節點。樹頂上方是金色星星，最下方是樹幹。
- 六顆吊飾的位置（層數從 1 起算，節點從該層最左邊 0 起算）：
  - AI 智慧應用：第 2 層第 0 個
  - 大數據分析：第 3 層第 2 個
  - 企業實習：第 4 層第 1 個
  - 海外交流：第 5 層第 3 個
  - 專題競賽：第 6 層第 0 個
  - 就業升學：第 6 層第 5 個
- 每顆吊飾是 SVG `<a href="#hl-<id>">`，帶 `aria-label`（例如「AI 智慧應用」）。沒有 JS 時點了會跳到對應卡片。
- 有 JS 時：滑過或鍵盤選到吊飾會顯示名稱；點下去平滑捲到對應卡片，並把它的 `<details>` 打開。
- 動態：
  - 連線上用 `stroke-dashoffset` 做出小光點往上流動的效果。
  - 節點錯開時間閃爍。
  - 動畫只用 `transform`、`opacity`、`stroke-dashoffset`。

### 3.4 資料雪（`src/snow/`）

- 全頁固定的 `<canvas>`，放在內容後面，`pointer-events: none`。
- 雪花數量 = `clamp(round(視窗面積 / 12000), 40, 160)`，視窗面積以 CSS px 計算。其中約 25% 是等寬字的「0」或「1」（10–14px，透明度 0.35–0.7），其餘是半徑 1–2.5px 的圓點。
- 每片雪依經過的時間往下落並左右輕晃，落出畫面底部就從頂端重新出現。裝置像素比最多算到 2。
- 分頁切到背景時暫停（`visibilitychange`）。
- 右下角飄雪開關：按鈕帶 `aria-pressed`，偏好存在 localStorage 的 `xmas-snow`，讀寫都包在 try/catch 裡；讀不到就用預設值。
- 預設開啟；系統設定「減少動態」時預設關閉。瀏覽器不支援 canvas 就不顯示開關。

### 3.5 各區塊樣式

- **六大特色**：桌機用 4 欄格子，共 3 列：
  - 第 1、2 列：AI 佔左邊 2 欄 × 2 列；大數據佔第 1 列右邊 2 欄；企業實習、海外交流各佔第 2 列右邊 1 欄。
  - 第 3 列：專題競賽、就業升學各佔 2 欄。
  - 平板改 2 欄（AI 佔滿一整列），手機單欄。
  - 滑過或展開時，邊框和圖示以該卡的燈色亮起。
- **成果禮物盒**：排成 commit log 式的時間軸，每列依序是日期（等寬字）、分類標籤、標題連結；滑過時左邊的小禮物盒蓋子會掀開。
- **數字儀表板**：桌機 4 格一列、平板 2×2、手機單欄。卡片捲動到 40% 可見時，95% 的環形圖和 50+／100+ 的數字從 0 跳到終值，歷時 1.2 秒、ease-out。
- **合作夥伴**：等寬字、細框的標籤，可換行，不做跑馬燈。
- **結尾邀請**：主按鈕是聖誕紅底、深藍字；次按鈕是冰藍外框。
- **焦點與狀態**：所有可互動元素都有 `:focus-visible` 樣式（2px 冰藍框，外推 3px）。按鈕滑過時變亮，按下時往下移 1px。轉場時間 150–300ms。

### 3.6 聖誕倒數（`src/countdown.ts`）

一律以台灣時間（Asia/Taipei）的日期判斷：

| 台灣日期 | 顯示 |
| --- | --- |
| 12/25 以前（含 1 月到 12/24） | 「距離聖誕節還有 N 天」，N 是到當年 12/25 的天數 |
| 12/25 | 「Merry Christmas！今天就是聖誕節」 |
| 12/26–12/31 | 「Merry Christmas & Happy New Year」 |

HTML 裡先放「12/25 聖誕快樂」當作沒有 JS 時的文字，JS 執行後再換成上表的內容。

### 3.7 減少動態與無障礙

- 系統設定「減少動態」時：飄雪預設關閉，資料流動、節點閃爍、數字跳動全部停用，數字直接顯示終值。
- 文字對比符合 WCAG AA；吊飾、卡片、按鈕、開關都能用鍵盤操作。
- 頁面最前面有「跳到主要內容」連結。純裝飾的 SVG 加 `aria-hidden="true"`。

## 4. 技術架構

### 4.1 技術與檔案

Vite（最新穩定版）＋ TypeScript（strict），不用 UI 框架。

```
nfu-im-xmas/
├── index.html              骨架與各區塊的插入點
├── vite.config.ts          build 時把資料渲染進 HTML 的外掛
├── vercel.json             安全標頭
├── public/                 favicon.svg、og.png
├── scripts/make-og.mjs     產生分享預覽圖
├── src/
│   ├── main.ts             進入點，逐一啟動各互動模組
│   ├── data/site.ts        全部內容與型別
│   ├── render/             資料 → HTML 字串的純函式（escape、連結、各區塊）
│   ├── tree/layout.ts      聖誕樹座標（純函式）
│   ├── tree/tree.ts        吊飾互動：捲動、展開卡片
│   ├── snow/               雪花數量與移動計算（純函式）＋ canvas 繪製
│   ├── countdown.ts        倒數判斷（純函式）＋ 寫入畫面
│   ├── countup.ts          數字跳動（IntersectionObserver）
│   ├── nav.ts              手機選單
│   ├── prefs.ts            localStorage 偏好讀寫與減少動態判斷
│   └── styles/             tokens.css、base.css、各區塊 css
├── tests/                  Vitest 單元測試
└── e2e/                    Playwright 端對端測試
```

### 4.2 資料流

1. `src/data/site.ts` 匯出有型別的內容物件。
2. build 時，`vite.config.ts` 的 `transformIndexHtml` 外掛呼叫 `src/render/*` 和 `src/tree/layout.ts`，把 index.html 裡的 `<!-- @render:區塊名 -->` 換成完成的 HTML。dev server 也走同一套流程。
3. 瀏覽器載入時內容已經在 HTML 裡。`main.ts` 只負責加上互動：聖誕樹、飄雪、倒數、數字跳動、手機選單。

### 4.3 錯誤處理

- `main.ts` 用 `safeInit(名稱, 函式)` 逐一啟動模組。某個模組失敗時用 `console.error` 記下錯誤，不影響其他模組。
- 沒有 JS、JS 載入失敗或瀏覽器太舊：內容照樣完整可讀，卡片仍可展開，吊飾仍可跳到卡片。
- localStorage 被封鎖：用預設值，不跳錯誤。
- 不支援 canvas 或 IntersectionObserver：分別略過飄雪、直接顯示數字終值。
- 渲染函式對所有文字做 HTML escape；網址只接受 `https:`、`mailto:` 或 `#` 開頭，其他一律在 build 時報錯。

### 4.4 安全標頭（`vercel.json`）

套用到所有路徑：

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

因為 CSP 不允許 inline style，HTML 裡不寫 `style` 屬性；需要動態設定的樣式都在 JS 裡用 `element.style.setProperty`。

### 4.5 分享預覽圖

`scripts/make-og.mjs` 用 Playwright 以 1200×630 的視窗截取 build 後首頁的主視覺（標題＋聖誕樹），輸出成 `public/og.png` 並 commit。直接截首頁，預覽圖就會跟網站長得一樣。`index.html` 的 `og:image` 寫正式網址的絕對路徑，同時設好 `og:title`、`og:description`。

## 5. 測試

### 5.1 單元測試（Vitest，覆蓋率 ≥ 80%）

- **資料**：六大特色剛好 6 則、id 不重複、每個欄位都不為空；所有網址都是 `https:`／`mailto:`；成果日期格式為 YYYY-MM-DD 且由新到舊；合作夥伴 8 個。
- **渲染**：`< > & " '` 都會被跳脫；外部連結帶 `target="_blank" rel="noopener noreferrer"`；不合法的網址會丟出錯誤；每個區塊都輸出全部項目。
- **聖誕樹座標**：21 個節點、6 層；每條連線兩端都是存在的節點；所有座標都在 viewBox 內；6 顆吊飾落在 3.3 指定的節點上；相同輸入得到相同輸出。
- **倒數**：
  - 2026-11-26 → 29 天
  - 台灣時間 12/24 23:59:59 → 1 天
  - 台灣時間 12/25 00:00 → 聖誕節當天
  - 台灣時間 12/25 23:59 → 聖誕節當天
  - 台灣時間 12/26 → 新年祝福
  - UTC 12/24 16:00（台灣已是 12/25）→ 聖誕節當天
  - 1/10 → 到當年 12/25 的天數
- **雪**：不同視窗大小的雪花數量都落在 40–160；位置更新會往下移，落出底部後回到頂端；字元雪比例接近 25%（容許 ±5%）。
- **數字跳動**：ease-out 的起點與終點值正確；「95%」「50+」「100+」格式正確。
- **偏好讀寫**：可正常讀寫；localStorage 丟出錯誤時回傳預設值、不往外拋錯。

### 5.2 端對端測試（Playwright，Chromium）

- 頁面載入後沒有 console error，也沒有失敗的請求。
- 八個區塊都看得到；導覽錨點會捲到對應區塊。
- 點「AI 智慧應用」吊飾 → `#hl-ai` 的 details 打開，且出現在畫面中。
- 用鍵盤 Tab 到吊飾、按 Enter，結果同上。
- 飄雪開關：`aria-pressed` 會切換、canvas 隱藏；重新整理後維持設定。
- 模擬「減少動態」：飄雪預設關閉，數字直接是終值。
- 寬度 320、375、768、1024、1440 都沒有橫向捲動。
- 輸出 375 與 1440 寬的整頁截圖，給使用者確認版面。

### 5.3 建置檢查

`npm run build` 成功，且 `dist/index.html` 裡含有六大特色和六則成果的標題，確認內容是在 build 時寫入的。

## 6. 部署

1. 本機 git repo，預設分支 `main`。
2. GitHub 公開 repo `Yan-wei-yu/nfu-im-xmas`。
3. Vercel 專案 `nfu-im-xmas`，放在 `yan-wei-yus-projects` 底下：Framework 選 Vite，Build Command `npm run build`，Output `dist`。
4. 用 Vercel CLI 把專案連到 GitHub repo，之後 push 到 `main` 就自動部署正式網址，其他分支會產生預覽網址。
5. 第一次連接時由使用者在瀏覽器登入 Vercel CLI，其餘步驟由 Claude 執行。

## 7. 交付流程

1. 本機完成後，給使用者看桌機與手機截圖，等使用者說「版面 OK」。
2. 推上 GitHub，接上 Vercel，部署正式網址，再給使用者確認。
3. README 寫清楚：本機開發、執行測試、如何更新內容（只改 `src/data/site.ts`）、部署方式。

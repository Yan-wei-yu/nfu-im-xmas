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

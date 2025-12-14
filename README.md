# 🌐 個人網站

這是一個用來留下個人創作痕跡的網站，內容會隨著時間慢慢變化，沒有明確終點，只是持續整理與累積。
它被放在網路的一個角落，安靜地存在，作為對外展示，也作為自己的備忘。
網站中包含一些背景說明、專案片段與尚未完成的想法，介於作品集與筆記之間，適合被瀏覽，也適合被日後重新翻看。

👉 **[網站連結](https://lscoupling.github.io/)**

## 🛠 技術架構

- **React** — 負責整體 UI 組件化與頁面邏輯
- **Vite** — 提供快速的開發體驗與高效的建置流程
- **React Router** — 頁面路由與導航管理
- **GitHub Pages** — 作為靜態網站部署與對外公開平台

### 🌙 深色模式

支援亮色 / 深色主題切換，採用 **CSS 變數系統**：
- 點擊右上角月亮按鈕 🌙 即可切換
- 深色模式使用優化的配色方案，提升夜間閱讀舒適度
- 所有頁面與工具元件皆完整支持主題切換

## 📁 專案結構

```
├── public/
│   └── 2634_20251126.json          # 股票範例資料
├── src/
│   ├── assets/                      # 圖片與靜態資源
│   ├── pages/
│   │   ├── Resume.jsx               # 個人履歷與介紹頁面
│   │   └── Tools.jsx                # 小工具導航頁面
│   ├── tools/
│   │   ├── PdfMerge.jsx             # PDF 合併工具
│   │   ├── StockChart.jsx           # 股票走勢動畫工具
│   │   └── XmlTool.jsx              # XML → HTML 表格轉換工具
│   ├── App.jsx                      # 應用主結構與路由設定
│   ├── main.jsx                     # React 入口檔案
│   └── styles.css                   # 全站樣式與主題變數
├── index.html                       # HTML 入口
├── vite.config.js                   # Vite 設定
├── package.json                     # 專案依賴與 scripts
└── README.md                        # 本檔案
```

## ⚙️ 本地開發與部署

### 系統要求
- **Node.js** ≥ 16.x
- **npm** ≥ 8.x

### 安裝依賴
```bash
npm install
```

### 本地開發（啟動 dev server）
```bash
npm run dev
```
瀏覽器會自動開啟 `http://localhost:5173`（若無，請手動開啟）

### 建立正式版（產生 dist/）
```bash
npm run build
```

### 部署到 GitHub Pages
```bash
npm run deploy
```
此命令會執行 `build`，然後將 `dist/` 目錄部署到 `gh-pages` 分支

---

# 🌐 個人網站

這是一個用來留下個人創作痕跡的網站，內容會隨著時間慢慢變化，沒有明確終點，只是持續整理與累積。
它被放在網路的一個角落，安靜地存在，作為對外展示，也作為自己的備忘。
網站中包含一些背景說明、專案片段與尚未完成的想法，介於作品集與筆記之間，適合被瀏覽，也適合被日後重新翻看。

👉 [網站連結](https://lscoupling.github.io/)

## 🛠 技術架構

- React：負責整體 UI 組件化與頁面邏輯
- Vite：提供快速的開發體驗與高效的建置流程
- GitHub Pages：作為靜態網站部署與對外公開平台

## ⚙️ 本地開發與部署

### 安裝依賴
```bash
npm install
```

### 本地開發（啟動 dev server）
```bash
npm run dev
```

### 建立正式版（產生 dist/）
```bash
npm run build
```

### 部署到 GitHub Pages
```bash
npm run deploy
```

## 📁 專案結構

```
├── public/
│ └── 2634_20251126.json # 範例資料
├── src/
│ ├── assets/ # 圖片與靜態資源
│ ├── pages/ # 各功能頁面
│ ├── tools/ # 各類小工具
│ ├── App.jsx # 應用主結構
│ ├── main.jsx # 入口檔案（React 掛載點）
│ └── styles.css # 全站樣式
├── index.html # HTML 入口
├── vite.config.js # Vite 設定
├── package.json # 專案設定與 scripts
└── README.md

```

---

# SkyBoard Weather筆記

「天氣儀表板」頁面時整理的 UI 元素與實作方向（React + Vite）。

- 目標：把資訊密度高的天氣資料，用「卡片 + 圖表 + 地圖」的方式呈現

---

## 1) 頁面需要的元素（Information Architecture）

### A. 頁首 / 導覽
- **位置/城市選擇**
  - 搜尋框（輸入地名、行政區）
  - 快速定位（使用瀏覽器 Geolocation）
  - 最近使用/收藏地點下拉
- **時間與資料來源提示**
  - 顯示「資料更新時間」
  - 顯示目前時區 / 當地時間

### B. 即時概覽區（Hero Summary）
- **目前溫度**（大字）
- **天氣描述**（晴/多雲/降雨）與圖示
- **體感溫度、最高/最低溫**
- **降雨機率、風速/風向、濕度**（小型指標）

### C. 小時預報（Hourly Forecast Row）
- 橫向可捲動的卡片列（時間、圖示、溫度、降雨機率/雨量）
- 支援選取某一小時，並同步更新下方細節卡（進階）

### D. 多日預報（Daily Forecast）
- 7–14 天列表（日期、圖示、最高/最低溫、降雨機率）
- 可展開某一天顯示更細項（紫外線、日出日落、風、濕度等）

### E. 細節卡片區（Detail Cards Grid）
規劃做成可重排/自適應的 grid（2–4 欄）：
- **溫度/體感**：迷你趨勢線（sparkline）
- **雲量**：百分比 + 簡圖
- **降雨量**：24h 累積雨量、降雨機率
- **風**：羅盤 + 風速/陣風
- **濕度 / 露點**：柱狀/條狀指示
- **氣壓**：數值 + 趨勢
- **能見度**：數值
- **紫外線**：指數 + 區間提示
- **空氣品質（若有）**：AQI 等級 + 污染物

### F. 圖表區（Charts）
- 溫度/體感/降雨量多線圖（可切換）
- 風速/陣風折線圖
- 支援 hover tooltip 與區間選取（進階）

### G. 地圖區（Map）
- 以地圖呈現目前位置
- 可疊加圖層：降雨雷達、雲圖、風場（若資料源支援）
- 手機版縮小為單卡，點擊才展開（進階）

### H. 版面行為（RWD / 可用性）
- 桌機：資訊密度高，卡片 grid 多欄
- 手機：折疊部分卡片、主要資訊置頂、列表改為橫向滑動

---

## 2) 實作方式（React + Vite）

### A. 資料來源（不需 API Key 的方案）
可用以下兩段式：
1) **地名 → 經緯度**：Open‑Meteo Geocoding API
2) **經緯度 → 天氣資料**：Open‑Meteo Forecast API

資料通常會包含：
- current：溫度、風速、濕度等
- hourly：每小時溫度、降雨機率、雨量等
- daily：最高/最低溫、日出日落等

### B. 主要狀態與資料流
- `location`：{ name, lat, lon, timezone }
- `units`：metric/imperial
- `forecast`：current/hourly/daily
- `selectedHour` / `selectedDay`：用於同步 detail cards
- `loading` / `error`

實作筆記：
- 用 `fetch` + `AbortController` 避免快速切換地點造成競態
- 用 `localStorage` 快取最近位置與最後查詢結果（加上 timestamp）

### C. 元件拆分
- `WeatherDashboardPage`
- `LocationSearch`
- `CurrentSummaryCard`
- `HourlyForecastStrip`
- `DailyForecastList`
- `DetailCard`
- `ChartsPanel`
- `MapPanel`

### D. 視覺與版面
既然此 repo 已經使用 CSS 變數主題（含深色模式），這裡就沿用同一套：
- 只使用 `--card-bg`, `--text-main`, `--text-sub`, `--border`, `--accent`, `--accent-soft`
- 以「卡片、圓角、柔和陰影、淡色背景」

### E. 圖表與地圖套件
- 圖表：`chart.js` 或 `recharts`（二選一）
- 地圖：`leaflet` + `react-leaflet`

若先以輕量版本為主：
- 先做 hourly strip + daily list + detail cards（先把主要體驗做順）

### F. 可及性
- 搜尋框與按鈕具備 `aria-label`
- 卡片區塊用 `section` + 標題層級
- 支援鍵盤操作

---

## 3) 對現有專案的落地方式（步驟）

1. 新增頁面：`src/tools/WeatherDashboard.jsx`
2. 新增樣式：`src/tools/weather-dashboard.css`
3. 在 Tools 清單新增入口：`/tools/weather`
4. 在路由新增：`<Route path="/tools/weather" ... />`
5. 深色模式：沿用 `body.dark` 

---

## 4) 名稱

目前名稱：
- **SkyBoard Weather**

備選名稱：
- **Weather Board**
- **Weather Desk**

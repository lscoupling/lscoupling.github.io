import { useRef } from "react";
import "./stock-chart.css";

export default function StockChart() {

  const fileInputRef = useRef(null);
  const dateSelectRef = useRef(null);
  const canvasRef = useRef(null);

  let datasets = {};
  let rows = [];
  let ctx, cvs;
  let frame = 0;
  let paused = false;
  let speed = 1;

  function formatTime(t) {
    const d = new Date(t);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  async function handleFiles(e) {
    const files = [...e.target.files];
    for (const file of files) {
      try {
        const json = JSON.parse(await file.text());
        const date = json.TradeDate || file.name.replace(".json", "");
        datasets[date] = json;
      } catch (err) {
        console.error("JSON 錯誤:", file.name);
      }
    }
    updateDateSelect();
  }

  function updateDateSelect() {
    const sel = dateSelectRef.current;
    sel.innerHTML = `<option value="">請選擇日期</option>`;
    Object.keys(datasets).sort().forEach(d => {
      const opt = document.createElement("option");
      opt.value = d;
      opt.textContent = d;
      sel.appendChild(opt);
    });
  }

  function play() {
    const sel = dateSelectRef.current.value;
    if (!sel) { alert("請選擇日期"); return; }

    rows = datasets[sel].DataPrice || [];

    cvs = canvasRef.current;
    const rect = cvs.parentNode.getBoundingClientRect();
    cvs.width = rect.width;
    cvs.height = 400;

    ctx = cvs.getContext("2d");

    paused = false;
    frame = 0;
    drawAnimation();
  }

  function pause() {
    paused = !paused;
    if (!paused) drawAnimation();
  }

  function drawAnimation() {
    if (paused) return;

    const W = cvs.width, H = cvs.height;
    const left = 70, right = 30, top = 20, bottom = 40;
    const plotW = W - left - right;
    const plotH = H - top - bottom;
    const PRICE_AREA_RATIO = 0.85;
    const PRICE_PLOT_H = plotH * PRICE_AREA_RATIO;

    const times = rows.map(r => r[0]);
    const prices = rows.map(r => r[1]);
    const vols = rows.map(r => r[2]);
    const highs = rows.map(r => r[3]);
    const lows = rows.map(r => r[4]);

    const yMin = Math.min(...lows);
    const yMax = Math.max(...highs);
    const yRange = yMax - yMin || 1;

    const vMax = Math.max(...vols) || 1;

    const tMin = Math.min(...times);
    const tMax = Math.max(...times);
    const tRange = tMax - tMin || 1;

    const xScale = t => left + (t - tMin) / tRange * plotW;
    const yScale = p => top + (1 - (p - yMin) / yRange) * PRICE_PLOT_H;
    const VOL_PLOT_TOP = top + PRICE_PLOT_H + 5;
    const VOL_PLOT_H = H - bottom - VOL_PLOT_TOP;
    const vScale = v => VOL_PLOT_TOP + VOL_PLOT_H - (v / vMax) * VOL_PLOT_H;

    ctx.clearRect(0, 0, W, H);

    // 背景線
    ctx.strokeStyle = "#1f2633";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= 5; i++) {
      const y = top + PRICE_PLOT_H * i / 5;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(W - right, y);
      ctx.stroke();
      ctx.fillStyle = "#888";
      ctx.fillText((yMax - (yMax - yMin) * i / 5).toFixed(2), left - 10, y + 4);
    }

    // 分界線
    ctx.beginPath();
    ctx.moveTo(left, VOL_PLOT_TOP - 2.5);
    ctx.lineTo(W - right, VOL_PLOT_TOP - 2.5);
    ctx.stroke();

    // 價格線
    ctx.strokeStyle = "#4da3ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < frame; i++) {
      const x = xScale(times[i]), y = yScale(prices[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 成交量
    ctx.fillStyle = "#2f6aeb";
    const barW = plotW / rows.length * 0.8;
    for (let i = 0; i < frame; i++) {
      const x = xScale(times[i]), y = vScale(vols[i]);
      ctx.fillRect(x - barW / 2, y, barW, (VOL_PLOT_TOP + VOL_PLOT_H) - y);
    }

    // 最高最低永遠畫
    const idxMax = highs.indexOf(yMax);
    const idxMin = lows.indexOf(yMin);

    if (idxMax >= 0) {
      ctx.fillStyle = "#ff5555";
      ctx.textAlign = "center";
      ctx.fillText(`高:${yMax.toFixed(2)}`, xScale(times[idxMax]), yScale(yMax) - 8);
    }
    if (idxMin >= 0) {
      ctx.fillStyle = "#55ff55";
      ctx.textAlign = "center";
      ctx.fillText(`低:${yMin.toFixed(2)}`, xScale(times[idxMin]), yScale(yMin) + 15);
    }

    // 時間
    ctx.fillStyle = "#999";
    ctx.textAlign = "center";
    ctx.fillText(formatTime(tMin - 8 * 3600 * 1000), left, H - 10);
    ctx.fillText(formatTime(tMax - 8 * 3600 * 1000), left + plotW, H - 10);


    frame += speed;
    if (frame < rows.length) {
      requestAnimationFrame(drawAnimation);
    }
  }

  return (
    <div className="stock-tool">
      <div id="left">

        <h3>請載入股價 JSON 檔</h3>

        <input ref={fileInputRef} type="file"
          multiple onChange={handleFiles} />

        <select ref={dateSelectRef}>
          <option>請選擇日期</option>
        </select>

        <button onClick={play}>▶ 播放</button>
        <button onClick={pause}>⏸ 暫停</button>

        <div className="speed-control">
          速度：
          <input type="range"
            min="0.25" max="3" step="0.25" defaultValue="1"
            onInput={e => {
              speed = Number(e.target.value);
              document.getElementById("speedValue").innerText = speed + "x";
            }}
          />
          <span id="speedValue">1x</span>
        </div>
        <button id="sampleBtn"
          onClick={() => {
            const a = document.createElement("a");
            a.href = "/2634_20251126.json";
            a.download = "2634_20251126.json";
            a.click();
          }}
        >
          ⬇ 範例下載
        </button>


      </div>

      <div id="right">
        <canvas ref={canvasRef}></canvas>
        <div id="hint">顯示股票逐步繪圖動畫</div>
      </div>
    </div>
  );
}

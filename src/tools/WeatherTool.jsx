import { useEffect, useMemo, useState } from "react";
import "./weather-tool.css";

const FALLBACK = {
  name: "台北市",
  lat: 25.033,
  lon: 121.5654,
};

const STORAGE_KEY_AREA = "weather_tool_area";

// 台灣 22 縣市（含澎湖/金門/連江）；使用代表座標（市府/縣府附近）
const TAIWAN_AREAS = [
  { id: "auto", name: "使用定位", lat: null, lon: null },
  { id: "taipei", name: "台北市", lat: 25.0330, lon: 121.5654 },
  { id: "new-taipei", name: "新北市", lat: 25.0120, lon: 121.4650 },
  { id: "taoyuan", name: "桃園市", lat: 24.9936, lon: 121.3010 },
  { id: "taichung", name: "台中市", lat: 24.1477, lon: 120.6736 },
  { id: "tainan", name: "台南市", lat: 22.9999, lon: 120.2270 },
  { id: "kaohsiung", name: "高雄市", lat: 22.6273, lon: 120.3014 },
  { id: "keelung", name: "基隆市", lat: 25.1276, lon: 121.7392 },
  { id: "hsinchu-city", name: "新竹市", lat: 24.8138, lon: 120.9675 },
  { id: "chiayi-city", name: "嘉義市", lat: 23.4800, lon: 120.4490 },
  { id: "hsinchu-county", name: "新竹縣", lat: 24.8387, lon: 121.0177 },
  { id: "miaoli", name: "苗栗縣", lat: 24.5600, lon: 120.8200 },
  { id: "changhua", name: "彰化縣", lat: 24.0800, lon: 120.5400 },
  { id: "nantou", name: "南投縣", lat: 23.9100, lon: 120.6900 },
  { id: "yunlin", name: "雲林縣", lat: 23.7100, lon: 120.5400 },
  { id: "chiayi-county", name: "嘉義縣", lat: 23.4500, lon: 120.2900 },
  { id: "pingtung", name: "屏東縣", lat: 22.5500, lon: 120.5500 },
  { id: "yilan", name: "宜蘭縣", lat: 24.7000, lon: 121.7400 },
  { id: "hualien", name: "花蓮縣", lat: 23.9900, lon: 121.6000 },
  { id: "taitung", name: "台東縣", lat: 22.7600, lon: 121.1500 },
  { id: "penghu", name: "澎湖縣", lat: 23.5700, lon: 119.5700 },
  { id: "kinmen", name: "金門縣", lat: 24.4300, lon: 118.3200 },
  { id: "lienchiang", name: "連江縣", lat: 26.1600, lon: 119.9500 },
];

function getAreaById(id) {
  return TAIWAN_AREAS.find(a => a.id === id) || null;
}

function normalizeTwName(name) {
  return String(name || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/臺/g, "台");
}

function detectTaiwanAreaFromPlaceName(placeName) {
  const normalized = normalizeTwName(placeName);
  if (!normalized) return null;

  for (const area of TAIWAN_AREAS) {
    if (area.id === "auto") continue;
    const aNorm = normalizeTwName(area.name);
    if (aNorm && normalized.includes(aNorm)) return area;
  }
  return null;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatHHmm(date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function formatMMDD(date) {
  return `${pad2(date.getMonth() + 1)}/${pad2(date.getDate())}`;
}

function formatWeekdayZh(date) {
  const map = ["日", "一", "二", "三", "四", "五", "六"];
  return `週${map[date.getDay()]}`;
}

function wmoToConditionZh(code) {
  // https://open-meteo.com/en/docs#weathervariables
  if (code === 0) return "晴朗";
  if (code === 1) return "大致晴";
  if (code === 2) return "局部多雲";
  if (code === 3) return "多雲";
  if (code === 45 || code === 48) return "有霧";
  if (code === 51 || code === 53 || code === 55) return "毛毛雨";
  if (code === 56 || code === 57) return "凍雨";
  if (code === 61 || code === 63 || code === 65) return "下雨";
  if (code === 66 || code === 67) return "凍雨";
  if (code === 71 || code === 73 || code === 75) return "下雪";
  if (code === 77) return "霰";
  if (code === 80 || code === 81 || code === 82) return "陣雨";
  if (code === 85 || code === 86) return "陣雪";
  if (code === 95) return "雷雨";
  if (code === 96 || code === 99) return "強雷雨";
  return "天氣";
}

function wmoToIcon(code) {
  if (code === 0) return "☀️";
  if (code === 1 || code === 2) return "⛅";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if ((code >= 51 && code <= 57) || (code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "🌧️";
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "🌨️";
  if (code >= 95) return "⛈️";
  return "🌡️";
}

async function reverseGeocode({ lat, lon }) {
  // Open‑Meteo reverse geocoding (best-effort). If it fails, fall back to coordinates.
  const url = new URL("https://geocoding-api.open-meteo.com/v1/reverse");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("language", "zh");
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("reverse geocoding failed");
  const json = await res.json();
  const first = json?.results?.[0];
  if (!first) return null;

  const pieces = [first.name, first.admin2, first.admin1].filter(Boolean);
  const name = pieces.join(" ");
  return name || null;
}

async function fetchWeather({ lat, lon }) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "relative_humidity_2m",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m",
    ].join(",")
  );
  url.searchParams.set(
    "hourly",
    ["temperature_2m", "precipitation_probability", "weather_code"].join(",")
  );
  url.searchParams.set(
    "daily",
    [
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "weather_code",
    ].join(",")
  );

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("weather fetch failed");
  return res.json();
}

export default function WeatherTool() {
  const [status, setStatus] = useState({
    state: "loading",
    message: "正在取得定位與天氣…",
  });
  const [isFallback, setIsFallback] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [coords, setCoords] = useState({ lat: FALLBACK.lat, lon: FALLBACK.lon });
  const [payload, setPayload] = useState(null);
  const [selectedAreaId, setSelectedAreaId] = useState("auto");
  const [detectedAreaName, setDetectedAreaName] = useState("");

  const current = payload?.current;

  const derived = useMemo(() => {
    if (!payload) return null;

    const now = new Date();
    const hourlyTimes = payload?.hourly?.time || [];

    // Find nearest hourly index by time string parse.
    let startIndex = 0;
    let best = Infinity;
    for (let i = 0; i < hourlyTimes.length; i++) {
      const t = new Date(hourlyTimes[i]);
      const diff = Math.abs(t.getTime() - now.getTime());
      if (diff < best) {
        best = diff;
        startIndex = i;
      }
    }

    const hourly = [];
    for (let i = startIndex; i < Math.min(startIndex + 24, hourlyTimes.length); i++) {
      const dt = new Date(hourlyTimes[i]);
      const temp = payload.hourly.temperature_2m?.[i];
      const code = payload.hourly.weather_code?.[i];
      const pop = payload.hourly.precipitation_probability?.[i];
      hourly.push({
        time: formatHHmm(dt),
        temp: typeof temp === "number" ? Math.round(temp) : null,
        code: typeof code === "number" ? code : null,
        precipChance: typeof pop === "number" ? pop : null,
      });
    }

    const daily = [];
    const dailyTimes = payload?.daily?.time || [];
    for (let i = 0; i < dailyTimes.length; i++) {
      const dt = new Date(dailyTimes[i]);
      const hi = payload.daily.temperature_2m_max?.[i];
      const lo = payload.daily.temperature_2m_min?.[i];
      const pop = payload.daily.precipitation_probability_max?.[i];
      const code = payload.daily.weather_code?.[i];
      daily.push({
        date: formatMMDD(dt),
        day: formatWeekdayZh(dt),
        high: typeof hi === "number" ? Math.round(hi) : null,
        low: typeof lo === "number" ? Math.round(lo) : null,
        precipChance: typeof pop === "number" ? pop : null,
        code: typeof code === "number" ? code : null,
      });
    }

    return { hourly, daily };
  }, [payload]);

  async function loadFor(lat, lon, { fallback = false, label = "" } = {}) {
    setStatus({ state: "loading", message: "正在更新天氣…" });
    setIsFallback(fallback);

    try {
      setCoords({ lat, lon });

      const [w, name] = await Promise.all([
        fetchWeather({ lat, lon }),
        reverseGeocode({ lat, lon }).catch(() => null),
      ]);

      setPayload(w);

      const placeLabel = label || name || (fallback ? FALLBACK.name : `${lat.toFixed(2)}, ${lon.toFixed(2)}`);
      setLocationName(placeLabel);

      if (selectedAreaId === "auto") {
        if (fallback) {
          setDetectedAreaName(FALLBACK.name);
        } else {
          const detected = detectTaiwanAreaFromPlaceName(placeLabel);
          setDetectedAreaName(detected?.name || "");
        }
      }

      setStatus({ state: "ready", message: "" });
    } catch (e) {
      console.error(e);
      setStatus({
        state: "error",
        message: "目前無法取得天氣資料，請稍後再試。",
      });
    }
  }

  function loadViaGeolocation() {
    if (!navigator.geolocation) {
      loadFor(FALLBACK.lat, FALLBACK.lon, { fallback: true, label: FALLBACK.name });
      return;
    }

    const geoOptions = {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 30 * 60 * 1000,
    };

    navigator.geolocation.getCurrentPosition(
      pos => {
        loadFor(pos.coords.latitude, pos.coords.longitude, { fallback: false, label: "" });
      },
      () => {
        loadFor(FALLBACK.lat, FALLBACK.lon, { fallback: true, label: FALLBACK.name });
      },
      geoOptions
    );
  }

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_AREA) || "auto";
    const area = getAreaById(saved);

    if (area && area.id !== "auto" && typeof area.lat === "number" && typeof area.lon === "number") {
      setSelectedAreaId(area.id);
      loadFor(area.lat, area.lon, { fallback: false, label: area.name });
      return;
    }

    setSelectedAreaId("auto");
    setDetectedAreaName("");
    loadViaGeolocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const condition = typeof current?.weather_code === "number" ? wmoToConditionZh(current.weather_code) : "";
  const icon = typeof current?.weather_code === "number" ? wmoToIcon(current.weather_code) : "";
  const hourlyShown = derived?.hourly?.slice(0, 12) || [];

  return (
    <div className="weather-tool">
      <div className="weather-header">
        <div>
          <h2>天氣</h2>
          <div className="weather-sub">
            <span className="weather-location">{locationName || "—"}</span>
            {isFallback && status.state === "ready" ? (
              <span className="weather-badge" title="定位失敗，改用預設地點">
                已改用預設地點
              </span>
            ) : null}
          </div>

          <div className="weather-sub weather-sub-controls">
            <select
              className="weather-select"
              value={selectedAreaId}
              onChange={e => {
                const nextId = e.target.value;
                setSelectedAreaId(nextId);

                // Selecting a fixed area overrides any auto-detected label.
                if (nextId !== "auto") setDetectedAreaName("");

                if (nextId === "auto") {
                  localStorage.removeItem(STORAGE_KEY_AREA);
                  setDetectedAreaName("");
                  loadViaGeolocation();
                  return;
                }

                const area = getAreaById(nextId);
                if (!area || typeof area.lat !== "number" || typeof area.lon !== "number") return;

                localStorage.setItem(STORAGE_KEY_AREA, nextId);
                loadFor(area.lat, area.lon, { fallback: false, label: area.name });
              }}
              disabled={status.state === "loading"}
              aria-label="選擇地區"
            >
              {TAIWAN_AREAS.map(a => {
                const label = a.id === "auto" && detectedAreaName ? `使用定位（${detectedAreaName}）` : a.name;
                return (
                  <option key={a.id} value={a.id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="weather-actions">
          <button
            className="weather-btn"
            onClick={() => {
              if (selectedAreaId !== "auto") {
                const area = getAreaById(selectedAreaId);
                if (area && typeof area.lat === "number" && typeof area.lon === "number") {
                  loadFor(area.lat, area.lon, { fallback: false, label: area.name });
                  return;
                }
              }

              loadFor(coords.lat, coords.lon, { fallback: isFallback, label: isFallback ? FALLBACK.name : "" });
            }}
            disabled={status.state === "loading"}
          >
            重新整理
          </button>
        </div>
      </div>

      {status.state === "error" ? (
        <div className="weather-card weather-error">
          <div className="weather-error-title">發生錯誤</div>
          <div className="weather-error-msg">{status.message}</div>
          <button
            className="weather-btn"
            onClick={() => {
              if (selectedAreaId !== "auto") {
                const area = getAreaById(selectedAreaId);
                if (area && typeof area.lat === "number" && typeof area.lon === "number") {
                  loadFor(area.lat, area.lon, { fallback: false, label: area.name });
                  return;
                }
              }

              loadFor(coords.lat, coords.lon, { fallback: isFallback, label: isFallback ? FALLBACK.name : "" });
            }}
          >
            再試一次
          </button>
        </div>
      ) : null}

      {status.state === "loading" ? (
        <div className="weather-card">
          <div className="weather-loading">{status.message}</div>
        </div>
      ) : null}

      {status.state === "ready" && payload ? (
        <>
          <div className="weather-top">
            <div className="weather-card weather-now">
              <div className="weather-now-main">
                <div className="weather-now-icon" aria-hidden="true">
                  {icon}
                </div>
                <div>
                  <div className="weather-now-temp">
                    {typeof current?.temperature_2m === "number" ? Math.round(current.temperature_2m) : "—"}
                    <span className="weather-now-unit">°C</span>
                  </div>
                  <div className="weather-now-cond">{condition || "—"}</div>
                  <div className="weather-now-updated">{formatHHmm(new Date())} 更新</div>
                </div>
              </div>

              <div className="weather-now-grid">
                <div className="weather-stat">
                  <div className="weather-stat-k">濕度</div>
                  <div className="weather-stat-v">
                    {typeof current?.relative_humidity_2m === "number" ? `${current.relative_humidity_2m}%` : "—"}
                  </div>
                </div>
                <div className="weather-stat">
                  <div className="weather-stat-k">風速</div>
                  <div className="weather-stat-v">
                    {typeof current?.wind_speed_10m === "number" ? `${Math.round(current.wind_speed_10m)} km/h` : "—"}
                  </div>
                </div>
                <div className="weather-stat">
                  <div className="weather-stat-k">風向</div>
                  <div className="weather-stat-v">
                    {typeof current?.wind_direction_10m === "number" ? `${Math.round(current.wind_direction_10m)}°` : "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="weather-card weather-hourly">
              <h3>未來 12 小時</h3>
              <div className="weather-hourly-row" role="list">
                {hourlyShown.map((h, idx) => (
                  <div className="weather-hour" key={`${h.time}-${idx}`} role="listitem">
                    <div className="weather-hour-t">{h.time}</div>
                    <div className="weather-hour-i" aria-hidden="true">
                      {typeof h.code === "number" ? wmoToIcon(h.code) : ""}
                    </div>
                    <div className="weather-hour-v">{typeof h.temp === "number" ? `${h.temp}°` : "—"}</div>
                    <div className="weather-hour-p">{typeof h.precipChance === "number" ? `${h.precipChance}%` : ""}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="weather-card weather-daily">
            <h3>未來 7 天</h3>
            <div className="weather-daily-list">
              {derived?.daily?.map((d, idx) => (
                <div className="weather-day" key={`${d.date}-${idx}`}>
                  <div className="weather-day-left">
                    <div className="weather-day-date">{d.date}</div>
                    <div className="weather-day-week">{d.day}</div>
                  </div>
                  <div className="weather-day-mid" aria-hidden="true">
                    {typeof d.code === "number" ? wmoToIcon(d.code) : ""}
                  </div>
                  <div className="weather-day-right">
                    <div className="weather-day-temps">
                      <span className="weather-day-hi">{typeof d.high === "number" ? `${d.high}°` : "—"}</span>
                      <span className="weather-day-lo">{typeof d.low === "number" ? `${d.low}°` : "—"}</span>
                    </div>
                    <div className="weather-day-pop">{typeof d.precipChance === "number" ? `降雨 ${d.precipChance}%` : ""}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="weather-footnote">
            資料來源：Open‑Meteo（免金鑰）。
          </div>
        </>
      ) : null}
    </div>
  );
}

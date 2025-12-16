import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./snake.css";

const GRID_SIZE = 20;
const DEFAULT_SPEED_MS = 110;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sameCell(a, b) {
  return a.x === b.x && a.y === b.y;
}

function isOpposite(a, b) {
  return a.x + b.x === 0 && a.y + b.y === 0;
}

export default function Snake() {
  const canvasRef = useRef(null);

  const [status, setStatus] = useState("ready"); // ready | running | paused | over
  const [score, setScore] = useState(0);

  const directionRef = useRef({ x: 1, y: 0 });
  const nextDirectionRef = useRef({ x: 1, y: 0 });
  const snakeRef = useRef([
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 },
  ]);
  const foodRef = useRef({ x: 14, y: 10 });
  const tickTimerRef = useRef(null);

  const grid = useMemo(() => ({ cols: GRID_SIZE, rows: GRID_SIZE }), []);

  const placeFood = useCallback(() => {
    const snake = snakeRef.current;

    for (let attempts = 0; attempts < 500; attempts++) {
      const candidate = {
        x: randomInt(0, grid.cols - 1),
        y: randomInt(0, grid.rows - 1),
      };
      const onSnake = snake.some((s) => sameCell(s, candidate));
      if (!onSnake) {
        foodRef.current = candidate;
        return;
      }
    }

    // 盤面滿了（理論上很難）
    setStatus("over");
  }, [grid.cols, grid.rows]);

  const resetGame = useCallback(() => {
    snakeRef.current = [
      { x: 8, y: 10 },
      { x: 7, y: 10 },
      { x: 6, y: 10 },
    ];
    directionRef.current = { x: 1, y: 0 };
    nextDirectionRef.current = { x: 1, y: 0 };
    setScore(0);
    setStatus("ready");
    placeFood();
  }, [placeFood]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const css = getComputedStyle(document.documentElement);
    const bg = css.getPropertyValue("--card-bg").trim() || "#fff";
    const border = css.getPropertyValue("--border").trim() || "#e5e7eb";
    const text = css.getPropertyValue("--text-main").trim() || "#111";
    const accent = css.getPropertyValue("--accent").trim() || "#f97316";

    const W = canvas.width;
    const H = canvas.height;
    const cellW = W / grid.cols;
    const cellH = H / grid.rows;

    // background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // subtle grid
    ctx.strokeStyle = border;
    ctx.globalAlpha = 0.35;
    for (let i = 1; i < grid.cols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellW, 0);
      ctx.lineTo(i * cellW, H);
      ctx.stroke();
    }
    for (let j = 1; j < grid.rows; j++) {
      ctx.beginPath();
      ctx.moveTo(0, j * cellH);
      ctx.lineTo(W, j * cellH);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // food
    const food = foodRef.current;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(
      (food.x + 0.5) * cellW,
      (food.y + 0.5) * cellH,
      Math.min(cellW, cellH) * 0.32,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // snake
    const snake = snakeRef.current;
    for (let i = 0; i < snake.length; i++) {
      const seg = snake[i];
      const inset = Math.min(cellW, cellH) * 0.12;
      ctx.fillStyle = i === 0 ? text : "rgba(127, 177, 255, 0.85)";
      ctx.fillRect(
        seg.x * cellW + inset,
        seg.y * cellH + inset,
        cellW - inset * 2,
        cellH - inset * 2
      );
    }

    // overlay text
    if (status === "ready") {
      ctx.fillStyle = text;
      ctx.globalAlpha = 0.85;
      ctx.font = "600 18px system-ui, -apple-system, Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("按 Enter 開始", W / 2, H / 2 - 6);
      ctx.font = "14px system-ui, -apple-system, Segoe UI, sans-serif";
      ctx.fillText("方向鍵 / WASD 控制，Esc 暫停", W / 2, H / 2 + 18);
      ctx.globalAlpha = 1;
    }

    if (status === "paused") {
      ctx.fillStyle = text;
      ctx.globalAlpha = 0.85;
      ctx.font = "600 18px system-ui, -apple-system, Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("暫停中（按 Esc 繼續）", W / 2, H / 2);
      ctx.globalAlpha = 1;
    }

    if (status === "over") {
      ctx.fillStyle = text;
      ctx.globalAlpha = 0.9;
      ctx.font = "700 20px system-ui, -apple-system, Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("遊戲結束", W / 2, H / 2 - 8);
      ctx.font = "14px system-ui, -apple-system, Segoe UI, sans-serif";
      ctx.fillText("按 R 重新開始", W / 2, H / 2 + 18);
      ctx.globalAlpha = 1;
    }
  }, [grid.cols, grid.rows, status]);

  const step = useCallback(() => {
    const snake = snakeRef.current;
    const head = snake[0];

    // commit direction
    const nextDir = nextDirectionRef.current;
    if (!isOpposite(directionRef.current, nextDir)) {
      directionRef.current = nextDir;
    }

    const dir = directionRef.current;
    const nextHead = { x: head.x + dir.x, y: head.y + dir.y };

    // wall collision
    if (
      nextHead.x < 0 ||
      nextHead.x >= grid.cols ||
      nextHead.y < 0 ||
      nextHead.y >= grid.rows
    ) {
      setStatus("over");
      return;
    }

    // self collision
    const hitsSelf = snake.some((s) => sameCell(s, nextHead));
    if (hitsSelf) {
      setStatus("over");
      return;
    }

    const newSnake = [nextHead, ...snake];

    // eat
    if (sameCell(nextHead, foodRef.current)) {
      setScore((s) => s + 1);
      snakeRef.current = newSnake;
      placeFood();
      return;
    }

    // move
    newSnake.pop();
    snakeRef.current = newSnake;
  }, [grid.cols, grid.rows, placeFood]);

  const stopLoop = useCallback(() => {
    if (tickTimerRef.current) {
      window.clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
  }, []);

  const startLoop = useCallback(() => {
    stopLoop();
    tickTimerRef.current = window.setInterval(() => {
      step();
      draw();
    }, DEFAULT_SPEED_MS);
  }, [draw, step, stopLoop]);

  const start = useCallback(() => {
    if (status === "running") return;
    setStatus("running");
  }, [status]);

  const togglePause = useCallback(() => {
    setStatus((s) => {
      if (s === "running") return "paused";
      if (s === "paused") return "running";
      return s;
    });
  }, []);

  useEffect(() => {
    // responsive canvas sizing
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const size = Math.min(720, canvas.parentElement?.clientWidth ?? 720);
      canvas.width = size;
      canvas.height = size;

      draw();
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [draw]);

  useEffect(() => {
    // keyboard controls
    const onKeyDown = (e) => {
      const key = e.key.toLowerCase();

      if (key === "enter") {
        if (status === "ready") start();
        return;
      }

      if (key === "escape") {
        if (status === "running" || status === "paused") togglePause();
        return;
      }

      if (key === "r") {
        if (status === "over" || status === "ready") resetGame();
        return;
      }

      const dirMap = {
        arrowup: { x: 0, y: -1 },
        w: { x: 0, y: -1 },
        arrowdown: { x: 0, y: 1 },
        s: { x: 0, y: 1 },
        arrowleft: { x: -1, y: 0 },
        a: { x: -1, y: 0 },
        arrowright: { x: 1, y: 0 },
        d: { x: 1, y: 0 },
      };

      const next = dirMap[key];
      if (next) {
        e.preventDefault();
        const current = directionRef.current;
        if (!isOpposite(current, next)) {
          nextDirectionRef.current = next;
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [resetGame, start, status, togglePause]);

  useEffect(() => {
    // game loop based on status
    if (status === "running") {
      startLoop();
      return;
    }

    stopLoop();
    draw();
  }, [draw, startLoop, status, stopLoop]);

  useEffect(() => {
    // initial draw
    placeFood();
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="content">
      <section className="card snake-wrap">
        <div className="snake-topbar">
          <div>
            <h2 style={{ margin: 0 }}>貪吃蛇</h2>
            <p className="snake-hint">
              方向鍵 / WASD 控制，Enter 開始，Esc 暫停，R 重來
            </p>
          </div>

          <div className="snake-actions">
            <button
              className="snake-btn"
              onClick={() => {
                if (status === "ready") start();
                else if (status === "running" || status === "paused") togglePause();
              }}
            >
              {status === "ready" ? "開始" : status === "paused" ? "繼續" : "暫停"}
            </button>
            <button className="snake-btn" onClick={resetGame}>
              重新開始
            </button>
            <Link className="snake-btn" to="/games">
              回清單
            </Link>
          </div>

          <div className="snake-meta">
            <div>分數：{score}</div>
            <div>狀態：{status === "over" ? "結束" : status}</div>
          </div>
        </div>

        <canvas ref={canvasRef} className="snake-canvas" />
      </section>
    </main>
  );
}

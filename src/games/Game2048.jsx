import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./2048.css";

const SIZE = 4;
const STORAGE_KEY = "lscoupling_2048_best";

function makeEmptyBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function cloneBoard(board) {
  return board.map((row) => row.slice());
}

function randomInt(maxExclusive) {
  return Math.floor(Math.random() * maxExclusive);
}

function getEmptyCells(board) {
  const cells = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) cells.push({ r, c });
    }
  }
  return cells;
}

function spawnTile(board) {
  const empties = getEmptyCells(board);
  if (empties.length === 0) return false;

  const pick = empties[randomInt(empties.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  board[pick.r][pick.c] = value;
  return true;
}

function mergeLine(line) {
  // line: number[] length SIZE
  const filtered = line.filter((v) => v !== 0);
  const result = [];
  let gained = 0;

  for (let i = 0; i < filtered.length; i++) {
    const cur = filtered[i];
    const next = filtered[i + 1];
    if (next && cur === next) {
      const merged = cur * 2;
      result.push(merged);
      gained += merged;
      i++;
    } else {
      result.push(cur);
    }
  }

  while (result.length < SIZE) result.push(0);
  const moved = result.some((v, i) => v !== line[i]);
  return { line: result, moved, gained };
}

function boardEquals(a, b) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
}

function canMove(board) {
  if (getEmptyCells(board).length > 0) return true;

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = board[r][c];
      if (r + 1 < SIZE && board[r + 1][c] === v) return true;
      if (c + 1 < SIZE && board[r][c + 1] === v) return true;
    }
  }
  return false;
}

function move(board, dir) {
  // dir: 'up' | 'down' | 'left' | 'right'
  const next = makeEmptyBoard();
  let movedAny = false;
  let gainedTotal = 0;

  const getLine = (index) => {
    const line = [];
    for (let i = 0; i < SIZE; i++) {
      if (dir === "left") line.push(board[index][i]);
      if (dir === "right") line.push(board[index][SIZE - 1 - i]);
      if (dir === "up") line.push(board[i][index]);
      if (dir === "down") line.push(board[SIZE - 1 - i][index]);
    }
    return line;
  };

  const setLine = (index, line) => {
    for (let i = 0; i < SIZE; i++) {
      const v = line[i];
      if (dir === "left") next[index][i] = v;
      if (dir === "right") next[index][SIZE - 1 - i] = v;
      if (dir === "up") next[i][index] = v;
      if (dir === "down") next[SIZE - 1 - i][index] = v;
    }
  };

  for (let idx = 0; idx < SIZE; idx++) {
    const original = getLine(idx);
    const merged = mergeLine(original);
    setLine(idx, merged.line);
    if (merged.moved) movedAny = true;
    gainedTotal += merged.gained;
  }

  return { board: next, moved: movedAny, gained: gainedTotal };
}

export default function Game2048() {
  const [board, setBoard] = useState(() => {
    const b = makeEmptyBoard();
    spawnTile(b);
    spawnTile(b);
    return b;
  });
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("playing"); // playing | over

  const bestRef = useRef(0);
  const [best, setBest] = useState(0);

  const maxTile = useMemo(() => {
    let m = 0;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c] > m) m = board[r][c];
      }
    }
    return m;
  }, [board]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const n = raw ? Number(raw) : 0;
    bestRef.current = Number.isFinite(n) ? n : 0;
    setBest(bestRef.current);
  }, []);

  const persistBestIfNeeded = useCallback((nextScore) => {
    if (nextScore > bestRef.current) {
      bestRef.current = nextScore;
      setBest(nextScore);
      localStorage.setItem(STORAGE_KEY, String(nextScore));
    }
  }, []);

  const reset = useCallback(() => {
    const b = makeEmptyBoard();
    spawnTile(b);
    spawnTile(b);
    setBoard(b);
    setScore(0);
    setStatus("playing");
  }, []);

  const applyMove = useCallback(
    (dir) => {
      if (status !== "playing") return;

      const current = cloneBoard(board);
      const res = move(current, dir);
      if (!res.moved) return;

      const next = res.board;
      spawnTile(next);

      const nextScore = score + res.gained;

      setBoard(next);
      setScore(nextScore);
      persistBestIfNeeded(nextScore);

      if (!canMove(next)) {
        setStatus("over");
      }
    },
    [board, persistBestIfNeeded, score, status]
  );

  useEffect(() => {
    const onKeyDown = (e) => {
      const key = e.key.toLowerCase();

      if (key === "r") {
        reset();
        return;
      }

      if (key === "arrowup" || key === "w") {
        e.preventDefault();
        applyMove("up");
      } else if (key === "arrowdown" || key === "s") {
        e.preventDefault();
        applyMove("down");
      } else if (key === "arrowleft" || key === "a") {
        e.preventDefault();
        applyMove("left");
      } else if (key === "arrowright" || key === "d") {
        e.preventDefault();
        applyMove("right");
      }
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [applyMove, reset]);

  useEffect(() => {
    // 若外部把 board set 回去，確保 status 正確
    if (status === "playing" && !canMove(board)) {
      setStatus("over");
    }
  }, [board, status]);

  const overlay = useMemo(() => {
    if (status !== "over") return null;
    return (
      <div className="g2048-overlay">
        <strong>遊戲結束</strong>
        <p>按 R 或點「重新開始」再來一局。</p>
      </div>
    );
  }, [status]);

  return (
    <main className="content">
      <section className="card g2048-wrap">
        <div className="g2048-topbar">
          <div className="g2048-title">
            <h2>2048</h2>
            <p className="g2048-hint">方向鍵 / WASD 移動，R 重新開始</p>
          </div>

          <div className="g2048-actions">
            <button className="g2048-btn" onClick={reset}>
              重新開始
            </button>
            <Link className="g2048-btn" to="/games">
              回清單
            </Link>
          </div>

          <div className="g2048-meta">
            <div className="g2048-pill">分數：{score}</div>
            <div className="g2048-pill">最佳：{best}</div>
            <div className="g2048-pill">最大：{maxTile}</div>
          </div>
        </div>

        {overlay}

        <div className="g2048-board" aria-label="2048 board">
          {board.flatMap((row, r) =>
            row.map((v, c) => {
              const isEmpty = v === 0;
              const vClass = isEmpty ? "g2048-cell--empty" : `g2048-cell--v${v}`;
              return (
                <div
                  key={`${r}-${c}`}
                  className={`g2048-cell ${vClass}`}
                  aria-label={isEmpty ? "empty" : String(v)}
                >
                  {isEmpty ? "" : v}
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}

// 2048 tile class fallback (for >2048 values):
// If player goes beyond, CSS will simply not match and use base cell style.

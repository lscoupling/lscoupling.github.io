import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./minesweeper.css";

const ROWS = 9;
const COLS = 9;
const MINES = 10;

function inBounds(r, c) {
  return r >= 0 && r < ROWS && c >= 0 && c < COLS;
}

function neighbors(r, c) {
  const out = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (inBounds(nr, nc)) out.push([nr, nc]);
    }
  }
  return out;
}

function makeEmpty() {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    }))
  );
}

function countAdjacent(board) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].mine) {
        board[r][c].adjacent = 0;
        continue;
      }
      let count = 0;
      for (const [nr, nc] of neighbors(r, c)) {
        if (board[nr][nc].mine) count++;
      }
      board[r][c].adjacent = count;
    }
  }
}

function placeMines(board, safeR, safeC) {
  const forbidden = new Set([`${safeR},${safeC}`]);
  for (const [nr, nc] of neighbors(safeR, safeC)) {
    forbidden.add(`${nr},${nc}`);
  }

  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    const key = `${r},${c}`;
    if (forbidden.has(key)) continue;
    if (board[r][c].mine) continue;
    board[r][c].mine = true;
    placed++;
  }

  countAdjacent(board);
}

function revealFlood(board, startR, startC) {
  const queue = [[startR, startC]];
  const seen = new Set();

  while (queue.length) {
    const [r, c] = queue.shift();
    const key = `${r},${c}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const cell = board[r][c];
    if (cell.revealed || cell.flagged) continue;

    cell.revealed = true;

    if (cell.adjacent === 0 && !cell.mine) {
      for (const [nr, nc] of neighbors(r, c)) {
        const ncell = board[nr][nc];
        if (!ncell.revealed && !ncell.flagged) {
          queue.push([nr, nc]);
        }
      }
    }
  }
}

function revealAllMines(board) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].mine) board[r][c].revealed = true;
    }
  }
}

function countFlags(board) {
  let n = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].flagged) n++;
    }
  }
  return n;
}

function isWin(board) {
  // win if all non-mine cells are revealed
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = board[r][c];
      if (!cell.mine && !cell.revealed) return false;
    }
  }
  return true;
}

export default function Minesweeper() {
  const [board, setBoard] = useState(() => makeEmpty());
  const [status, setStatus] = useState("ready"); // ready | playing | over | win
  const [started, setStarted] = useState(false);

  const flags = useMemo(() => countFlags(board), [board]);
  const minesLeft = Math.max(0, MINES - flags);

  const reset = useCallback(() => {
    setBoard(makeEmpty());
    setStatus("ready");
    setStarted(false);
  }, []);

  const onReveal = useCallback(
    (r, c) => {
      if (status === "over" || status === "win") return;

      setBoard((prev) => {
        const next = prev.map((row) => row.map((cell) => ({ ...cell })));
        const cell = next[r][c];
        if (cell.revealed || cell.flagged) return prev;

        if (!started) {
          placeMines(next, r, c);
          setStarted(true);
          setStatus("playing");
        }

        const afterMineCell = next[r][c];
        if (afterMineCell.mine) {
          afterMineCell.revealed = true;
          revealAllMines(next);
          setStatus("over");
          return next;
        }

        revealFlood(next, r, c);

        if (isWin(next)) {
          setStatus("win");
        } else if (status === "ready") {
          setStatus("playing");
        }

        return next;
      });
    },
    [started, status]
  );

  const onToggleFlag = useCallback(
    (r, c) => {
      if (status === "over" || status === "win") return;

      setBoard((prev) => {
        const next = prev.map((row) => row.map((cell) => ({ ...cell })));
        const cell = next[r][c];
        if (cell.revealed) return prev;
        cell.flagged = !cell.flagged;
        return next;
      });
    },
    [status]
  );

  useEffect(() => {
    const onKeyDown = (e) => {
      const k = e.key.toLowerCase();
      if (k === "r") reset();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [reset]);

  const overlay = useMemo(() => {
    if (status === "over") {
      return (
        <div className="ms-overlay">
          <strong>踩到地雷了</strong>
          <p>按 R 或點「重新開始」再玩一次。</p>
        </div>
      );
    }
    if (status === "win") {
      return (
        <div className="ms-overlay">
          <strong>你贏了！</strong>
          <p>按 R 或點「重新開始」再來一局。</p>
        </div>
      );
    }
    return null;
  }, [status]);

  return (
    <main className="content">
      <section className="card ms-wrap">
        <div className="ms-topbar">
          <div className="ms-title">
            <h2>踩地雷</h2>
            <p className="ms-hint">左鍵翻開，右鍵插旗（R 重新開始）</p>
          </div>

          <div className="ms-actions">
            <button className="ms-btn" onClick={reset}>
              重新開始
            </button>
            <Link className="ms-btn" to="/games">
              回清單
            </Link>
          </div>

          <div className="ms-meta">
            <div className="ms-pill">地雷：{MINES}</div>
            <div className="ms-pill">剩餘：{minesLeft}</div>
            <div className="ms-pill">狀態：{status}</div>
          </div>
        </div>

        {overlay}

        <div
          className="ms-board"
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
          role="grid"
          aria-label="minesweeper board"
        >
          {board.flatMap((row, r) =>
            row.map((cell, c) => {
              const label = cell.revealed
                ? cell.mine
                  ? "mine"
                  : cell.adjacent === 0
                    ? "empty"
                    : String(cell.adjacent)
                : cell.flagged
                  ? "flag"
                  : "hidden";

              const className = [
                "ms-cell",
                cell.revealed ? "ms-cell--revealed" : "",
                cell.revealed && cell.mine ? "ms-cell--mine" : "",
                !cell.revealed && cell.flagged ? "ms-cell--flagged" : "",
              ]
                .filter(Boolean)
                .join(" ");

              const text = cell.revealed
                ? cell.mine
                  ? "💣"
                  : cell.adjacent === 0
                    ? ""
                    : cell.adjacent
                : cell.flagged
                  ? "🚩"
                  : "";

              return (
                <button
                  key={`${r}-${c}`}
                  className={className}
                  type="button"
                  aria-label={label}
                  onClick={() => onReveal(r, c)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    onToggleFlag(r, c);
                  }}
                  disabled={cell.revealed || status === "over" || status === "win"}
                >
                  {text}
                </button>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}

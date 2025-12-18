import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./tictactoe.css";

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function getWinner(cells) {
  for (const [a, b, c] of LINES) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return { player: cells[a], line: [a, b, c] };
    }
  }
  return null;
}

export default function TicTacToe() {
  const [cells, setCells] = useState(Array(9).fill(null));
  const [startWithX, setStartWithX] = useState(true);
  const [xIsNext, setXIsNext] = useState(true);

  const winner = useMemo(() => getWinner(cells), [cells]);
  const winningLine = winner?.line ?? [];
  const isFull = cells.every(Boolean);
  const isBoardLocked = Boolean(winner) || isFull;
  const status = winner
    ? `${winner.player} 勝利！`
    : isFull
      ? "平手"
      : `${xIsNext ? "X" : "O"} 的回合`;

  const handleMove = (index) => {
    if (cells[index] || winner) return;
    const next = [...cells];
    next[index] = xIsNext ? "X" : "O";
    setCells(next);
    setXIsNext((prev) => !prev);
  };

  const reset = () => {
    setCells(Array(9).fill(null));
    setXIsNext(startWithX);
  };

  const swapStarter = () => {
    setStartWithX((prev) => {
      const next = !prev;
      setCells(Array(9).fill(null));
      setXIsNext(next);
      return next;
    });
  };

  return (
    <div className="ttt-page">
      <header className="ttt-header">
        <div>
          <p className="breadcrumb">
            <Link to="/games" className="breadcrumb-link">小遊戲</Link>
            <span className="breadcrumb-sep">/</span>
            井字棋
          </p>
          <h1>井字棋</h1>
          <p className="subtitle">輕鬆對戰，三連線即獲勝！</p>
        </div>
        <div className="ttt-actions">
          <button className="ttt-btn" onClick={reset}>重新開始</button>
          <button className="ttt-btn" onClick={swapStarter}>
            {startWithX ? "改由 O 先手" : "改由 X 先手"}
          </button>
        </div>
      </header>

      <div className="ttt-status" aria-live="polite">{status}</div>

      <div className="ttt-board">
        {cells.map((cell, idx) => (
          <button
            key={idx}
            className={`ttt-cell ${cell ? "ttt-cell--filled" : ""} ${
              winningLine.includes(idx) ? "ttt-cell--win" : ""
            }`}
            onClick={() => handleMove(idx)}
            aria-label={`第 ${idx + 1} 格`}
            disabled={Boolean(cell) || isBoardLocked}
          >
            {cell}
          </button>
        ))}
      </div>

      <div className="ttt-hints">
        <div className="ttt-pill">先手：{startWithX ? "X" : "O"}</div>
        <div className="ttt-pill">狀態：{isBoardLocked ? "已結束" : "進行中"}</div>
        <div className="ttt-pill">點擊空格完成下子</div>
        <div className="ttt-pill">重新開始可重置局面</div>
      </div>
    </div>
  );
}

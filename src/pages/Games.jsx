import { Link } from "react-router-dom";

export default function Games() {
  return (
    <div className="tools-container">
      <h1>小遊戲</h1>

      <div className="tools-grid">
        <Link className="tool-card" to="/games/snake">
          貪吃蛇
        </Link>
        <Link className="tool-card" to="/games/2048">
          2048
        </Link>
        <Link className="tool-card" to="/games/minesweeper">
          踩地雷
        </Link>
        <Link className="tool-card" to="/games/tictactoe">
          井字棋
        </Link>
        <Link className="tool-card" to="/games/coming-soon">
          敬請期待
        </Link>
      </div>
    </div>
  );
}

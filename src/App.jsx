import { Routes, Route, Link } from "react-router-dom";
import Resume from "./pages/Resume";
import Tools from "./pages/Tools";
import Games from "./pages/Games";
import GamesComingSoon from "./pages/GamesComingSoon";
import Snake from "./games/Snake";
import Game2048 from "./games/Game2048";
import Minesweeper from "./games/Minesweeper";
import XmlTool from "./tools/XmlTool";
import PdfMerge from "./tools/PdfMerge";
import StockChart from "./tools/StockChart";

const App = () => {
  return (
    <>
      <nav className="navbar">
        <div className="nav-left">

        </div>

        <div className="nav-right">
          <Link to="/">首頁</Link>
          <Link to="/tools">自製小工具</Link>
          <Link to="/games">小遊戲</Link>
          <button
            className="theme-toggle"
            onClick={() => {
              document.body.classList.toggle("dark");
            }}
          >
            🌙
          </button>
        </div>
      </nav>

      <div className="page">
        <Routes>
          <Route path="/" element={<Resume />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/coming-soon" element={<GamesComingSoon />} />
          <Route path="/games/snake" element={<Snake />} />
          <Route path="/games/2048" element={<Game2048 />} />
          <Route path="/games/minesweeper" element={<Minesweeper />} />
          <Route path="/tools/xml" element={<XmlTool />} />
          <Route path="/tools/pdf-merge" element={<PdfMerge />} />
          <Route path="/tools/stock-chart" element={<StockChart />} />
        </Routes>
      </div>
    </>
  );
};

export default App;

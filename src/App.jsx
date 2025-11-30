import { Routes, Route, Link } from "react-router-dom";
import Resume from "./pages/Resume";
import Tools from "./pages/Tools";
import XmlTool from "./tools/XmlTool";
import PdfMerge from "./tools/PdfMerge";


const App = () => {
  return (
    <>
      <nav className="navbar">
        <div className="nav-left">

        </div>

        <div className="nav-right">
          <Link to="/">首頁</Link>
          <Link to="/tools">自製小工具</Link>
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
          <Route path="/tools/xml" element={<XmlTool />} />
          <Route path="/tools/pdf-merge" element={<PdfMerge />} />
        </Routes>
      </div>
    </>
  );
};

export default App;

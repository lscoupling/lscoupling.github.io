import { Routes, Route, Link } from "react-router-dom";
import Resume from "./pages/Resume";
import Tools from "./pages/Tools";

const App = () => {
  return (
    <div>
      <nav style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
        <Link to="/" style={{ marginRight: "12px" }}>首頁</Link>
        <Link to="/tools">工具</Link>
      </nav>

      <div style={{ padding: "16px" }}>
        <Routes>
          <Route path="/" element={<Resume />} />
          <Route path="/tools" element={<Tools />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;

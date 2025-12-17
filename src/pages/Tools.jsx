import { Link } from "react-router-dom";

const Tools = () => {
  const tools = [
    { name: "天氣", path: "/tools/weather" },
    { name: "線上 Excel 檢視器", path: "/tools/xml" },
    { name: "PDF 合併器", path: "/tools/pdf-merge" },
    { name: "股票走勢動畫", path: "/tools/stock-chart" },
  ];

  return (
    <div className="tools-container">
      <h1>自製小工具</h1>

      <div className="tools-grid">
        {tools.map(t => (
          <Link key={t.path} className="tool-card" to={t.path}>
            {t.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Tools;

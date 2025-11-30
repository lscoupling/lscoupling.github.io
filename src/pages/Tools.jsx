import { Link } from "react-router-dom";

const Tools = () => {
  const tools = [
    { name: "XML → HTML Excel 表格", path: "/tools/xml" },
    { name: "PDF 合併器", path: "/tools/pdf-merge" },
    { name: "股票走勢動畫", path: "/tools/stock-chart" }
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

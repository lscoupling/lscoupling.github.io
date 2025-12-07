import avatar from "../assets/貫玄照片2025.jpg";

export default function Resume() {
  return (
    <main className="content">

      {/* Header / Avatar */}
      <section className="hero">
        <img src={avatar} alt="個人照片" className="avatar" />
        <div>
          <h1 className="name">饒貫玄</h1>
          <p className="tagline">軟體工程師｜物理碩士｜AI 與自動化整合</p>
        </div>
      </section>

      {/* Education */}
      <section className="card">
        <h2>學歷</h2>

        <ul className="timeline">
          <li>
            <div className="timeline-header">
              <span className="timeline-title">國立成功大學 物理系 碩士</span>
              <span className="timeline-time">2014 / 09 – 2016 / 08</span>
            </div>
            <div className="timeline-body">
              主修雷射物理與熱電材料，熟悉實驗設計與數據分析。
            </div>
          </li>

          <li>
            <div className="timeline-header">
              <span className="timeline-title">國立屏東教育大學 應用物理系 學士</span>
              <span className="timeline-time">2010 / 09 – 2014 / 07</span>
            </div>
            <div className="timeline-body">
              參與非線性光學研究並支援物理相關課程助教工作。
            </div>
          </li>
        </ul>
      </section>

      {/* Experience */}
      <section className="card">
        <h2>經歷</h2>

        <ul className="timeline">
          <li>
            <div className="timeline-header">
              <span className="timeline-title">
                雲端大師 AR 影像辨識教學 APP 開發推廣計畫
              </span>
              <span className="timeline-time">2022-09-01 ～ 2023-06-30</span>
            </div>
          </li>

          <li>
            <div className="timeline-header">
              <span className="timeline-title">
                2023 iThome 臺灣雲端大會活動
              </span>
              <span className="timeline-time">2023-03-23 ～ 2023-07-19</span>
            </div>
          </li>

          <li>
            <div className="timeline-header">
              <span className="timeline-title">
                桃園113年度 創新產業應用培育工作坊計畫
              </span>
              <span className="timeline-time">2024-08-02 ～ 2025-09-16</span>
            </div>
          </li>

          <li>
            <div className="timeline-header">
              <span className="timeline-title">
                桃園114年度 創新產業應用培育工作坊計畫
              </span>
              <span className="timeline-time">2025-07-07 ～ 2025-07-24</span>
            </div>
          </li>

          <li>
            <div className="timeline-header">
              <span className="timeline-title">
                深談 AWS 雲端上的 AI Agent
              </span>
              <span className="timeline-time">2024-11-01 ～ 2025-09-30</span>
            </div>
          </li>
        </ul>
      </section>


      {/* Skills */}
      <section className="card">
        <h2>技能專長</h2>

        <h3>AI 與自動化整合</h3>
        <ul className="pill-list">
          <li>LLM 工作流程設計</li>
          <li>AI 服務整合</li>
          <li>資料與文件自動化處理</li>
          <li>ChatGPT、Gemini、OpenAPI</li>
        </ul>

        <h3>雲端與 DevOps</h3>
        <ul className="pill-list">
          <li>AWS、GCP</li>
          <li>Docker、Kubernetes</li>
          <li>Terraform、Ansible</li>
          <li>API 串接與 Git 版本管理</li>
        </ul>

        <h3>前端 / Web</h3>
        <ul className="pill-list">
          <li>JavaScript、HTML、CSS</li>
          <li>Flutter 跨平台開發</li>
          <li>LINE Bot 開發</li>
        </ul>

        <h3>後端與資料處理</h3>
        <ul className="pill-list">
          <li>Python 程式開發</li>
          <li>MySQL、MariaDB</li>
          <li>Google Apps Script</li>
          <li>爬蟲、自動化排程</li>
        </ul>

        <h3>文件 / 多媒體</h3>
        <ul className="pill-list">
          <li>Excel、Word、PowerPoint</li>
          <li>Photoshop、Illustrator</li>
          <li>PDF 解析與製作</li>
        </ul>
      </section>

      {/* About me */}
      <section className="card">
        <h2>自我介紹</h2>

        <p>我是饒貫玄，專注於 AI 與自動化技術的軟體工程師。習慣先理解流程，再把重複與耗時的部分交給系統處理，讓系統可靠地替人做對的事。</p>

        <p>主要使用 Python 負責後端與資料處理，包含爬蟲、自動化排程、PDF/Excel 文件轉換；使用 Docker 打包部署，保持環境一致性；整合 Google Workspace 時以 Apps Script 實現表單、試算表與 API 協作。</p>

        <p>開發流程以真實使用情境為核心：先拆解操作，定義資料格式，再設計介面與權限，確保系統可維護、好 Debug。</p>

        <p>做過的項目包含行政流程自動化、資料工具、短網址與資料視覺化等，協助團隊少做重工、多做決策。</p>

        <p>目標很簡單：讓事情變得更快、更簡單、更可靠。</p>
      </section>

      <footer className="footer">© 2025 饒貫玄</footer>
    </main>
  );
}

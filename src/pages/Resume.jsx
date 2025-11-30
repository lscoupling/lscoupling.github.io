import profile from "../assets/貫玄照片2025.jpg";


const Resume = () => {

  return (
    <div className="page">
      <header className="hero">
        <img className="avatar" src={profile} alt="Profile" />
        <div>
          <h1 className="name">饒貫玄</h1>
          <p className="tagline">數學講師｜物理碩士｜希望職稱：軟體工程師</p>
          <p className="location">桃園市中壢區 · 在職中 · 可於錄取後一週到職</p>
        </div>
      </header>

      <main className="content">
        <section className="card">
          <h2>聯絡資訊</h2>
          <div className="grid grid-2">
            <div>
              <p><span className="label">手機號碼</span>0975-551-630</p>
              <p><span className="label">E-mail</span><a href="mailto:e0975551630@outlook.com">e0975551630@outlook.com</a></p>
              <p><span className="label">就業狀態</span>在職中（軟體工程師）</p>
            </div>
            <div>
              <p><span className="label">學歷</span>國立成功大學 物理系 碩士</p>
              <p><span className="label">語言</span>中文（精通）、英文（中等）、台語（精通）</p>
              <p><span className="label">求職意向</span>軟體工程師</p>
            </div>
          </div>
        </section>

        <section className="card">
          <h2>學歷</h2>
          <ul className="timeline">
            <li>
              <div className="timeline-header">
                <span className="timeline-title">國立成功大學 物理系 碩士</span>
                <span className="timeline-time">2014 / 09 – 2016 / 08</span>
              </div>
              <p className="timeline-body">
                主修雷射物理與熱電材料，熟悉實驗設計、數據分析與科學寫作。
              </p>
            </li>
            <li>
              <div className="timeline-header">
                <span className="timeline-title">國立屏東教育大學 應用物理系 學士</span>
                <span className="timeline-time">2010 / 09 – 2014 / 07</span>
              </div>
              <p className="timeline-body">
                參與非線性光學實驗室研究，並輔導學弟妹物理與數學課程。
              </p>
            </li>
          </ul>
        </section>

        <section className="card">
          <h2>工作經驗</h2>
          <ul className="timeline">
            <li>
              <div className="timeline-header">
                <span className="timeline-title">數學講師｜智恆文理補習班，高雄市橋頭區</span>
                <span className="timeline-time">2019 / 06 – 至今</span>
              </div>
              <p className="timeline-body">
                負責國高中數理課程教學，設計解題流程與學習講義，累積與學生及家長溝通協調經驗。
              </p>
            </li>
            <li>
              <div className="timeline-header">
                <span className="timeline-title">數學講師｜資優生文理補習班，高雄市路竹區</span>
                <span className="timeline-time">2018 / 09 – 2020 / 07</span>
              </div>
              <p className="timeline-body">
                授課國高中數學，依學生程度調整課程深度與進度，並協助升學考試規劃。
              </p>
            </li>
            <li>
              <div className="timeline-header">
                <span className="timeline-title">黃光製程工程師｜群創光電股份有限公司，台南市善化區</span>
                <span className="timeline-time">2017 / 06 – 2018 / 06</span>
              </div>
              <p className="timeline-body">
                參與黃光製程監控與良率改善，進行設備參數調整與製程條件優化，培養跨部門溝通與問題分析能力。
              </p>
            </li>
          </ul>
        </section>

        <section className="card">
          <h2>專長與技能</h2>
          <div className="grid grid-2">
            <div>
              <h3>專業技能</h3>
              <ul className="pill-list">
                <li>半導體製程與黃光製程基礎</li>
                <li>實驗設計與數據分析</li>
                <li>光電與熱電材料基礎</li>
                <li>問題拆解與邏輯推理</li>
              </ul>
            </div>
            <div>
              <h3>工具與軟體</h3>
              <ul className="pill-list">
                <li>Excel / PowerPoint / Word / Visio</li>
                <li>LabVIEW、Linux 基本操作</li>
                <li>中英文打字每分鐘 100–125 字</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="card">
          <h2>簡短自我介紹</h2>
          <p>
            我是饒貫玄，具物理碩士背景與黃光製程實務經驗，近年在補教業持續磨練溝通與教學表達能力。
            個性樂觀、細心，對新技術與製程充滿好奇，希望未來能在半導體產線或研發相關職務上，結合
            過去的研究訓練與現場經驗，為公司創造穩定且可持續優化的產能與品質。
          </p>
        </section>
      </main>

      <footer className="footer">
        <span>© {new Date().getFullYear()} 饒貫玄 · Resume</span>
      </footer>
    </div>
  )
}
export default Resume;

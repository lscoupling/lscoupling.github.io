import { Link } from "react-router-dom";

export default function GamesComingSoon() {
  return (
    <main className="content">
      <section className="card">
        <h2>敬請期待</h2>
        <p>小遊戲正在製作中，之後會陸續上線。</p>
        <p>
          <Link to="/games">回到小遊戲清單</Link>
        </p>
      </section>
    </main>
  );
}

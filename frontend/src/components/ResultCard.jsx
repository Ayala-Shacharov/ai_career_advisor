import Confetti from "./Confetti";

const RANK_ICONS = ["🥇", "🥈", "🥉"];

const ResultCard = ({ result, onRestart }) => (
  <div className="card result-card">
    <Confetti />
    <div className="result-icon">🌟</div>
    <p className="result-label">המקצועות המתאימים לך</p>
    <div className="professions-list">
      {result.map((p, i) => (
        <div key={i} className="profession-item">
          <div className="profession-header">
            <span className="profession-rank">{RANK_ICONS[i]}</span>
            <span className="profession-title">{p.title}</span>
            <span className="profession-percent">{p.matchPercent}%</span>
          </div>
          <div className="match-bar">
            <div className="match-fill" style={{ width: `${p.matchPercent}%` }} />
          </div>
          <p className="profession-reason">{p.reason}</p>
        </div>
      ))}
    </div>
    <button className="btn btn-restart" onClick={onRestart}>נסה שוב</button>
  </div>
);

export default ResultCard;
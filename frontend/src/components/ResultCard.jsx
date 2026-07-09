import { useEffect } from "react";
import Confetti from "./Confetti";

const RANK_ICONS = ["🥇", "🥈", "🥉"];

const SUCCESS_SOUND = "/success.mp3";

const ResultCard = ({ result, onRestart }) => {
  useEffect(() => {
    const audio = new Audio(SUCCESS_SOUND);
    audio.volume = 0.4;
    audio.play().catch(() => { });
  }, []);

  return (
    <div className="card result-card">
      <Confetti />

      <div className="result-header">
        <div className="result-icon"><span className="result-icon-inner">🌟</span></div>
        <p className="result-title-text">התוצאות שלך</p>
      </div>

      <div className="result-columns">
        {result.skills?.length > 0 && (
          <div className="result-col skills-col">
            <p className="col-label">הכישורים שלך</p>
            <div className="skills-card">
              {result.skills.map((s, i) => (
                <div key={i} className="skill-item">
                  <div className="skill-header">
                    <span className="skill-name">{s.name}</span>
                    <span className="skill-score">{Math.round(s.score * 100)}%</span>
                  </div>
                  <div className="match-bar">
                    <div className="match-fill" style={{ width: `${Math.round(s.score * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            {result.skillsSummary && (
              <div className="skills-summary-box">
                <p className="skills-summary-label">סיכום המיומנויות שלך</p>
                <p className="skills-summary">{result.skillsSummary}</p>
              </div>
            )}
          </div>
        )}

        <div className="result-divider" />

        <div className="result-col professions-col">
          <p className="col-label">המקצועות המתאימים לך</p>
          <div className="professions-list">
            {result.recommendations.map((p, i) => (
              <div key={i} className={`profession-item rank-${i}`}>
                <div className="profession-header">
                  <span className="profession-rank">{RANK_ICONS[i]}</span>
                  <span className="profession-title">{p.profession}</span>
                  <span className="profession-percent">{p.matchPercentage}%</span>
                </div>
                <div className="match-bar">
                  <div className="match-fill" style={{ width: `${p.matchPercentage}%` }} />
                </div>
                <p className="profession-reason">{p.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button className="btn btn-restart" onClick={onRestart}>✦ נסה שוב</button>
    </div>
  );
};

export default ResultCard;

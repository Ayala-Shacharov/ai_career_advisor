import Confetti from "./Confetti";

const ResultCard = ({ result, onRestart }) => (
  <div className="card result-card">
    <Confetti />
    <div className="result-icon">🌟</div>
    <p className="result-label">הקריירה המתאימה לך</p>
    <h2 className="result-title">{result}</h2>
    <button className="btn btn-restart" onClick={onRestart}>נסה שוב</button>
  </div>
);

export default ResultCard;
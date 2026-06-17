import Confetti from "./Confetti";

const ICONS = {
  "Software Engineer": "💻",
  "Certified Public Accountant": "📊",
  "Graphic Designer": "🎨",
  "Architect": "🏗️",
  "חוקר/ת העתיד": "🌍",
};

const HE = {
  "Software Engineer": "מהנדס/ת תוכנה",
  "Certified Public Accountant": "רואה/ת חשבון",
  "Graphic Designer": "מעצב/ת גרפי",
  "Architect": "אדריכל/ית",
  "חוקר/ת העתיד": "חוקר/ת העתיד",
};

const ResultCard = ({ result, onRestart }) => (
  <div className="card result-card">
    <Confetti />
    <div className="result-icon">{ICONS[result] ?? "🌟"}</div>
    <p className="result-label">הקריירה המתאימה לך</p>
    <h2 className="result-title">{result}</h2>
    <p className="result-title-he">{HE[result]}</p>
    <button className="btn btn-restart" onClick={onRestart}>נסה שוב</button>
  </div>
);

export default ResultCard;

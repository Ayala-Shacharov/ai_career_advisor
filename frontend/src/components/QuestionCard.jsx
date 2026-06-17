const QuestionCard = ({ question, index, total, onAnswer }) => (
  <div className="card">
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${((index) / total) * 100}%` }} />
    </div>
    <span className="step-label">שאלה {index + 1} מתוך {total}</span>
    <p className="question-text">{question.text}</p>
    <div className="btn-group">
      <button className="btn btn-yes" onClick={() => onAnswer(true)}>✓ כן</button>
      <button className="btn btn-no" onClick={() => onAnswer(false)}>✗ לא</button>
    </div>
  </div>
);

export default QuestionCard;

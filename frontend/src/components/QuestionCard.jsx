const QuestionCard = ({ question, index, total, onAnswer, loading, error }) => (
  <div className="card">
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${(index / total) * 100}%` }} />
    </div>
    <span className="step-label">שאלה {index + 1} מתוך {total}</span>
    <p className="question-text">{question.question}</p>
    <div className="options-group">
      {question.options.map((option, i) => (
        <button
          key={i}
          className="btn btn-option"
          onClick={() => onAnswer(option)}
          disabled={loading}
        >
          {option}
        </button>
      ))}
    </div>
    {error && <p className="inline-error">{error}</p>}
  </div>
);

export default QuestionCard;
const WaveSVG = () => (
  <svg className="wave-svg" viewBox="0 0 560 40" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#7c3aed" />
        <stop offset="50%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#7c3aed" />
      </linearGradient>
    </defs>
    <path
      d="M0,20 C40,5 80,35 120,20 C160,5 200,35 240,20 C280,5 320,35 360,20 C400,5 440,35 480,20 C520,5 560,35 560,20"
      fill="none"
      stroke="url(#waveGrad)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

const QuestionCard = ({ question, index, total, onAnswer, loading, loadingResult, error, isFollowUp }) => (
  <div className="card" style={{ minHeight: "480px" }}>
    {loadingResult ? (
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "space-between",
        padding: "clamp(24px, 6vh, 60px) 48px",
      }}>
        <WaveSVG />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <span className="spinner" style={{ width: "36px", height: "36px", borderWidth: "3px" }} />
          <span className="step-label" style={{ color: "#c4b5fd" }}>מנתח תשובות...</span>
        </div>
        <WaveSVG />
      </div>
    ) : (
      <>
        {isFollowUp && (
          <p className="step-label" style={{ marginBottom: "8px", color: "#06b6d4" }}>
            שאלות נוספות לצורך חידוד
          </p>
        )}
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>
        <span className="step-label">שאלה {index + 1} מתוך {total}</span>
        <p className="question-text">{question?.question}</p>
        <div className="options-group">
          {question?.options?.map((option, i) => (
            <button key={i} className="btn btn-option" onClick={() => onAnswer(option)} disabled={loading}>
              {option}
            </button>
          ))}
        </div>
        {error && <p className="inline-error">{error}</p>}
      </>
    )}
  </div>
);

export default QuestionCard;

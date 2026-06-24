import { useState } from "react";

const UserInputCard = ({ onSubmit, loading, error }) => {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) onSubmit(text.trim());
  };

  return (
    <div className="card input-card">
      <div className="input-card-header">
        <span className="input-card-emoji">🧭</span>
        <h1 className="input-card-title">יועץ הקריירה שלך</h1>
        <p className="input-card-subtitle">ספר/י לנו קצת על עצמך ונמצא את הקריירה המתאימה לך</p>
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <textarea
          className="input-textarea"
          placeholder="ספר/י לנו על עצמך..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          disabled={loading}
        />
        {error && <p className="inline-error">{error}</p>}
        <button
          type="submit"
          className="btn btn-submit"
          disabled={loading || !text.trim()}
        >
          {loading ? <span className="spinner" /> : "בואו נתחיל ←"}
        </button>
      </form>
    </div>
  );
};

export default UserInputCard;
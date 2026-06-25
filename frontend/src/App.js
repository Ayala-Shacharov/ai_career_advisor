import { useState } from "react";
import { fetchQuestions, fetchRecommendation } from "./services/api";
import UserInputCard from "./components/UserInputCard";
import QuestionCard from "./components/QuestionCard";
import ResultCard from "./components/ResultCard";
import "./index.css";

function App() {
  const [step, setStep] = useState("input");
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTextSubmit = async (text) => {
    setLoading(true);
    setError(null);
    try {
      const { sessionId: sid, questions: qs } = await fetchQuestions(text);
      setSessionId(sid);
      setQuestions(qs);
      setStep("questions");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answer) => {
    const newAnswers = [...answers, answer];

  if (newAnswers.length === questions.length) {
    setStep("loading");
    setError(null);
    try {
      const recommendation = await fetchRecommendation(sessionId, newAnswers);
      setAnswers(newAnswers);
      setResult(recommendation);
      setStep("result");
    } catch (e) {
      setAnswers(newAnswers.slice(0, -1));
      setError(e.message);
      setStep("questions");
    } finally {
      setLoading(false);
    }
  } else {
    setAnswers(newAnswers);
  }
};

  const handleRestart = () => {
    setStep("input");
    setSessionId(null);
    setQuestions([]);
    setAnswers([]);
    setResult(null);
    setError(null);
  };

  const current = answers.length;

  return (
    <div className="app">
      <div className="bg-orb orb1" />
      <div className="bg-orb orb2" />
      <div className="bg-orb orb3" />

      <header className="app-header">
        <span className="logo-dot" />
        יועץ קריירה
      </header>

      <main className="app-main">
        {step === "input" && (
          <UserInputCard
            onSubmit={handleTextSubmit}
            loading={loading}
            error={error}
          />
        )}
        {(step === "questions" || step === "loading") && (
          <QuestionCard
            key={current}
            question={questions[current]}
            index={current}
            total={questions.length}
            onAnswer={handleAnswer}
            loading={loading}
            loadingResult={step === "loading"}
            error={error}
          />
        )}
        {step === "result" && (
          <ResultCard result={result} onRestart={handleRestart} />
        )}
      </main>
    </div>
  );
}

export default App;
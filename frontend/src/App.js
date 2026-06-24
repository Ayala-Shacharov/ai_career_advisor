import { useState } from "react";
import { fetchQuestions, fetchRecommendation } from "./services/api";
import UserInputCard from "./components/UserInputCard";
import QuestionCard from "./components/QuestionCard";
import ResultCard from "./components/ResultCard";
import "./index.css";

function App() {
  const [step, setStep] = useState("input");
  const [userText, setUserText] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTextSubmit = async (text) => {
    setLoading(true);
    setError(null);
    try {
      const qs = await fetchQuestions(text);
      setUserText(text);
      setQuestions(qs);
      setStep("questions");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answer) => {
  const currentIndex = answers.length;
  const currentQuestion = questions[currentIndex];
  const newAnswers = [...answers, { question: currentQuestion.question, answer }];

  if (newAnswers.length === questions.length) {
    setStep("loading");
    setError(null);
    try {
      const profession = await fetchRecommendation(userText, newAnswers);
      setAnswers(newAnswers);
      setResult(profession);
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
    setUserText("");
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
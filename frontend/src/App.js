import { useState } from "react";
import questions from "./data/questions.json";
import calculateResult from "./logic/calculateResulte";
import QuestionCard from "./components/QuestionCard";
import ResultCard from "./components/ResultCard";
import "./index.css";

function App() {
  const [answers, setAnswers] = useState([]);

  const handleAnswer = (value) => setAnswers((prev) => [...prev, value]);
  const handleRestart = () => setAnswers([]);

  const current = answers.length;
  const done = current === questions.length;

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
        {!done ? (
          <QuestionCard
            key={current}
            question={questions[current]}
            index={current}
            total={questions.length}
            onAnswer={handleAnswer}
          />
        ) : (
          <ResultCard
            result={calculateResult(questions, answers)}
            onRestart={handleRestart}
          />
        )}
      </main>
    </div>
  );
}

export default App;

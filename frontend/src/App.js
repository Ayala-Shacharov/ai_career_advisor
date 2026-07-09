// import { useState } from "react";
// import { fetchQuestions, fetchRecommendation } from "./services/api";
// import UserInputCard from "./components/UserInputCard";
// import QuestionCard from "./components/QuestionCard";
// import ResultCard from "./components/ResultCard";
// import "./index.css";

// function App() {
//   const [step, setStep] = useState("input");
//   const [sessionId, setSessionId] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [answers, setAnswers] = useState([]);
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [isFollowUp, setIsFollowUp] = useState(false);

//   const handleTextSubmit = async (text) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const { sessionId: sid, questions: qs } = await fetchQuestions(text);
//       setSessionId(sid);
//       setQuestions(qs);
//       setAnswers([]);
//       setStep("questions");
//     } catch (e) {
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAnswer = async (answer) => {
//     const newAnswers = [...answers, answer];

//     if (newAnswers.length === questions.length) {
//       setStep("loading");
//       setError(null);
//       try {
//         const data = await fetchRecommendation(sessionId, newAnswers);

//         if (data.needsMoreInfo) {
//           setQuestions(data.qa);
//           setAnswers([]);
//           setStep("questions");
//           setIsFollowUp(true);
//         } else {
//           setAnswers(newAnswers);
//           setResult(data);
//           setStep("result");
//         }
//       } catch (e) {
//         setAnswers(newAnswers.slice(0, -1));
//         setError(e.message);
//         setStep("questions");
//       } finally {
//         setLoading(false);
//       }
//     } else {
//       setAnswers(newAnswers);
//     }
//   };

//   const handleRestart = () => {
//     setStep("input");
//     setSessionId(null);
//     setQuestions([]);
//     setAnswers([]);
//     setResult(null);
//     setError(null);
//     setIsFollowUp(false);
//   };

//   const current = answers.length;

//   return (
//     <div className="app">
//       <div className="bg-orb orb1" />
//       <div className="bg-orb orb2" />
//       <div className="bg-orb orb3" />

//       <header className="app-header">
//         <span className="logo-dot" />
//         יועץ קריירה
//       </header>

//       <main className="app-main">
//         {step === "input" && (
//           <UserInputCard
//             onSubmit={handleTextSubmit}
//             loading={loading}
//             error={error}
//           />
//         )}
//         {(step === "questions" || step === "loading") && (
//           <QuestionCard
//             key={current}
//             question={questions[current]}
//             index={current}
//             total={questions.length}
//             onAnswer={handleAnswer}
//             loading={loading}
//             loadingResult={step === "loading"}
//             error={error}
//             isFollowUp={isFollowUp}
//           />
//         )}
//         {step === "result" && (
//           <ResultCard result={result} onRestart={handleRestart} />
//         )}
//       </main>
//     </div>
//   );
// }

// export default App;
import { useState } from "react";
import { fetchQuestions, fetchRecommendation } from "./services/api";
import UserInputCard from "./components/UserInputCard";
import QuestionCard from "./components/QuestionCard";
import ResultCard from "./components/ResultCard";
import "./index.css";

const DEMO_RESULT = {
  skillsSummary: "האדם מפגין שילוב של יכולות פיתוח טכנולוגי, יצירתיות בכתיבה, וגישה אנליטית להבנת מבנים מורכבים.",
  skills: [
    { "name": "פיתוח טכנולוגי", "score": 0.9 },
    { "name": "כתיבה יצירתית", "score": 0.85 },
    { "name": "ניתוח והבנה מבנית", "score": 0.75 },
    { "name": "יצירתיות ופיתוח תוכן", "score": 0.7 },
    { "name": "חשיבה אנליטית", "score": 0.7 },
  ],
  recommendations: [
    { profession: "מעצב/ת חווית משתמש וממשק (UX/UI)", matchPercentage: 95, reason: "תפקיד זה מתאים באופן מושלם לרצונה להתמקד בפיתוח Front-end, ממשקי משתמש וחווית משתמש, ומשלב את כישורי הפיתוח הטכנולוגי הגבוהים שלה (0.9) עם הצורך בביטוי יצירתי בעיצוב, כפי שצוין כהיבט המספק ביותר." },
    { profession: "מפתח/ת Front-end", matchPercentage: 90, reason: "תפקיד זה מתאים לרצונה להתמקד בפיתוח Front-end, עם דגש על שימוש בטכנולוגיות מודרניות ויצירת חווית משתמש טובה." },
    { profession: "מנהל/ת מוצר", matchPercentage: 85, reason: "משלב הבנה טכנית עם יצירת חזון למוצר וביטוי אישי דרך הגדרת חווית משתמש, תוך עבודה בתעשיית הטכנולוגיה." },
  ],
};


function App() {
  const [step, setStep] = useState("input");
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleTextSubmit = async (text) => {
    setLoading(true);
    setError(null);
    try {
      const { sessionId: sid, questions: qs } = await fetchQuestions(text);
      setSessionId(sid);
      setQuestions(qs);
      setAnswers([]);
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
      await new Promise(resolve => setTimeout(resolve, 0));
      try {
        const data = await fetchRecommendation(sessionId, newAnswers);

        if (data.needsMoreInfo) {
          setQuestions(data.qa);
          setAnswers([]);
          setStep("questions");
          setIsFollowUp(true);
        } else {
          setAnswers(newAnswers);
          setResult(data);
          setStep("result");
        }
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
    setIsFollowUp(false);
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
        <button className="btn btn-preview" onClick={() => setPreviewMode(p => !p)}>
          {previewMode ? "✕ סגור תצוגה" : "👁 תצוגה מקדימה"}
        </button>
      </header>

      <main className="app-main">
        {previewMode ? (
          <ResultCard result={DEMO_RESULT} onRestart={() => setPreviewMode(false)} />
        ) : (
          <>
            {step === "input" && (
              <UserInputCard onSubmit={handleTextSubmit} loading={loading} error={error} />
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
                isFollowUp={isFollowUp}
              />
            )}
            {step === "result" && (
              <ResultCard result={result} onRestart={handleRestart} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;

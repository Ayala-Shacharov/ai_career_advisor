const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const OVERLOAD_MSG = "המערכת עמוסה כרגע, נסה/י שוב בעוד כמה שניות. אם הבעיה נמשכת, אנא פנה/י לתמיכה.";

const handleResponse = async (res) => {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = (data?.message || "").toLowerCase();
    if (msg.includes("unable") || msg.includes("unavailable") || res.status === 503)
      throw new Error(OVERLOAD_MSG);
    throw new Error("אירעה שגיאה, נסה/י שוב");
  }
  return res.json();
};

export const fetchQuestions = async (text) => {
  const res = await fetch(`${BASE_URL}/questions/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const data = await handleResponse(res);
  return { sessionId: data.sessionId, questions: data.qa };
};

export const fetchRecommendation = async (sessionId, answers) => {
  const res = await fetch(`${BASE_URL}/profession/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, answers }),
  });
  const data = await handleResponse(res);
  // Returns { needsMoreInfo, qa } or { needsMoreInfo: false, recommendation }
  return data;
};

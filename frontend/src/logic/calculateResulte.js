const calculateResult = (questions, answers) => {
  const scores = {};

  questions.forEach((q, i) => {
    if (answers[i]) {
      Object.entries(q.weights).forEach(([profession, score]) => {
        scores[profession] = (scores[profession] || 0) + score;
      });
    }
  });

  return Object.entries(scores).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "חוקר/ת העתיד";
};

export default calculateResult;

# Career Advisor – Project Context

## General Architecture

A React SPA (Single Page Application) that walks the user through a series of Yes/No questions and recommends a career based on weighted scoring. No backend – everything runs client-side.

**Flow:**
`questions.json` → `App.js` (state) → `QuestionCard` (one at a time) → `calculateResult` → `ResultCard`

---

## Technologies

| Tech | Version | Purpose |
|---|---|---|
| React | ^19 | UI framework |
| react-scripts (CRA) | 5.0.1 | Build tooling |
| Plain CSS | – | Styling |
| JSON | – | Data source |

No external UI library, no router, no state manager.

---

## File Structure

```
career-advisor/
├── public/
│   └── index.html            # HTML shell
├── src/
│   ├── components/
│   │   ├── QuestionCard.jsx  # Renders a single question with Yes/No buttons + progress bar
│   │   └── ResultCard.jsx    # Displays the final career result with icon
│   ├── data/
│   │   └── questions.json    # Array of question objects with weighted scores per career
│   ├── logic/
│   │   └── calculateResulte.js  # Pure function – scores answers and returns top career
│   ├── App.js                # Root component – manages answers state and routing between views
│   ├── index.js              # React entry point
│   └── index.css             # All styling
└── package.json
```

---

## Key Logic

### `questions.json` – Question schema
```json
{
  "id": 1,
  "text": "Do you enjoy solving complex logical problems?",
  "weights": {
    "Software Engineer": 3,
    "Data Scientist": 3,
    "UX Designer": 1,
    "Product Manager": 2
  }
}
```

### `calculateResult(questions, answers)` – `src/logic/calculateResulte.js`
- Iterates all questions; if `answers[i] === true`, adds that question's weights to a scores map
- Returns the profession with the highest total score
- Falls back to `"Explorer"` if no answers were given

### Supported career results
`Software Engineer` | `Data Scientist` | `UX Designer` | `Product Manager` | `Explorer`

---

## API Endpoints

No API. The project is fully client-side with no network calls.

---

## State Management (App.js)

| State | Type | Description |
|---|---|---|
| `answers` | `boolean[]` | Accumulated Yes/No answers |

- `handleAnswer(value)` – appends answer and advances to next question
- `handleRestart()` – resets answers to `[]`
- When `answers.length === questions.length` → shows `ResultCard`

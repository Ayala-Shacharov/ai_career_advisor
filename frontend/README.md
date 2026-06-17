# 📌 Career Recommendation System

## 📖 Project Description

This project is a simple interactive career recommendation web application.

The system presents the user with 4 yes/no questions designed to evaluate their interests and strengths.

Each answer contributes to a weighted scoring system that matches the user to suitable professions.

---

## ⚙️ How It Works

- The user starts the app and receives 4 questions.
- Each question has a **Yes / No** answer option.
- A “Yes” answer adds weighted points to different professions.
- A “No” answer does not affect the score.

After answering all questions:

- The system calculates total scores per profession.
- The profession with the highest score is displayed as the recommendation.

---

## 🧠 Scoring Logic Example

**Question:** Do you enjoy solving complex problems?

**Weights:**
- Software Developer → 7
- Systems Analyst → 5
- Graphic Designer → 3

If the user answers **Yes**, these points are added to the relevant professions.  
If the user answers **No**, no points are added.

---

## 🎯 Purpose of the Project

This project demonstrates:

- Basic recommendation logic
- Weighted scoring system
- Simple user interaction flow
- Mapping user preferences to career options

---

## 🚀 Future Improvements

- AI-generated personalized questions
- Smarter recommendation model instead of fixed weights
- More answer types beyond Yes/No
- Explanations for recommended careers

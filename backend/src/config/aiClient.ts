import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const baseURL = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1';
const apiKey = process.env.GROQ_API_KEY;

export const aiClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
  },
});

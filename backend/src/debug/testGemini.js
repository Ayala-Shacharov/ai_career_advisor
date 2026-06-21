import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? '' });
async function run() {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'תגיד שלום במשפט אחד',
    });
    console.log(response.text);
}
run();
//# sourceMappingURL=testGemini.js.map
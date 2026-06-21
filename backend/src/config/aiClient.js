// // import dotenv from 'dotenv';
// // dotenv.config();
// const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
// const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
// if (!apiKey) {
//   throw new Error("Missing GEMINI_API_KEY");
// }
// console.log('Gemini config check:', {
//   hasApiKey: Boolean(apiKey),
//   model,
// });
// export const geminiConfig = {
//   apiKey,
//   model,
// };
export const getGeminiConfig = () => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const model = process.env.GEMINI_MODEL || 'GEMINI_MODEL=gemini-1.5-flash-latest';
    if (!apiKey) {
        throw new Error('Missing GEMINI_API_KEY');
    }
    return {
        apiKey,
        model,
    };
};
//# sourceMappingURL=aiClient.js.map
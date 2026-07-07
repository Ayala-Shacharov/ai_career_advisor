import express from 'express';
import cors from 'cors';
import aiRoutes from './routes/ai.routes.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:3000' }));
app.use(express.json());
app.use('/api', aiRoutes);

export default app;

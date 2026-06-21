import express from 'express';
import cors from 'cors';
import aiRoutes from './routes/ai.routes.js';
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', aiRoutes);
export default app;
//# sourceMappingURL=app.js.map
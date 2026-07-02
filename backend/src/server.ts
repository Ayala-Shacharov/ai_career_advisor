import 'dotenv/config';
import app from './app.js';
import { cleanOldSessions } from './db/db.service.js';

const PORT = process.env.PORT || 5000;

await cleanOldSessions();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

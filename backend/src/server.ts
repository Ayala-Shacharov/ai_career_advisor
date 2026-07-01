import 'dotenv/config';
import app from './app.js';
import { clearDb } from './db/db.service.js';

const PORT = process.env.PORT || 5000;

await clearDb();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

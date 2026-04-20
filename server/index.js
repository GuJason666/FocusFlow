require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');
const { startReminderJob } = require('./jobs/reminderJob');

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  startReminderJob();
});

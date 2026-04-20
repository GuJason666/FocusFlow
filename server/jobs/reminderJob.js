const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const { sendReminderEmail } = require('../services/emailService');

function startReminderJob() {
  // Runs every minute
  cron.schedule('* * * * *', async () => {
    if (!process.env.RESEND_API_KEY) return;
    try {
      const now = new Date();
      const cutoff = new Date(now.getTime() - 24 * 3600 * 1000); // ignore tasks > 24h past

      const tasks = await Task.find({
        reminderHours: { $ne: null },
        reminderSent: false,
        completed: false,
        startTime: { $gt: cutoff },
      }).populate('owner', 'name email');

      for (const task of tasks) {
        const reminderTime = new Date(task.startTime.getTime() - (task.reminderHours ?? 0) * 3600 * 1000);
        if (now >= reminderTime) {
          await sendReminderEmail(task.owner.email, task.owner.name, task);
          task.reminderSent = true;
          await task.save();
        }
      }
    } catch (err) {
      console.error('Reminder job error:', err.message);
    }
  });

  console.log('Reminder job started');
}

module.exports = { startReminderJob };

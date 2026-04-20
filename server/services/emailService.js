const { Resend } = require('resend');
const { format } = require('date-fns');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendReminderEmail(to, name, task) {
  const start = format(new Date(task.startTime), 'EEEE, MMM d yyyy h:mm a');
  const end = format(new Date(task.endTime), 'h:mm a');
  const hoursWord = task.reminderHours === 1 ? '1 hour' : `${task.reminderHours} hours`;

  await resend.emails.send({
    from: 'FocusFlow <onboarding@resend.dev>',
    to,
    subject: `Reminder: "${task.title}" starts in ${hoursWord}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#2563EB">FocusFlow Reminder</h2>
        <p>Hi ${name},</p>
        <p>Your scheduled task is coming up in <strong>${hoursWord}</strong>:</p>
        <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:0 0 8px 0"><strong>${task.title}</strong></p>
          <p style="margin:0;color:#6b7280">🕐 ${start} – ${end}</p>
          ${task.description ? `<p style="margin:8px 0 0 0;color:#6b7280">${task.description}</p>` : ''}
        </div>
        <p style="color:#9ca3af;font-size:12px">You're receiving this because you enabled reminders for this task in FocusFlow.</p>
      </div>
    `,
  });
}

module.exports = { sendReminderEmail };

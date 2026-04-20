const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    courseCode:   { type: String, required: true, trim: true },
    courseName:   { type: String, required: true, trim: true },
    termStart:    { type: Date, required: true },
    termEnd:      { type: Date, required: true },
    owner:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    schedule:     [{ dayOfWeek: Number, period: String, _id: false }],
    reminderHours: { type: Number, default: null },
  },
  { timestamps: true }
);

courseSchema.index({ owner: 1, termStart: 1 });

module.exports = mongoose.model('Course', courseSchema);

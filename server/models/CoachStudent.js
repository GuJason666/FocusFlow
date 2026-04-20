const mongoose = require('mongoose');

const coachStudentSchema = new mongoose.Schema(
  {
    coach:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

coachStudentSchema.index({ coach: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('CoachStudent', coachStudentSchema);

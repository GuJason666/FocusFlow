const mongoose = require('mongoose');

const recurringSchema = new mongoose.Schema(
  {
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
    endDate: { type: Date },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    recurring: { type: recurringSchema },
    isRecurringTemplate: { type: Boolean, default: false },
    recurringTemplateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    occurrenceDate: { type: Date },
    convertedFromTodo: { type: mongoose.Schema.Types.ObjectId, ref: 'Todo' },
  },
  { timestamps: true }
);

taskSchema.index({ owner: 1, startTime: 1 });
taskSchema.index({ assignedTo: 1, startTime: 1 });
taskSchema.index({ recurringTemplateId: 1, occurrenceDate: 1 });

module.exports = mongoose.model('Task', taskSchema);

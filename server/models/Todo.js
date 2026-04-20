const mongoose = require('mongoose');

const recurringSchema = new mongoose.Schema(
  {
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
    endDate: { type: Date },
  },
  { _id: false }
);

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    deadline: { type: Date },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    recurring: { type: recurringSchema },
    isRecurringTemplate: { type: Boolean, default: false },
    recurringTemplateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Todo' },
    occurrenceDate: { type: Date },
    category: { type: String, enum: ['Academic', 'Wellness', 'Social', 'Career', 'Other'], default: 'Other' },
    convertedToTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    weekOf: { type: Date },
    assignedBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sourceCoachTodoId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Todo' },
    assignedToStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

todoSchema.index({ owner: 1, deadline: 1 });
todoSchema.index({ assignedTo: 1, deadline: 1 });
todoSchema.index({ owner: 1, weekOf: 1 });

module.exports = mongoose.model('Todo', todoSchema);

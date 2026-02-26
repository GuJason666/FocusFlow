const express = require('express');
const {
  eachDayOfInterval,
  addWeeks,
  addMonths,
  isWithinInterval,
  startOfDay,
  parseISO,
} = require('date-fns');
const Task = require('../models/Task');
const Project = require('../models/Project');
const verifyToken = require('../middleware/auth');

const router = express.Router();

function computeOccurrences(template, start, end) {
  const occurrences = [];
  const { frequency, endDate } = template.recurring;
  const templateStart = new Date(template.startTime);
  const rangeStart = new Date(start);
  const rangeEnd = new Date(end);
  const recurEnd = endDate ? new Date(endDate) : new Date(rangeEnd);

  let current = new Date(templateStart);
  while (current <= rangeEnd && current <= recurEnd) {
    if (current >= rangeStart) {
      occurrences.push(new Date(current));
    }
    if (frequency === 'daily') {
      current = new Date(current.getTime() + 86400000);
    } else if (frequency === 'weekly') {
      current = addWeeks(current, 1);
    } else if (frequency === 'monthly') {
      current = addMonths(current, 1);
    } else {
      break;
    }
  }
  return occurrences;
}

// GET /api/tasks?start=&end=
router.get('/', verifyToken, async (req, res) => {
  try {
    const { start, end, projectId } = req.query;
    const userId = req.user._id;

    if (projectId) {
      const tasks = await Task.find({ project: projectId })
        .populate('owner', 'name email')
        .populate('assignedTo', 'name email');
      return res.json(tasks);
    }

    if (!start || !end) {
      return res.status(400).json({ error: 'start and end query params required' });
    }

    const rangeStart = new Date(start);
    const rangeEnd = new Date(end);

    // Concrete non-template tasks in range
    const concreteTasks = await Task.find({
      $or: [{ owner: userId }, { assignedTo: userId }],
      isRecurringTemplate: { $ne: true },
      recurringTemplateId: { $exists: false },
      startTime: { $gte: rangeStart, $lte: rangeEnd },
    })
      .populate('owner', 'name email')
      .populate('assignedTo', 'name email');

    // Recurring instances already materialized
    const materializedInstances = await Task.find({
      $or: [{ owner: userId }, { assignedTo: userId }],
      recurringTemplateId: { $exists: true },
      startTime: { $gte: rangeStart, $lte: rangeEnd },
    })
      .populate('owner', 'name email')
      .populate('assignedTo', 'name email');

    // Recurring templates that could produce occurrences in range
    const templates = await Task.find({
      $or: [{ owner: userId }, { assignedTo: userId }],
      isRecurringTemplate: true,
    });

    const virtualTasks = [];
    for (const template of templates) {
      if (!template.recurring?.frequency) continue;
      const occurrences = computeOccurrences(template, rangeStart, rangeEnd);
      for (const occDate of occurrences) {
        const existing = materializedInstances.find(
          (t) =>
            t.recurringTemplateId?.toString() === template._id.toString() &&
            startOfDay(new Date(t.occurrenceDate || t.startTime)).getTime() ===
              startOfDay(occDate).getTime()
        );
        if (!existing) {
          const duration = new Date(template.endTime) - new Date(template.startTime);
          virtualTasks.push({
            _id: `virtual_${template._id}_${occDate.getTime()}`,
            _virtual: true,
            title: template.title,
            description: template.description,
            startTime: new Date(occDate),
            endTime: new Date(occDate.getTime() + duration),
            owner: template.owner,
            assignedTo: template.assignedTo,
            project: template.project,
            completed: false,
            recurring: template.recurring,
            isRecurringTemplate: false,
            recurringTemplateId: template._id,
            occurrenceDate: occDate,
          });
        }
      }
    }

    res.json([...concreteTasks, ...materializedInstances, ...virtualTasks]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tasks/project/:projectId
router.get('/project/:projectId', verifyToken, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('owner', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ startTime: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, startTime, endTime, assignedTo, project, recurring } = req.body;
    if (!title || !startTime || !endTime)
      return res.status(400).json({ error: 'title, startTime, endTime required' });

    const isRecurringTemplate = !!(recurring?.frequency);
    const task = await Task.create({
      title, description, startTime, endTime,
      owner: req.user._id,
      assignedTo: assignedTo || req.user._id,
      project,
      recurring,
      isRecurringTemplate,
    });
    await task.populate('owner', 'name email');
    await task.populate('assignedTo', 'name email');
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tasks/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('assignedTo', 'name email');
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tasks/:id
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, description, startTime, endTime, assignedTo, project, recurring, updateScope } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (updateScope === 'this' && task.isRecurringTemplate) {
      // Materialize a single instance
      const instance = await Task.create({
        title: title || task.title,
        description: description || task.description,
        startTime: startTime || task.startTime,
        endTime: endTime || task.endTime,
        owner: task.owner,
        assignedTo: assignedTo || task.assignedTo,
        project: task.project,
        recurringTemplateId: task._id,
        occurrenceDate: startTime || task.startTime,
      });
      return res.json(instance);
    }

    Object.assign(task, { title, description, startTime, endTime, assignedTo, project, recurring });
    if (recurring?.frequency) task.isRecurringTemplate = true;
    await task.save();
    await task.populate('owner', 'name email');
    await task.populate('assignedTo', 'name email');
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tasks/:id/complete
router.patch('/:id/complete', verifyToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : undefined;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

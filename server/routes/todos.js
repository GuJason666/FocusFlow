const express = require('express');
const Todo = require('../models/Todo');
const Task = require('../models/Task');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// GET /api/todos
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { projectId } = req.query;
    const query = {
      $or: [{ owner: userId }, { assignedTo: userId }],
      convertedToTaskId: { $exists: false },
    };
    if (projectId) query.project = projectId;
    const todos = await Todo.find(query)
      .populate('owner', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ deadline: 1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/todos
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, deadline, assignedTo, project, recurring } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });
    const isRecurringTemplate = !!(recurring?.frequency);
    const todo = await Todo.create({
      title, description, deadline,
      owner: req.user._id,
      assignedTo: assignedTo || req.user._id,
      project,
      recurring,
      isRecurringTemplate,
    });
    await todo.populate('owner', 'name email');
    await todo.populate('assignedTo', 'name email');
    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/todos/:id
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    const { title, description, deadline, assignedTo, project, recurring } = req.body;
    Object.assign(todo, { title, description, deadline, assignedTo, project, recurring });
    await todo.save();
    await todo.populate('owner', 'name email');
    await todo.populate('assignedTo', 'name email');
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/todos/:id/complete
router.patch('/:id/complete', verifyToken, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    todo.completed = !todo.completed;
    todo.completedAt = todo.completed ? new Date() : undefined;
    await todo.save();
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/todos/:id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    await todo.deleteOne();
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/todos/:id/convert
router.post('/:id/convert', verifyToken, async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    if (!startTime || !endTime)
      return res.status(400).json({ error: 'startTime and endTime required' });

    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    if (todo.convertedToTaskId)
      return res.status(409).json({ error: 'Todo already converted' });

    const task = await Task.create({
      title: todo.title,
      description: todo.description,
      startTime,
      endTime,
      owner: todo.owner,
      assignedTo: todo.assignedTo || todo.owner,
      project: todo.project,
      convertedFromTodo: todo._id,
    });

    todo.convertedToTaskId = task._id;
    await todo.save();

    await task.populate('owner', 'name email');
    await task.populate('assignedTo', 'name email');
    res.status(201).json({ task, todo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

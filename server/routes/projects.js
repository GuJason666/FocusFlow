const express = require('express');
const Project = require('../models/Project');
const Milestone = require('../models/Milestone');
const Task = require('../models/Task');
const Todo = require('../models/Todo');
const User = require('../models/User');
const verifyToken = require('../middleware/auth');

const router = express.Router();

const isCoachOwner = (project, userId) =>
  project.coach.toString() === userId.toString();

const isMember = (project, userId) =>
  project.coach.toString() === userId.toString() ||
  project.members.some((m) => m.toString() === userId.toString());

// GET /api/projects
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const projects = await Project.find({
      $or: [{ coach: userId }, { members: userId }],
    }).populate('coach', 'name email').populate('members', 'name email');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, goal, deadline } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });
    const project = await Project.create({
      title, description, goal, deadline,
      coach: req.user._id,
      members: [],
    });
    await project.populate('coach', 'name email');
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('coach', 'name email')
      .populate('members', 'name email');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (!isMember(project, req.user._id))
      return res.status(403).json({ error: 'Forbidden' });
    const milestones = await Milestone.find({ project: project._id });
    res.json({ ...project.toJSON(), milestones });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Schedule settings ────────────────────────────────────────────────────────
// Returns the scheduling window for a user. Currently uses hardcoded defaults;
// replace the body with a user-prefs DB lookup to make this user-configurable.
function getScheduleSettings(/* user */) {
  return {
    wakeupHour: 8,   // 8:00 AM — earliest a generated task may start
    bedtimeHour: 22, // 10:00 PM — latest a generated task may end
  };
}

function slotsOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

// Finds the earliest available slot of `durationMs` on `dayDate`, starting at
// or after `desiredStartH:desiredStartM`, within the wakeup–bedtime window and
// not overlapping any interval in `busyIntervals` ({ start: Date, end: Date }[]).
// Returns { start, end } or null if the day is fully booked.
function findSlot(dayDate, desiredStartH, desiredStartM, durationMs, settings, busyIntervals) {
  const { wakeupHour, bedtimeHour } = settings;

  const wakeup = new Date(dayDate);
  wakeup.setHours(wakeupHour, 0, 0, 0);

  const bedtime = new Date(dayDate);
  bedtime.setHours(bedtimeHour, 0, 0, 0);

  let slotStart = new Date(dayDate);
  slotStart.setHours(desiredStartH, desiredStartM, 0, 0);
  if (slotStart < wakeup) slotStart = new Date(wakeup);

  while (true) {
    const slotEnd = new Date(slotStart.getTime() + durationMs);
    if (slotEnd > bedtime) return null; // no room left today

    const conflict = busyIntervals.find((iv) =>
      slotsOverlap(slotStart, slotEnd, iv.start, iv.end)
    );
    if (!conflict) return { start: new Date(slotStart), end: slotEnd };

    // Advance past the blocking interval and try again
    slotStart = new Date(conflict.end);
  }
}
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/projects/:id/generate-tasks
router.post('/:id/generate-tasks', verifyToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (!isMember(project, req.user._id))
      return res.status(403).json({ error: 'Forbidden' });

    const { templates } = req.body;
    if (!Array.isArray(templates) || templates.length === 0)
      return res.status(400).json({ error: 'templates array required' });

    const settings = getScheduleSettings(req.user);

    // Determine the overall date range across all templates for a single DB query
    let overallStart = null;
    let overallEnd = null;
    for (const tpl of templates) {
      if (!tpl.rangeStart || !tpl.rangeEnd) continue;
      const rStart = new Date(tpl.rangeStart);
      const rEnd = new Date(tpl.rangeEnd);
      if (!overallStart || rStart < overallStart) overallStart = rStart;
      if (!overallEnd || rEnd > overallEnd) overallEnd = rEnd;
    }

    if (!overallStart || !overallEnd)
      return res.json({ tasks: [], conflicts: [], conflictCount: 0, skippedCount: 0 });

    // Fetch existing tasks and todos in the range once before scheduling
    const [existingTasks, existingTodos] = await Promise.all([
      Task.find({
        owner: req.user._id,
        isRecurringTemplate: { $ne: true },
        startTime: { $lt: overallEnd },
        endTime: { $gt: overallStart },
      }),
      Todo.find({
        owner: req.user._id,
        isRecurringTemplate: { $ne: true },
        deadline: { $gte: overallStart, $lte: overallEnd },
        completed: false,
      }),
    ]);

    // Build a mutable busy-intervals list.
    // Tasks have a full time range; todos have only a deadline (point in time),
    // so we treat each todo deadline as a 1-minute block to detect overlap.
    const busyIntervals = [
      ...existingTasks.map((t) => ({ start: t.startTime, end: t.endTime })),
      ...existingTodos
        .filter((t) => t.deadline)
        .map((t) => ({ start: t.deadline, end: new Date(t.deadline.getTime() + 60_000) })),
    ];

    const tasksToInsert = [];
    let skippedCount = 0;

    for (const tpl of templates) {
      const { title, description, daysOfWeek, startTime, endTime, rangeStart, rangeEnd } = tpl;
      if (!title || !Array.isArray(daysOfWeek) || !rangeStart || !rangeEnd) continue;

      const [startH, startM] = (startTime || '09:00').split(':').map(Number);
      const [endH, endM]     = (endTime   || '10:00').split(':').map(Number);

      const durationMs = ((endH * 60 + endM) - (startH * 60 + startM)) * 60 * 1000;
      if (durationMs <= 0) continue;

      const rStart = new Date(rangeStart);
      const rEnd   = new Date(rangeEnd);

      const current = new Date(rStart);
      current.setHours(0, 0, 0, 0);

      while (current <= rEnd) {
        if (daysOfWeek.includes(current.getDay())) {
          const slot = findSlot(current, startH, startM, durationMs, settings, busyIntervals);
          if (slot) {
            tasksToInsert.push({
              title,
              description: description || '',
              startTime: slot.start,
              endTime: slot.end,
              owner: req.user._id,
              project: project._id,
              completed: false,
              isRecurringTemplate: false,
            });
            // Mark the new slot busy so later templates respect it too
            busyIntervals.push({ start: slot.start, end: slot.end });
          } else {
            skippedCount++;
          }
        }
        current.setDate(current.getDate() + 1);
      }
    }

    if (tasksToInsert.length === 0)
      return res.json({ tasks: [], conflicts: [], conflictCount: 0, skippedCount });

    const created = await Task.insertMany(tasksToInsert);
    res.status(201).json({ tasks: created, conflicts: [], conflictCount: 0, skippedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/projects/:id
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (!isCoachOwner(project, req.user._id))
      return res.status(403).json({ error: 'Forbidden' });
    const { title, description, goal, deadline } = req.body;
    Object.assign(project, { title, description, goal, deadline });
    await project.save();
    await project.populate('coach', 'name email');
    await project.populate('members', 'name email');
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (!isCoachOwner(project, req.user._id))
      return res.status(403).json({ error: 'Forbidden' });
    await Milestone.deleteMany({ project: project._id });
    await Task.deleteMany({ project: project._id });
    await Todo.deleteMany({ project: project._id });
    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/members
router.post('/:id/members', verifyToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (!isCoachOwner(project, req.user._id))
      return res.status(403).json({ error: 'Forbidden' });
    const { email } = req.body;
    const student = await User.findOne({ email: email?.toLowerCase() });
    if (!student) return res.status(404).json({ error: 'User not found' });
    if (project.members.some((m) => m.toString() === student._id.toString()))
      return res.status(409).json({ error: 'Already a member' });
    project.members.push(student._id);
    await project.save();
    await project.populate('coach', 'name email');
    await project.populate('members', 'name email');
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/projects/:id/members/:userId
router.delete('/:id/members/:userId', verifyToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (!isCoachOwner(project, req.user._id))
      return res.status(403).json({ error: 'Forbidden' });
    project.members = project.members.filter(
      (m) => m.toString() !== req.params.userId
    );
    await project.save();
    await project.populate('coach', 'name email');
    await project.populate('members', 'name email');
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

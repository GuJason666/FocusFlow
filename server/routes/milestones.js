const express = require('express');
const Milestone = require('../models/Milestone');
const Project = require('../models/Project');
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

const isMember = (project, userId) =>
  project.coach.toString() === userId.toString() ||
  project.members.some((m) => m.toString() === userId.toString());

// GET /api/milestones?projectId=
router.get('/', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ error: 'projectId required' });
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (!isMember(project, req.user._id))
      return res.status(403).json({ error: 'Forbidden' });
    const milestones = await Milestone.find({ project: projectId }).sort({ deadline: 1 });
    res.json(milestones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/milestones
router.post('/', verifyToken, requireRole('coach'), async (req, res) => {
  try {
    const { projectId, title, description, deadline } = req.body;
    if (!projectId || !title) return res.status(400).json({ error: 'projectId and title required' });
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.coach.toString() !== req.user._id.toString())
      return res.status(403).json({ error: 'Forbidden' });
    const milestone = await Milestone.create({ project: projectId, title, description, deadline });
    res.status(201).json(milestone);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/milestones/:id
router.put('/:id', verifyToken, requireRole('coach'), async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id).populate('project');
    if (!milestone) return res.status(404).json({ error: 'Milestone not found' });
    if (milestone.project.coach.toString() !== req.user._id.toString())
      return res.status(403).json({ error: 'Forbidden' });
    const { title, description, deadline } = req.body;
    Object.assign(milestone, { title, description, deadline });
    await milestone.save();
    res.json(milestone);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/milestones/:id/complete
router.patch('/:id/complete', verifyToken, async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id).populate('project');
    if (!milestone) return res.status(404).json({ error: 'Milestone not found' });
    if (!isMember(milestone.project, req.user._id))
      return res.status(403).json({ error: 'Forbidden' });
    milestone.completed = !milestone.completed;
    milestone.completedAt = milestone.completed ? new Date() : undefined;
    await milestone.save();
    res.json(milestone);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/milestones/:id
router.delete('/:id', verifyToken, requireRole('coach'), async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id).populate('project');
    if (!milestone) return res.status(404).json({ error: 'Milestone not found' });
    if (milestone.project.coach.toString() !== req.user._id.toString())
      return res.status(403).json({ error: 'Forbidden' });
    await milestone.deleteOne();
    res.json({ message: 'Milestone deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const Project = require('../models/Project');
const Milestone = require('../models/Milestone');
const Task = require('../models/Task');
const Todo = require('../models/Todo');
const User = require('../models/User');
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

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
router.post('/', verifyToken, requireRole('coach'), async (req, res) => {
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

// PUT /api/projects/:id
router.put('/:id', verifyToken, requireRole('coach'), async (req, res) => {
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
router.delete('/:id', verifyToken, requireRole('coach'), async (req, res) => {
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
router.post('/:id/members', verifyToken, requireRole('coach'), async (req, res) => {
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
router.delete('/:id/members/:userId', verifyToken, requireRole('coach'), async (req, res) => {
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

const express = require('express');
const CoachStudent = require('../models/CoachStudent');
const User = require('../models/User');
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// GET /api/coach-students — list all coached students
router.get('/', verifyToken, requireRole('coach'), async (req, res) => {
  try {
    const relations = await CoachStudent.find({ coach: req.user._id })
      .populate('student', 'name email')
      .sort({ createdAt: 1 });
    res.json(relations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/coach-students — add student by email
router.post('/', verifyToken, requireRole('coach'), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });

    const student = await User.findOne({ email: email.toLowerCase().trim() });
    if (!student) return res.status(404).json({ error: 'User not found' });
    if (student.role !== 'student') return res.status(400).json({ error: 'User is not a student' });
    if (student._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot add yourself' });
    }

    const existing = await CoachStudent.findOne({ coach: req.user._id, student: student._id });
    if (existing) return res.status(409).json({ error: 'Student already added' });

    const relation = await CoachStudent.create({ coach: req.user._id, student: student._id });
    await relation.populate('student', 'name email');
    res.status(201).json(relation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/coach-students/:studentId — remove student from coaching
router.delete('/:studentId', verifyToken, requireRole('coach'), async (req, res) => {
  try {
    const result = await CoachStudent.deleteOne({
      coach: req.user._id,
      student: req.params.studentId,
    });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Relation not found' });
    res.json({ message: 'Student removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

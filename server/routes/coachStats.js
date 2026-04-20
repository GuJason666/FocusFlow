const express = require('express');
const CoachStudent = require('../models/CoachStudent');
const Todo = require('../models/Todo');
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// GET /api/coach/student-todos?start=ISO&end=ISO&studentId=optional
router.get('/student-todos', verifyToken, requireRole('coach'), async (req, res) => {
  try {
    const { start, end, studentId } = req.query;
    if (!start || !end) return res.status(400).json({ error: 'start and end required' });

    const relations = await CoachStudent.find({ coach: req.user._id }).select('student');
    const studentIds = relations.map((r) => r.student.toString());

    if (studentIds.length === 0) return res.json([]);

    const ownerFilter = studentId
      ? (studentIds.includes(studentId) ? studentId : null)
      : { $in: studentIds };

    if (ownerFilter === null) return res.json([]);

    const todos = await Todo.find({
      assignedBy: req.user._id,
      owner: ownerFilter,
      weekOf: { $gte: new Date(start), $lte: new Date(end) },
    }).populate('owner', 'name email');

    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

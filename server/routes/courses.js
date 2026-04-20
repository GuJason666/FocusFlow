const express = require('express');
const Course = require('../models/Course');
const Task = require('../models/Task');
const Todo = require('../models/Todo');
const verifyToken = require('../middleware/auth');

const router = express.Router();

const PERIOD_TIMES = {
  '1':  { h: 7,  m: 25 }, '2':  { h: 8,  m: 30 }, '3':  { h: 9,  m: 35 },
  '4':  { h: 10, m: 40 }, '5':  { h: 11, m: 45 }, '6':  { h: 12, m: 50 },
  '7':  { h: 13, m: 55 }, '8':  { h: 15, m: 0  }, '9':  { h: 16, m: 5  },
  '10': { h: 17, m: 10 }, '11': { h: 18, m: 15 },
  'E1': { h: 19, m: 20 }, 'E2': { h: 20, m: 20 }, 'E3': { h: 21, m: 20 },
};

const DAY_ABBR = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' };

function slotTimes(dateObj, period) {
  const { h, m } = PERIOD_TIMES[period];
  const yr = dateObj.getFullYear();
  const mo = dateObj.getMonth();
  const dy = dateObj.getDate();
  const slotStart = new Date(yr, mo, dy, h, m, 0, 0);
  const slotEnd   = new Date(yr, mo, dy, h, m + 50, 0, 0);
  return { slotStart, slotEnd };
}

function startOfWeekSunday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

// POST /api/courses
router.post('/', verifyToken, async (req, res) => {
  try {
    const { courseCode, courseName, termStart, termEnd, schedule, reminderHours } = req.body;
    if (!courseCode || !courseName || !termStart || !termEnd || !Array.isArray(schedule)) {
      return res.status(400).json({ error: 'courseCode, courseName, termStart, termEnd, and schedule are required' });
    }

    const userId = req.user._id;
    const rStart = new Date(termStart);
    const rEnd   = new Date(termEnd);

    // Build all lecture slots: iterate every date in range, match day-of-week
    const allSlots = [];
    const current = new Date(rStart);
    while (current <= rEnd) {
      const dow = current.getDay(); // 0=Sun…6=Sat; our schedule uses 1=Mon…6=Sat
      const matches = schedule.filter(s => s.dayOfWeek === dow);
      for (const { dayOfWeek, period } of matches) {
        const { slotStart, slotEnd } = slotTimes(current, period);
        allSlots.push({ slotStart, slotEnd, dayOfWeek, period });
      }
      current.setDate(current.getDate() + 1);
    }

    if (allSlots.length === 0) {
      // No matching days in range — still create the course with empty schedule
    }

    // Determine overall range for broad DB query
    const overallStart = allSlots.length ? allSlots[0].slotStart : rStart;
    const overallEnd   = allSlots.length ? allSlots[allSlots.length - 1].slotEnd : rEnd;

    // Conflict check: course-vs-course (lecture tasks have course field set)
    const existingLectures = await Task.find({
      owner: userId,
      course: { $exists: true, $ne: null },
      startTime: { $lt: overallEnd },
      endTime:   { $gt: overallStart },
    }).select('startTime endTime courseCode');

    for (const slot of allSlots) {
      for (const lec of existingLectures) {
        if (overlaps(slot.slotStart, slot.slotEnd, lec.startTime, lec.endTime)) {
          return res.status(409).json({
            error: `Schedule conflicts with existing course: ${lec.courseCode || 'unknown'}`,
          });
        }
      }
    }

    // Find non-course tasks that conflict — these get bumped to todos
    const conflictingTasks = await Task.find({
      owner: userId,
      course: null,
      startTime: { $lt: overallEnd },
      endTime:   { $gt: overallStart },
      isRecurringTemplate: { $ne: true },
    });

    // Deduplicate by task _id
    const toBump = new Map();
    for (const slot of allSlots) {
      for (const task of conflictingTasks) {
        if (overlaps(slot.slotStart, slot.slotEnd, task.startTime, task.endTime)) {
          toBump.set(task._id.toString(), task);
        }
      }
    }

    // Bump each conflicting task to a todo
    let bumpedCount = 0;
    for (const task of toBump.values()) {
      await Todo.create({
        title: task.title,
        description: task.description,
        category: task.category || 'Other',
        owner: task.owner,
        weekOf: startOfWeekSunday(task.startTime),
      });
      await task.deleteOne();
      bumpedCount++;
    }

    // Create the course record
    const course = await Course.create({
      courseCode,
      courseName,
      termStart: rStart,
      termEnd: rEnd,
      owner: userId,
      schedule,
      reminderHours: reminderHours ?? null,
    });

    // Bulk insert lecture tasks
    const tasksToInsert = allSlots.map(({ slotStart, slotEnd, dayOfWeek, period }) => ({
      title: `${courseCode} ${DAY_ABBR[dayOfWeek]} P${period}`,
      description: '',
      category: 'Academic',
      course: course._id,
      courseCode,
      owner: userId,
      startTime: slotStart,
      endTime: slotEnd,
      reminderHours: reminderHours ?? null,
      completed: false,
      isRecurringTemplate: false,
    }));

    if (tasksToInsert.length > 0) {
      await Task.insertMany(tasksToInsert);
    }

    res.status(201).json({ course, lectureCount: tasksToInsert.length, bumpedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/courses
router.get('/', verifyToken, async (req, res) => {
  try {
    const courses = await Course.find({ owner: req.user._id }).sort({ termStart: 1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/courses/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (course.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/courses/:id/lectures
router.get('/:id/lectures', verifyToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (course.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const lectures = await Task.find({
      course: course._id,
      startTime: { $gte: new Date() },
    })
      .sort({ startTime: 1 })
      .limit(5);
    res.json(lectures);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/courses/:id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (course.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const result = await Task.deleteMany({ course: course._id });
    await course.deleteOne();
    res.json({ message: 'Course deleted', deletedLectures: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

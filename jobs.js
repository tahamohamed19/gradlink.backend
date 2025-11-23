const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const { calculateMatchScore } = require('../utils/utils');
const { body, validationResult } = require('express-validator');

// Get jobs with pagination, search, filter
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, location, jobType, remote } = req.query;

    let query = { status: 'active' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (location) query.location = { $regex: location, $options: 'i' };
    if (jobType) query.jobType = jobType;
    if (remote !== undefined) query.remote = remote === 'true';

    const jobs = await Job.find(query)
      .populate('company', 'name logo location')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(query);

    res.json({ jobs, totalPages: Math.ceil(total / limit), currentPage: page, total });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get job by id
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('company', 'name logo description website location');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create job - recruiter only
router.post('/', auth, authorize('recruiter'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('jobType').isIn(['internship', 'full-time', 'part-time', 'contract']).withMessage('Invalid jobType'),
  body('location').notEmpty().withMessage('Location is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const job = new Job({ ...req.body, company: req.user._id });
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Apply for a job - students and graduates only
router.post('/:id/apply', auth, authorize('student', 'graduate'), [
  body('coverLetter').optional().isString()
], async (req, res) => {
  try {
    const { coverLetter } = req.body;
    const jobId = req.params.id;
    const userId = req.user._id;

    const existingApplication = await Application.findOne({ job: jobId, applicant: userId });
    if (existingApplication) return res.status(400).json({ message: 'Already applied for this job' });

    const job = await Job.findById(jobId);
    const user = await User.findById(userId);
    const matchScore = calculateMatchScore(user, job);

    const application = new Application({ job: jobId, applicant: userId, coverLetter, matchScore });
    await application.save();

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get my jobs for recruiter
router.get('/company/my-jobs', auth, authorize('recruiter'), async (req, res) => {
  try {
    const jobs = await Job.find({ company: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

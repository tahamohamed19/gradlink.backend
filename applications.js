const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Application = require('../models/Application');

// Get logged in user's applications (students, graduates)
router.get('/my-applications', auth, authorize('student', 'graduate'), async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job')
      .populate('job.company', 'name logo')
      .sort({ appliedDate: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get applications for a job (recruiter)
router.get('/job/:jobId', auth, authorize('recruiter'), async (req, res) => {
  try {
    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'profile education skills experience')
      .sort({ matchScore: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

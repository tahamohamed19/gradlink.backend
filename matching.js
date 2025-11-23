const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Job = require('../models/Job');
const User = require('../models/User');
const { calculateMatchScore } = require('../utils/utils');

// Get matched jobs for logged in user (students, graduates)
router.get('/jobs-for-me', auth, authorize('student', 'graduate'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const jobs = await Job.find({ status: 'active' }).populate('company', 'name logo location');

    const matchedJobs = jobs.map(job => {
      const matchScore = calculateMatchScore(user, job);
      return { job, matchScore };
    }).filter(match => match.matchScore > 50).sort((a, b) => b.matchScore - a.matchScore);

    res.json(matchedJobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get matched candidates for a job by recruiter
router.get('/candidates-for-job/:jobId', auth, authorize('recruiter'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    const users = await User.find({ userType: { $in: ['student', 'graduate'] } });

    const matchedCandidates = users.map(user => {
      const matchScore = calculateMatchScore(user, job);
      return {
        user: { _id: user._id, profile: user.profile, education: user.education, skills: user.skills, experience: user.experience },
        matchScore
      };
    }).filter(match => match.matchScore > 50).sort((a, b) => b.matchScore - a.matchScore);

    res.json(matchedCandidates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

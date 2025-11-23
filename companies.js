const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Company = require('../models/Company');
const { body, validationResult } = require('express-validator');

// Get company profile
router.get('/profile', auth, authorize('recruiter'), async (req, res) => {
  try {
    const company = await Company.findById(req.user._id);
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update company profile
router.put('/profile', auth, authorize('recruiter'), async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.user._id, { $set: req.body }, { new: true });
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

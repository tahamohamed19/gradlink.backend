const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { $set: req.body }, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add education - only for students and graduates
router.post('/education', auth, authorize('student', 'graduate'), [
  body('institution').notEmpty().withMessage('Institution is required'),
  body('degree').notEmpty().withMessage('Degree is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { education: req.body } },
      { new: true }
    );
    res.json(user.education);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add experience - only for students and graduates
router.post('/experience', auth, authorize('student', 'graduate'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('company').notEmpty().withMessage('Company is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { experience: req.body } },
      { new: true }
    );
    res.json(user.experience);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add skill - only for students and graduates
router.post('/skills', auth, authorize('student', 'graduate'), [
  body('skill').notEmpty().withMessage('Skill is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { skill } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { skills: skill } },
      { new: true }
    );
    res.json(user.skills);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

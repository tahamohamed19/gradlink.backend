const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Company = require('../models/Company');
const { generateToken } = require('../utils/utils');
const { body, validationResult } = require('express-validator');
const config = require('../config/config');

// Register User
router.post('/register/user', [
  body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('userType').isIn(['student', 'graduate']).withMessage('Invalid userType'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password, userType, firstName, lastName } = req.body;

    // Premium membership check for student email domain
    let premiumMembership = false;
    if (userType === 'student') {
      const emailDomain = email.split('@')[1];
      if (emailDomain === config.premiumStudentEmailDomain) {
        premiumMembership = true;
      }
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({ email, password, userType, profile: { firstName, lastName }, premiumMembership });
    await user.save();

    const token = generateToken(user._id, userType);

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, userType: user.userType, profile: user.profile, premiumMembership: user.premiumMembership }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register Company
router.post('/register/company', [
  body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Company name is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password, name, description, industry } = req.body;

    let company = await Company.findOne({ email });
    if (company) return res.status(400).json({ message: 'Company already exists' });

    company = new Company({ email, password, name, description, industry });
    await company.save();

    const token = generateToken(company._id, 'recruiter');

    res.status(201).json({
      token,
      company: { id: company._id, email: company.email, name: company.name, description: company.description }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login (User or Company)
router.post('/login', [
  body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password').exists().withMessage('Password is required'),
  body('userType').isIn(['student', 'graduate', 'recruiter']).withMessage('Invalid userType')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password, userType } = req.body;

    let entity;
    if (userType === 'recruiter') {
      entity = await Company.findOne({ email });
    } else {
      entity = await User.findOne({ email });
    }

    if (!entity || !(await entity.correctPassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(entity._id, userType === 'recruiter' ? 'recruiter' : entity.userType);

    res.json({
      token,
      user: userType === 'recruiter' ? {
        id: entity._id, email: entity.email, userType: 'recruiter', name: entity.name
      } : {
        id: entity._id, email: entity.email, userType: entity.userType, profile: entity.profile, premiumMembership: entity.premiumMembership
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.use(errors());

module.exports = router;

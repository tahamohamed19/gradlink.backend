const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  userType: { type: String, enum: ['student', 'graduate', 'recruiter'], required: true },
  profile: {
    firstName: String,
    lastName: String,
    headline: String,
    about: String,
    profilePicture: String,
    location: String,
    phone: String
  },
  education: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    startDate: Date,
    endDate: Date,
    gpa: Number,
    description: String
  }],
  experience: [{
    title: String,
    company: String,
    location: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
    description: String
  }],
  skills: [String],
  certifications: [{
    name: String,
    issuingOrganization: String,
    issueDate: Date,
    expirationDate: Date,
    credentialID: String
  }],
  preferences: {
    jobTypes: [String],
    locations: [String],
    industries: [String],
    remote: Boolean,
    salaryExpectation: Number
  },
  isActive: { type: Boolean, default: true },
  premiumMembership: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, config.bcryptSaltRounds);
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  description: String,
  industry: String,
  website: String,
  logo: String,
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
  },
  founded: Date,
  socialMedia: {
    linkedin: String,
    twitter: String,
    facebook: String
  },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

companySchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, config.bcryptSaltRounds);
  next();
});

companySchema.methods.correctPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Company = mongoose.model('Company', companySchema);

module.exports = Company;

const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  description: { type: String, required: true },
  requirements: {
    education: [String],
    skills: [String],
    experience: { type: String, enum: ['internship', 'entry', 'mid', 'senior'] },
    minGPA: Number
  },
  jobType: {
    type: String,
    enum: ['internship', 'full-time', 'part-time', 'contract'],
    required: true
  },
  location: { type: String, required: true },
  remote: { type: Boolean, default: false },
  salary: {
    min: Number,
    max: Number,
    currency: String
  },
  applicationDeadline: Date,
  responsibilities: [String],
  benefits: [String],
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  }
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;

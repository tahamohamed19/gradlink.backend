const jwt = require('jsonwebtoken');
const config = require('../config/config');

const generateToken = (id, userType) => {
  return jwt.sign({ id, userType }, config.jwtSecret, { expiresIn: '30d' });
};

const calculateMatchScore = (user, job) => {
  let score = 0;
  let totalPossible = 0;
  const weights = { skills: 40, education: 25, experience: 20, location: 10, preferences: 5 };

  // Skills matching
  if (job.requirements.skills && user.skills) {
    const matchingSkills = user.skills.filter(skill => 
      job.requirements.skills.some(reqSkill => 
        reqSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(reqSkill.toLowerCase())
      )
    );
    const skillMatch = matchingSkills.length / job.requirements.skills.length;
    score += skillMatch * weights.skills;
  }
  totalPossible += weights.skills;

  // Education matching
  if (job.requirements.education && user.education) {
    const hasRequiredEducation = user.education.some(edu => 
      job.requirements.education.some(reqEdu => 
        edu.degree.toLowerCase().includes(reqEdu.toLowerCase())
      )
    );
    if (hasRequiredEducation) score += weights.education;
  }
  totalPossible += weights.education;

  // Experience matching
  if (job.requirements.experience && user.experience) {
    const experienceLevels = ['internship', 'entry', 'mid', 'senior'];
    const userMaxExperience = user.experience.length > 0 ? 
      Math.max(...user.experience.map(exp => 
        experienceLevels.indexOf(exp.title.toLowerCase().split(' ')[0])
      )) : 0;
    
    const jobExperienceLevel = experienceLevels.indexOf(job.requirements.experience);
    
    if (userMaxExperience >= jobExperienceLevel) score += weights.experience;
  }
  totalPossible += weights.experience;

  // Location matching
  if (user.profile.location && job.location) {
    const userLocation = user.profile.location.toLowerCase();
    const jobLocation = job.location.toLowerCase();
    
    if (userLocation.includes(jobLocation) || jobLocation.includes(userLocation)) {
      score += weights.location;
    } else if (job.remote && user.preferences?.remote) {
      score += weights.location;
    }
  }
  totalPossible += weights.location;

  // Preferences matching
  if (user.preferences && user.preferences.jobTypes?.includes(job.jobType)) {
    score += weights.preferences;
  }
  totalPossible += weights.preferences;

  return Math.round((score / totalPossible) * 100);
};

module.exports = {
  generateToken,
  calculateMatchScore
};

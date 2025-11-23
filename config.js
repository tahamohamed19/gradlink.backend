require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  dbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/gradlink',
  jwtSecret: process.env.JWT_SECRET || 'gradlink_secret_key',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  premiumStudentEmailDomain: process.env.PREMIUM_STUDENT_EMAIL_DOMAIN || 'elsewedy.edu.eg',
};

module.exports = config;

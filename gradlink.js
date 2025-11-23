const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const config = require('./config/config');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const companyRoutes = require('./routes/companies');
const jobRoutes = require('./routes/jobs');
const matchingRoutes = require('./routes/matching');
const applicationRoutes = require('./routes/applications');

const app = express();

// Middleware
app.use(cors({
  origin: config.clientUrl,
  optionsSuccessStatus: 200
}));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max requests per IP
});
app.use(limiter);

// Database connection
mongoose.connect(config.dbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/applications', applicationRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to GradLink API',
    endpoints: {
      auth: ['POST /api/auth/register/user', 'POST /api/auth/register/company', 'POST /api/auth/login'],
      users: ['GET /api/users/profile', 'PUT /api/users/profile', 'POST /api/users/education', 'POST /api/users/experience', 'POST /api/users/skills'],
      companies: ['GET /api/companies/profile', 'PUT /api/companies/profile'],
      jobs: ['GET /api/jobs', 'GET /api/jobs/:id', 'POST /api/jobs', 'POST /api/jobs/:id/apply', 'GET /api/jobs/company/my-jobs'],
      matching: ['GET /api/matching/jobs-for-me', 'GET /api/matching/candidates-for-job/:jobId'],
      applications: ['GET /api/applications/my-applications', 'GET /api/applications/job/:jobId']
    }
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: statusCode
    }
  });
});

// Start server
const PORT = config.port || 5000;
app.listen(PORT, () => {
  console.log(`GradLink server is running on port ${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}`);
});

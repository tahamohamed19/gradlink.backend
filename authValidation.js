const { Joi, Segments } = require('celebrate');

const userRegisterSchema = {
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    userType: Joi.string().valid('student', 'graduate', 'recruiter').required(),
    profile: Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      headline: Joi.string().allow(''),
      about: Joi.string().allow(''),
      profilePicture: Joi.string().uri().allow(''),
      location: Joi.string().allow(''),
      phone: Joi.string().allow('')
    }).optional(),
  }),
};

const companyRegisterSchema = {
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    description: Joi.string().allow(''),
    industry: Joi.string().allow(''),
    website: Joi.string().uri().allow(''),
    location: Joi.object({
      address: Joi.string().allow(''),
      city: Joi.string().allow(''),
      state: Joi.string().allow(''),
      country: Joi.string().allow(''),
      zipCode: Joi.string().allow('')
    }).optional(),
    size: Joi.string().valid('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+').optional(),
  }),
};

const loginSchema = {
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

module.exports = {
  userRegisterSchema,
  companyRegisterSchema,
  loginSchema
};

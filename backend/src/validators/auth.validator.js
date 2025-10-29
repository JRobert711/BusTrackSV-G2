const Joi = require('joi');

const loginSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).max(100).required(),
});

function validateLogin(req, res, next) {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: 'Datos inválidos',
      details: error.details.map(d => d.message),
    });
  }
  return next();
}

module.exports = { validateLogin };

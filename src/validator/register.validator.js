const Joi = require('joi');
const registerValidator = data => {
    const schema = Joi.object({
        name: Joi.string().min(6).required(),
        email: Joi.string().email().min(6).required(),
        password: Joi.string().min(6).required(),
    })

    return schema.validate(data);
}

module.exports = registerValidator;

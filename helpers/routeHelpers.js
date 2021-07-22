const Joi = require('joi');

module.exports = {

    validateBody: (schema) => {
        return (req,res,next) => {
            const result = schema.validate(req.body);
            if(result.error){
                return res.status(400).json(result.error);
            }

            if(!req.value) { req.value = {}; }
            req.value['body'] = result.value;
            next();
        }
    },

    schemas: {
        authSchema: Joi.object().keys({
            email: Joi.string() .required() ,
            password: Joi.string() .required(),
            roll: Joi.string(),
            name: Joi.string(),
            emailUser: Joi.string(),
            sdt: Joi.string(),
            kholamviec: Joi.string(),
        })
    }

}
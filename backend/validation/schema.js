const Joi = require('joi')

const schema = {
   
    AccountInfo: Joi.object({
      account: Joi.string().required().label('Account'),
      dob: Joi.string().required().label('dob')
    }),
     Otp: Joi.object({
        otp: Joi.number().required().label('Otp'),
     })
  };
  
  module.exports = schema;
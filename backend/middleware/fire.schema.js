const {AccountInfo,Otp
} = require("../validation/schema");

module.exports = {
  OtpVal: async (req, res, next) => {
    const options = {
      errors: {
        wrap: {
          label: "",
        },
      },
    };
    console.log(req.body);
    const value = await Otp.validate(req.body, options);
    if (value.error) {
      res.status(400).json({
        Status: 0,
        message: value.error.details[0].message,
      });
    } else {
      next();
    }
  },
  AccountVal: async (req, res, next) => {
    const options = {
      errors: {
        wrap: {
          label: "",
        },
      },
    };
    const value = await AccountInfo.validate(req.body, options);
    if (value.error) {
      res.status(400).json({
        Status: 0,
        Message: value.error.details[0].message,
      });
    } else {
      next();
    }
  }
};

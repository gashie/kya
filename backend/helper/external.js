const axios = require("axios");

module.exports = {

    sendMail: async (user,email,status,declinedReason) => {
      console.log(`sending mail to`,user,email);
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };
        let { data } = await axios.post(
          `http://192.168.0.236:3113/api/v1/welcome/csupdate`,
         { email,user,status,declinedReason},
          config
        );
    
        console.log(data);
      },
      
    emailOtp: async (otp,email) => {
      console.log(`sending otp mail to`,email,otp);
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };
        let { data } = await axios.post(
          `http://192.168.0.236:3113/api/v1/welcome/otp`,
         { otp,email},
          config
        );
    
        console.log(data);
      },
};

const axios = require("axios");
const Model = require("../model/Customer");
const https = require('https');
const {
  smsUrl,
  apiKey,
  apiToken,
  smsServiceID,
} = require("../myvars/module");
  // At request level
  const hagent = new https.Agent({  
    rejectUnauthorized: false
  });
module.exports = {

  sendOtp: async (phone,customerName,otp) => {
    console.log(customerName);
    let data = JSON.stringify({
      "servicerequest": {
        "ServiceID": smsServiceID,
        "apiKey": apiKey,
        "apiToken": apiToken
      },
      "PhoneNumber": phone,
      "Activity": "Customer Update",
      "Message": `Dear ${customerName.replace(/[ ,]+/g, ",").split(",")[0]} the OTP to verify your account update request is ${otp}`
    });
    
    let config = {
      method: 'post',
      url: smsUrl,
      headers: { 
        'Content-Type': 'application/json'
      },
      data : data,
      httpsAgent: hagent

    };
 
    let response = await axios(config);
    return response
  },
  Notify: async (phone,customerName,status) => {
    let m1= `Hello ${customerName.replace(/[ ,]+/g, ",").split(",")[0]} Your request to update your Ghana card on CalBank Banking System has been authorized/approved.Your profile has been updated successfully .`
    let m2 = `Hello ${customerName.replace(/[ ,]+/g, ",").split(",")[0]} Your request to update your Ghana card on CalBank Banking System has been declined.Kindly check your email for details`
    console.log(customerName);
    let data = JSON.stringify({
      "servicerequest": {
        "ServiceID": smsServiceID,
        "apiKey": apiKey,
        "apiToken": apiToken
      },
      "PhoneNumber": phone,
      "Activity": "Customer Update",
      "Message": status == 1 ? m1 : m2
    });
    
    let config = {
      method: 'post',
      url: smsUrl,
      headers: { 
        'Content-Type': 'application/json'
      },
      data : data,
      httpsAgent: hagent

    };
 
    let response = await axios(config);
    return response
  },
  CatchHistory: async (data) => {
  let result = await Model.SaveHistory(data);
  },
};
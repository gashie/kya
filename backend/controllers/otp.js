const axios = require("axios");
const stringSimilarity = require("string-similarity");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const FormData = require("form-data");
const path = require("path");
const dotenv = require("dotenv");
const genTOTP = require("gen-totp");
dotenv.config({ path: "./config/config.env" });
const Model = require("../model/Customer");
const { sendOtp, Notify,CatchHistory } = require("../helper/funcs");
const { sendMail } = require("../helper/external");
const https = require('https');
const {
  appHiveUrl,
  ServiceID,
  apiKey,
  apiToken,
  accountServiceID,
} = require("../myvars/module");
var base64ToImage = require("base64-to-image");
const Jimp = require("jimp");
const fs = require("fs");

const asynHandler = require("../middleware/async");


  // At request level
  const hagent = new https.Agent({  
    rejectUnauthorized: false
  });


exports.VerifyOtp = asynHandler(async (req, res, next) => {
  let custoemrData = req.kid;
  let otp = req.body.otp;
  if (!otp) {
    return res.json({
      Status: 0,
      Message: "Sorry, Please Provide OTP",
      Data: [],
    });
  }

    //Set History Parameters
    historyObject.event = "OTP Verification"
    historyObject.customerHash = custoemrData.customerHash
    historyObject.userAgentHash = custoemrData.userAgentHash
    historyObject.payload = JSON.stringify(req.body)
    historyObject.fullName = custoemrData.fullName
  
  console.log(custoemrData);
  console.log(req.body);
  let dbresult = await Model.VerifyOtp(otp, custoemrData.customerAccount);

  if (!dbresult) {
    historyObject.response = "Invalid OTP"
     await CatchHistory(historyObject);
    return res.status(200).json({
      Status: 0,
      Data: [],
      Message: `Invalid Otp`,
    });
  }
  let newData = {
    otp: "",
    status: "confirmed",
  };

  historyObject.response = "OTP Confirmed"
     await CatchHistory(historyObject);
  console.log({
    Status: 0,
    Data: [],
    Message: `Otp Verified--${dbresult.email} can proceed to ghana  card update`,
  });
  let updateresult = await Model.UpdateAccount(newData, dbresult.id);

  if (updateresult.affectedRows === 1) {
    // //set history

    res.status(200).json({
      Status: 1,
      Message: `Level two Completed`,
    });
    console.log({
      Status: 1,
      Message: `Level two Completed-verified`,
    });
  } else {
    res.status(500).json({ Status: 0, Message: "Unable to process your request, please try again [Error 003]" });
    console.log({
      Status: 0,
      Data: [],
      Message: `Db Error`,
    });
  }
  //get history
});

const sendResponse = (kid, statusCode, res) => {
  
  const payload = {
    sub: kid,
    iss: "calbankgh.com",
    aud: "https://calbank.net/",
  };
  const token = jwt.sign(payload, process.env.JWTAUTH, {
    expiresIn: "1hr",
  });

  const options = {
    // expires: new Date(Date.now() + 60 * 24 * 3600000),
    // maxAge: 60 * 60 * 1000,
    maxAge:3600000,
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res
    .status(statusCode)
    .cookie("sid", token, options)
    .json({ Status: 1, Message: "Level  Completed" });
};

const clearResponse = (message, statusCode, res) => {
  const options = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  res
    .status(statusCode)
    .cookie("sid", "none", options)
    .json({ Status: 1, Message: message });
};



let historyObject = {
  fullName :"",
  customerHash :"",
  userAgentHash:"",
   event:"",
   payload:"",
   response:""
 }
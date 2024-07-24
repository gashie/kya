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
const { sendMail,emailOtp } = require("../helper/external");
const https = require('https');
const {
  appHiveUrl,
  ServiceID,
  apiKey,
  apiToken,
  accountServiceID,
} = require("../myvars/module");

const asynHandler = require("../middleware/async");


  // At request level
  const hagent = new https.Agent({  
    rejectUnauthorized: false
  });

exports.AccountEnquiry = asynHandler(async (req, res, next) => {
  let account = req.body.account;
  let agent = req.useragent;
  let dob = req.body.dob;
  let newdob = dob;
  let otp = genTOTP(`${account}${new Date().getDate()}`, {
    algorithm: "SHA-256",
    period: 1,
  });
  let customerHash = crypto.createHash("md5").update(account).digest("hex");
  let userAgentHash = crypto
    .createHash("md5")
    .update(JSON.stringify(agent))
    .digest("hex");
  let data = JSON.stringify({
    servicerequest: {
      ServiceID: accountServiceID,
      apiKey: apiKey,
      apiToken: apiToken,
    },
    RequestData: {
      AccountToDebit: account,
    },
  });



  let config = {
    method: "post",
    url: `${appHiveUrl}payment/AccountEnquiryOptional`,
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
    httpsAgent: hagent
  };

  let response = await axios(config);

  //Set History Parameters
  historyObject.event = "Account Verification"
  historyObject.customerHash = customerHash
  historyObject.userAgentHash = userAgentHash
  historyObject.payload = JSON.stringify(req.body)
  
 
  console.log(response.data);
  if (response.data && response.data.Status == 1) {
  
    let accountData = JSON.parse(response.data.Details);
    let accountDate = accountData.dob;
    let phoneNumber = accountData.phoneno;
    let customerID = accountData.customer;
    let customerCategory = accountData.category;
    let customerName = accountData.account_title_1;
    let email = accountData.email;
    let newAccountDate = new Date(accountDate).toDateString();
    historyObject.response = "Account Verification Successful"
    historyObject.fullName = customerName
     await CatchHistory(historyObject);
    console.log(newdob);
    console.log(accountDate);
    console.log(`checking dob--`, newdob == accountDate);
    if (newdob === accountDate) {
      historyObject.response = "Valid Dob"
      await CatchHistory(historyObject);
      //perform

      //search customerID in db
      let dbresult = await Model.FindCustomerID(customerID);
      console.log(`finding`, customerID);
  

      if (dbresult) {
        historyObject.response = "Customer ID Already exist"
        await CatchHistory(historyObject);
        res.json({
          Status: 0,
          Message:
            "Kindly visit the nearest branch or contact us via customercare@calbank.net, *771*3#, CalBank App, social media handles @CalBankPLC or via Live Chat on our website for further assistance) [Error 004]",
          Data: [],
        });
      } else {
        await autoSave(
          phoneNumber,
          email,
          accountData,
          customerName,
          otp,
          customerID,
          customerHash,
          customerCategory,
          userAgentHash
        );
      }
    }

    if (newdob != accountDate) {
      historyObject.response = "Error in Dob"
      await CatchHistory(historyObject);
      res.json({
        Status: 0,
        Message: "Kindly visit the nearest branch or contact us via customercare@calbank.net, *771*3#, CalBank App, social media handles @CalBankPLC or via Live Chat on our website for further assistance) [Error 002]",
        Data: response.data,
      });
    }
  } else {
    historyObject.response = "Account Verification Failed"
    let historyresponse = await CatchHistory(historyObject);
    res.json({
      Status: 0,
      Message: "Kindly visit the nearest branch or contact us via customercare@calbank.net, *771*3#, CalBank App, social media handles @CalBankPLC or via Live Chat on our website for further assistance) [Error 001]",
      Data: response.data,
    });
  }

  async function autoSave(
    phone,
    email,
    customer,
    customerName,
    otp,
    customerID,
    customerHash,
    customerCategory,
    userAgentHash
  ) {
    let newData = {
      customerHash,
      fullName: customerName,
      customerAccount: account,
      customerID,
      email,
      phone,
      customerCategory,
      otp: otp,
      customerData: JSON.stringify(customer),
      userAgentHash,
      status: "new",
    };

    //search for customer if account data exist
    let dbresult = await Model.FindCustomerAccount(account);
    console.log(dbresult);
    console.log(email);
    if (!dbresult) {
      console.log({
        Status: 0,
        Data: [],
        Message: `No record found--proceed to save new record`,
      });

      //now save new record
      historyObject.response = "Saving Customer Record"
      await CatchHistory(historyObject);
      let saveresult = await Model.SaveAccount(newData);
      //after approving and if all has approved set status to full-aproval / pending

      //generate and send otp
      let otpresponse = await sendOtp(phone, customerName, otp);
      let emailotpresponse = await emailOtp(otp,email);
      console.log(otpresponse.data);
      
      if (saveresult.affectedRows === 1 && otpresponse.data.Status === 1) {
        // //set history
        historyObject.response = "Otp Sent To Customer"
        await CatchHistory(historyObject);
        sendResponse(customerHash, 200, res);
        console.log({
          Status: 1,
          Message: `Level One Completed`,
          kid: customerHash,
        });
      } else {
        historyObject.response = "System Failed to send OTP"
        await CatchHistory(historyObject);
        res
          .status(500)
          .json({ Status: 0, Message: "Sorry we were unable to send verification to phone number" });
        console.log({
          Status: 0,
          Data: [],
          Message: `Db Error`,
        });
      }
    } else {
      console.log({
        Status: 0,
        Data: [],
        Message: `One record found--proceed to update  record`,
      });

      //now update existing record
      newData["updatedAt"] = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      newData["createdAt"] = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      newData["status"] = "new";
      let updateresult = await Model.UpdateAccount(newData, dbresult.id);
      //after approving and if all has approved set status to full-aproval / pending

      historyObject.response = "Customer Exist: Records cleared, new otp sent"
      await CatchHistory(historyObject);
      //generate and send otp
      let otpresponse = await sendOtp(phone, customerName, otp);
      console.log(otpresponse.data);
      if (updateresult.affectedRows === 1 && otpresponse.data.Status === 1) {
        // //set history
        sendResponse(dbresult.customerHash, 200, res);
        console.log({
          Status: 1,
          Message: `Level One Completed-updated`,
        });
      } else {
        res
          .status(500)
          .json({ Status: 0, Message: "Unable to process your request,please try again. [Error 003]" });
        console.log({
          Status: 0,
          Data: [],
          Message: `Db Error`,
        });
      }
    }
  }
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
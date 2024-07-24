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
const { sendOtp, Notify, CatchHistory } = require("../helper/funcs");
const ba64 = require("ba64");
const { sendMail } = require("../helper/external");
const https = require('https');
const {
  appHiveUrl,
  ServiceID,
  apiKey,
  apiToken,
  accountServiceID,
  evelyUrl
} = require("../myvars/module");
var base64ToImage = require("base64-to-image");
const Jimp = require("jimp");
const fs = require("fs");

const asynHandler = require("../middleware/async");


// At request level
const hagent = new https.Agent({
  rejectUnauthorized: false
});
exports.CustomerUpdate = asynHandler(async (req, res, next) => {
  let base64Str = req.body.image;
  let frontimage = req?.files?.frontimage;
  let backimage = req?.files?.backimage;
  let pin = req.body.ghcardnumber;
  let newPath = "/ghcardimg/"
  var Selfiepath = "./ghCardSelfie/";
  var ghCardUploadLink = "./ghCardUpload/";
  var optionalObj = { fileName: pin, type: "png" };
  let custoemrData = req.kid;
  let existID = custoemrData.id
  //Set History Parameters
  historyObject.event = "Ghana CARD Verification"
  historyObject.customerHash = custoemrData.customerHash
  historyObject.userAgentHash = custoemrData.userAgentHash
  let historyBody = {
    pin
  }
  historyObject.payload = JSON.stringify(historyBody)
  historyObject.fullName = custoemrData.fullName
  //check files for



  //change filename
  frontimage.name = `ghCardFront-${pin.replace(/\s/g, '')}${path.parse(frontimage.name).ext}`;
  console.log(`ghCardFront-${pin.replace(/\s/g, '')}${path.parse(frontimage.name).ext}`);
  frontimage.mv(`${ghCardUploadLink}${frontimage.name}`, async (err) => {
    if (err) {
      historyObject.response = "Front Image Upload Failed"
      await CatchHistory(historyObject);
      console.log(err);
      return res.json({
        Status: 0,
        Message: "Problem with file upload",
        Data: [],
      });
    }
  });

  backimage.name = `ghCardBack-${pin.replace(/\s/g, '')}${path.parse(backimage.name).ext}`;
  console.log(`ghCardBack-${pin.replace(/\s/g, '')}${path.parse(backimage.name).ext}`);
  backimage.mv(`${ghCardUploadLink}${backimage.name}`, async (err) => {
    if (err) {
      console.log(err);
      historyObject.response = "Back Image Upload Failed"
      await CatchHistory(historyObject);
      return res.json({
        Status: 0,
        Message: "Problem with file upload",
        Data: [],
      });
    }
  });



  // await base64ToImage(base64Str, `${Selfiepath}`, optionalObj);
  if (base64Str) {
    ba64.writeImage(`${Selfiepath}${pin.replace(/\s/g, '')}`, base64Str, async function (err) {
      if (err) {
        console.log(err);
        console.log("Problem saving image");
        historyObject.response = `Problem saving selfie image`
        await CatchHistory(historyObject);
        return res.json({
          Status: 0,
          Message: "Sorry, verification failed. Please try again",
          Data: [],
        });
      }

      console.log("Image saved successfully");

      // do stuff
    });






    let data = new FormData();
    data.append(
      "file-data",
      fs.createReadStream(`ghCardSelfie/${pin.replace(/\s/g, '')}.jpeg`)
    );
    data.append("pin", pin);
    data.append("ServiceID", ServiceID);
    data.append("apiKey", apiKey);
    data.append("apiToken", apiToken);

    let config = {
      method: "post",
      url: `${appHiveUrl}NIAVerification/facialVerrification`,
      headers: {
        ...data.getHeaders(),
      },
      httpsAgent: hagent,
      data: data,
    };

    let response = await axios(config);

    //check string here


    if (response.data && response.data) {
      let ghcardname =
        response.data.Details !== null
          ? `${response.data.Details.forenames} ${response.data.Details.surname}`
          : "";
      var similarity = stringSimilarity.compareTwoStrings(
        custoemrData.fullName,
        ghcardname
      );

      console.log(similarity * 100);
      console.log(ghcardname);
      console.log(similarity * 100 > 70 ? "verified" : "pending");

      historyObject.response = `Name Check Score is: ${similarity * 100} and status is ${similarity * 100 > 70 ? "verified" : "pending"}`
      await CatchHistory(historyObject);
      //SAVE RESSULT
      let newData = {
        customerHash: custoemrData?.customerHash,
        userAgentHash: custoemrData?.userAgentHash,
        customerID: custoemrData?.customerID,
        pin: pin.replace(/\s/g, ''),
        email: custoemrData.email,
        selfie: `${Selfiepath}${pin.replace(/\s/g, '')}.jpeg`,
        frontpic: `${ghCardUploadLink}${frontimage.name}`,
        backpic: `${ghCardUploadLink}${backimage.name}`,
        customerGhanaCardData: JSON.stringify(response.data),
        status: similarity * 100 > 70 ? "verified" : "pending",
      };
      //check exisiting and save or update
      let dbresult = await Model.FindCustomerIDPendingDeclined(custoemrData.customerID);
      console.log(dbresult);

      if (dbresult) {
        //now save updated record
        console.log('update old');
        await autoUpdate(newData, response, dbresult.id)
      } else {
        //now save new record
        console.log('insert new');
        await autoInsert(newData, response)
      }

    } else {
      historyObject.response = `Verification Failed: Process Not completed`
      await CatchHistory(historyObject);
      res.json({
        Status: 0,
        Message: "Kindly visit the nearest branch or contact us via customercare@calbank.net, *771*3#, CalBank App, social media handles @CalBankPLC or via Live Chat on our website for further assistance)",
        Data: [],
      });
    }

  } else {
    res.json({
      Status: 0,
      Message: "Sorry, verification failed. Please try again",
      Data: [],
    });
  }

  async function autoInsert(newData, response) {
    let saveresult = await Model.SaveGhanaCard(newData);

    if (saveresult.affectedRows === 1 && response.data.Status == 1) {
      historyObject.response = `Process Completed and passed to job for processing`
      await CatchHistory(historyObject);
      return clearResponse(
        "Process completed. We will notify you shortly",
        200,
        res
      );
    }

    if (saveresult.affectedRows === 1 && response.data.Status == 0) {
      historyObject.response = `Process Failed: Needs Manual Update`
      await CatchHistory(historyObject);
      return clearResponse(
        "Process completed. your data has been submitted to the bank for processing",
        200,
        res
      );
    }
  }
  async function autoUpdate(newData, response, existID) {
    let updatedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
    newData["updatedAt"] = updatedAt
    let updateresult = await Model.UpdateProcess(newData, existID);
    if (updateresult.affectedRows === 1 && response.data.Status == 1) {
      historyObject.response = `Process Completed and passed to job for processing`
      await CatchHistory(historyObject);
      return clearResponse(
        "Process completed. We will notify you shortly",
        200,
        res
      );
    }

    if (updateresult.affectedRows === 1 && response.data.Status == 0) {
      historyObject.response = `Process Failed: Needs Manual Update`
      await CatchHistory(historyObject);
      return clearResponse(
        "Process completed. your data has been submitted to the bank for processing",
        200,
        res
      );
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
    maxAge: 3600000,
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

exports.AllCustomers = asynHandler(async (req, res, next) => {
  let start = req.body.start;
  let end = req.body.end;

  if (!start || !end) {
    return res.status(200).json({
      Status: 0,
      Data: [],
      Message: `Please provide start and end date`,
    });
  }
  let defLimit = req.body.limit
  var datatoday = new Date(end);
  var datatodays = datatoday.setDate(new Date(datatoday).getDate() + 1);
  todate = new Date(datatodays);
  let dbresult = await Model.GetNewPendingCustomers(start, todate, defLimit);

  if (!dbresult) {
    return res.status(200).json({
      Status: 0,
      Data: [],
      Message: `No Record Found`,
    });
  }

  let bigData = [];

  // for (const iterator of dbresult) {
  //   let dbresult = await Model.FindPendingGhanaCardCustomer(
  //     iterator.customerHash
  //   );
  //   let parsed = dbresult?.ghCardInfo
  //   if (dbresult) {
  //     let newParsed = JSON.parse(parsed)
  //     let detailsData = newParsed.Details
  //     detailsData ? delete detailsData.biometricFeed : null;
  //     let newData = {
  //       customerAccountHistory: iterator,
  //       customerGhanaCardData: {
  //         id: dbresult.id,
  //         pin: dbresult.pin,
  //         selfie: dbresult.selfie,
  //         frontpic: dbresult.frontpic,
  //         backpic: dbresult.backpic,
  //         customerGhanaCardData: detailsData ? JSON.stringify({ Status: 1, Details: detailsData }) : JSON.stringify({ Status: 0, Details: {} })

  //       },
  //     };

  //     bigData.push(newData);
  //   }
  // }

  res.status(200).json({
    Status: 1,
    Data: dbresult,
    Message: `Record Found`,
  });
});

exports.VerifiedData = asynHandler(async (req, res, next) => {

  let dbresult = await Model.FetchAllVerified();

  if (!dbresult) {
    return res.status(200).json({
      Status: 0,
      Data: [],
      Message: `No Record Found`,
    });
  }

  let bigData = [];

  for (const iterator of dbresult) {
    let customer = JSON.parse(iterator?.customerGhanaCardData);
    let customerID = iterator?.customerID;
    let firstName = `${customer?.Details?.forenames}`;
    let issueDate = customer?.Details?.cardValidFrom;
    let expiryDate = customer?.Details?.cardValidTo;
    let idNumber = customer?.Details?.nationalId;
    let surname = `${customer?.Details?.surname}`;
    let idName = `${firstName} ${surname}`;
    bigData.push({
      idName,
      issueDate,
      expiryDate,
      idNumber,
      customerID,
      customerAccount:iterator.customerAccount,
      email:iterator.email
    })
  }

  res.status(200).json({
    Status: 1,
    Data: bigData,
    Message: `Record Found`,
  });
});

exports.SystemUtility = asynHandler(async (req, res, next) => {

  let pendingresult = await Model.Utility('totalPending', 'pending');
  let graprocessed = await Model.GraUtility('totalGraProcessed', 'processed');
  let grafailed = await Model.GraUtility('totalGraFailed', 'failed');
  let verifiedresult = await Model.Utility('totalVerified', 'verified');
  let declinedresult = await Model.Utility('totalDeclined', 'declined');
  let processedresult = await Model.Utility('totalProcessed', 'processed');
  let apphiveProcessed = await Model.UtilityApphiveProcessed();
  let systemProcessed = await Model.UtilitySystemProcessed();
  let customers = await Model.UtilityAllCustomers();

  if (!pendingresult && !verifiedresult && !declinedresult && !processedresult && !apphiveProcessed && !systemProcessed) {
    return res.status(200).json({
      Status: 0,
      Data: [],
      Message: `No Record Found`,
    });
  }

  let newData = {
    totalCustomers:customers.total,
    totalPending: pendingresult.totalPending,
    totalVerified: verifiedresult.totalVerified,
    declinedresult: declinedresult.totalDeclined,
    processedresult: processedresult.totalProcessed,
    apphiveProcessed:apphiveProcessed.total,
    systemProcessed:systemProcessed.total,
    totalGraProcessed:graprocessed.totalGraProcessed,
    totalGraFailed:grafailed.totalGraFailed,


  };


  res.status(200).json({
    Status: 1,
    Data: newData,
    Message: `Record Found`,
  });
});

exports.AllVerifiedCustomers = asynHandler(async (req, res, next) => {
  let dbresult = await Model.GetCustomers();

  if (!dbresult) {
    return res.status(200).json({
      Status: 0,
      Data: [],
      Message: `No Record Found`,
    });
  }

  let bigData = [];

  for (const iterator of dbresult) {
    let dbresult = await Model.ViewVerified(iterator.customerHash);
    if (dbresult) {
      let newData = {
        customerAccountHistory: iterator,
        customerGhanaCardData: dbresult ? dbresult : {},
      };

      bigData.push(newData);
    }
  }

  res.status(200).json({
    Status: 1,
    Data: bigData,
    Message: `Record Found`,
  });
});

exports.AllFailedCustomers = asynHandler(async (req, res, next) => {
  let defLimit = req.body.limit || 10
  let getCustomers = await Model.GetCustomers();

  let bigData = [];

  for (const iterator of getCustomers) {

    let dbresult = await Model.ViewAllFailed(iterator.customerHash, defLimit);
    if (dbresult) {
      let newData = {
        customerName: iterator.fullName,
        customerAccount: iterator.customerAccount,
        customerID: iterator.customerID,
        customerCategory: iterator.customerCategory,
        eventHistory: dbresult,
      };

      bigData.push(newData);
    }
  }


  if (!dbresult) {
    return res.status(200).json({
      Status: 0,
      Data: [],
      Message: `No Record Found`,
    });
  }


  res.status(200).json({
    Status: 1,
    Data: dbresult,
    Message: `Record Found`,
  });
});

exports.SingleCustomer = asynHandler(async (req, res, next) => {
  let id = req.body.id
  let dbresult = await Model.FindCustomer(req.body.id);

  if (!dbresult) {
    return res.status(200).json({
      Status: 0,
      Data: [],
      Message: `No Record Found`,
    });
  }



  let result = await Model.FindGhanaCardCustomer(dbresult.customerHash);
  let newData = {
    customerAccountHistory: dbresult,
    customerGhanaCardData: result,
  };


  res.status(200).json({
    Status: 1,
    Data: newData,
    Message: `Record Found`,
  });
});

exports.ProcessCustomer = asynHandler(async (req, res, next) => {
  let id = req.body.id;
  let status = req.body.status
  let updatedBy = req.body.updatedBy
  let declinedReason = req.body.declinedReason
  if (!updatedBy) {
    console.log({
      Status: 0,
      Data: [],
      Message: `Please provide authoriser details`,
    });
    return res.json({
      Status: 0,
      Message: `Please provide authoriser details`,
      Data: [],
    });
  }
  if (status === "") {
    console.log({
      Status: 0,
      Data: [],
      Message: `Choose either to decline or approve`,
    });
    return res.json({
      Status: 0,
      Message: `Choose either to decline or approve`,
      Data: [],
    });
  }

  //VALIDATE CARD ID
  let cardID = req.body.idNumber
  let countCard = (cardID.match(/\-/g) || []).length;
  if (status == 1 && countCard != 2 && countCard != 3) {
    console.log({
      Status: 0,
      Data: [],
      Message: `Invalid Ghana Card Number`,
    });
    return res.json({
      Status: 0,
      Message: `Invalid Ghana Card Number`,
      Data: [],
    });
  }
  let dbresult = await Model.FindGhanaCardCustomerAndProcess(id);
  if (!dbresult) {
    console.log({
      Status: 0,
      Data: [],
      Message: `No record found`,
    });
    return res.json({
      Status: 0,
      Message: `No record found`,
      Data: [],
    });
  }

  let customerExtraData = await Model.FindCustomer(dbresult.customerHash);
  let phone = customerExtraData.phone;
  let customerAccount = customerExtraData?.customerAccount;
  let customer = JSON.parse(dbresult?.customerGhanaCardData);
  let customerID = dbresult?.customerID;
  let email = dbresult?.email;
  let firstName = `${customer?.Details?.forenames}`;
  let issueDate = customer?.Details?.cardValidFrom || req.body.issueDate;
  let expiryDate = customer?.Details?.cardValidTo || req.body.expiryDate;
  let idNumber = customer?.Details?.nationalId || req.body.idNumber;
  let surname = `${customer?.Details?.surname}`;
  let idName = req.body.idName ? req.body.idName : `${firstName} ${surname}`;
  customerObject = { idName, issueDate, expiryDate, idNumber, customerID };

  let data = JSON.stringify({
    servicerequest: {
      ServiceID: accountServiceID,
      apiKey: apiKey,
      apiToken: apiToken,
    },
    RequestData: {
      idName,
      issueDate,
      expiryDate,
      idNumber,
      customerID,
    },
  });

  let config = {
    method: "post",
    url: `${appHiveUrl}payment/UpdateGhanaCard`,
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
    httpsAgent: hagent
  };

  //Set History Parameters
  historyObject.event = "Process Update Authorisation"
  historyObject.customerHash = dbresult.customerHash
  historyObject.userAgentHash = dbresult.userAgentHash
  historyObject.payload = JSON.stringify(req.body)
  //switch from status to approve or decline
  switch (status) {
    case 1:
      await approve(phone, idName, email, id, 1, updatedBy, historyObject)
      break;
    case 0:
      await decline(phone, idName, email, id, 0, declinedReason, updatedBy, historyObject)
      break;

    default:
      break;
  }


  async function approve(phone, idName, email, id, status, updatedBy, historyObject) {

    let response = await axios(config);
    let updatedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
    console.log(response.data);
    if (response.data && response.data.Status == 1) {
      //update customer update to processed
      let updatedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
      let updateBody = {
        updatedAt,
        status: "processed",
        updatedBy
      };

      let updateresult = await Model.UpdateProcess(updateBody, id);
      console.log(updateresult);
      if (updateresult.affectedRows === 1) {
       ///send elevy data 
       historyObject.response = `Authorised by ${updatedBy}`
       let historyresponse = await CatchHistory(historyObject);
       var elevydata = JSON.stringify({
        "issuerID": "300313",
        "accountType": "CUSTOMER",
        "accountNumber": customerAccount,
        "TIN": idNumber
      });
      
      console.log(`Pushing-->`,elevydata);
      var elevyconfig = {
        method: 'post',
        url: evelyUrl,
        headers: { 
          'Content-Type': 'application/json'
        },
        data : elevydata,
        httpsAgent: hagent
      };
  
      let elevyresponse = await axios(elevyconfig);
      if (elevyresponse.data && elevyresponse.data.Status == 1) {
          //set db status after updating
          updateBody.graStatus = 'processed'
          updateBody.graResponse = JSON.stringify(elevyresponse.data)
          let updatELEVYeresult = await Model.UpdateProcess(updateBody, id);
        console.log({
          Status: 1,
          Message: `Processed to elevy`,
          Data: elevyresponse.data,
          extResponse : updatELEVYeresult.affectedRows
        });
      }else{
        updateBody.graStatus = 'failed'
        updateBody.graResponse = JSON.stringify(elevyresponse.data)
        let updatELEVYeresult = await Model.UpdateProcess(updateBody, id);
        console.log({
          Status: 1,
          Message: `Could Not Process to elevy`,
          Data: elevyresponse.data,
          extResponse : updatELEVYeresult.affectedRows
        });
      }






        //Send otp
        //generate and send otp
        let otpresponse = await Notify(phone, idName, status);
        let emailresponse = await sendMail(idName, email);

        console.log({
          Status: 1,
          Message: `Process Update Completed`,
        });
        res.json({
          Status: 1,
          Message: `Process Update Completed`,
          Data: [],
        });
      } else {
        console.log({
          Status: 1,
          Message: `Process Update Failed`,
        });
        res.json({
          Status: 0,
          Message: `Process Update Failed`,
          Data: [],
        });
      }
    } else {
      let updateBody = {
        updatedAt,
        coreResponse: JSON.stringify(response.data),
        status: "hold"
    };

    let updateresult = await Model.UpdateProcess(updateBody, id);
    console.log(updateresult);
      console.log({
        Status: 1,
        Message: `Core Banking Update Failed for ${JSON.stringify(
          customerObject
        )}`,
      });
      res.json({
        Status: 0,
        Message: `Core Banking Update Failed for ${JSON.stringify(
          customerObject
        )}`,
        Data: [],
      });
    }
  }
  async function decline(phone, idName, email, id, status, declinedReason, updatedBy, historyObject) {

    if (!declinedReason) {
      console.log({
        Status: 0,
        Data: [],
        Message: `Please provide reason for declining this application`,
      });
      return res.json({
        Status: 0,
        Message: `Please provide reason for declining this application`,
        Data: [],
      });
    }
    historyObject.response = `Declined by ${updatedBy}`
    let historyresponse = await CatchHistory(historyObject);
    //update customer update to processed
    let updatedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
    let updateBody = {
      updatedAt,
      status: "declined",
      declinedReason,
      updatedBy
    };

    let updateresult = await Model.UpdateProcess(updateBody, id);
    if (updateresult.affectedRows === 1) {
      //Send otp
      //generate and send otp
      let otpresponse = await Notify(phone, idName, status);
      let emailresponse = await sendMail(email.replace(/^(.+)@(.+)$/g, '$1'), email, status, declinedReason);

      console.log({
        Status: 1,
        Message: `Process Decline Completed`,
      });
      res.json({
        Status: 1,
        Message: `Process Decline Completed`,
        Data: [],
      });
    } else {
      console.log({
        Status: 1,
        Message: `Process Decline Failed`,
      });
      res.json({
        Status: 0,
        Message: `Process Decline Failed`,
        Data: [],
      });
    }

  }


});

let historyObject = {
  fullName: "",
  customerHash: "",
  userAgentHash: "",
  event: "",
  payload: "",
  response: ""
}
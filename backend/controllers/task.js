const Model = require("../model/Cron");
const {
  appHiveUrl,
  apiKey,
  apiToken,
  accountServiceID,
  ServiceID
} = require("../myvars/module");
const asynHandler = require("../middleware/async");
const { Notify,CatchHistory } = require("../helper/funcs");
const { sendMail } = require("../helper/external");
const axios = require("axios");
const https = require('https');
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");
const stringSimilarity = require("string-similarity");
var FindFiles = require('file-regex')
const hagent = new https.Agent({  
  rejectUnauthorized: false
});
exports.ProcessUpdate = asynHandler(async (req, res, next) => {
  //get alert configurations
  //retrieve alert
  let dbresult = await Model.FindConfirmed();
  if (dbresult.length == 0) {
    console.log({
      Status: 0,
      Data: [],
      Message: `No record found`,
    });
  }

  //get details of customer ghana card
  for (const iterator of dbresult) {
    let customer = JSON.parse(iterator?.customerGhanaCardData);
    let customerID = iterator?.customerID;
    let firstName = `${customer?.Details?.forenames}`;
    let issueDate = customer?.Details?.cardValidFrom;
    let expiryDate = customer?.Details?.cardValidTo;
    let idNumber = customer?.Details?.nationalId;
    let surname = `${customer?.Details?.surname}`;
    let idName = `${firstName} ${surname}`;
    customerObject = { idName, issueDate, expiryDate, idNumber };
    let customerExtraData = await Model.FindCustomer(iterator.email);
    let phone = customerExtraData?.phone;
    let customerAccount = customerExtraData?.customerAccount;
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

    let response = await axios(config);
    

    if (response.data && response.data.Status == 1) {
      //update customer update to processed
      let updatedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
      let updateBody = {
        updatedAt,
        status: "processed"
      };

      let updateresult = await Model.Update(updateBody, iterator.id);
      if (updateresult.affectedRows === 1) {


        ///send elevy data 

        var elevydata = JSON.stringify({
          "issuerID": "300313",
          "accountType": "CUSTOMER",
          "accountNumber": customerAccount,
          "TIN": idNumber
        });
        
        console.log(`Pushing-->`,elevydata);
        var elevyconfig = {
          method: 'post',
          url: 'https://elevyapi.calbankgh.com/ELevyAPI/Reserve/submitDataToGRA',
          headers: { 
            'Content-Type': 'application/json'
          },
          data : elevydata,
          httpsAgent: hagent
        };
    
        let elevyresponse = await axios(elevyconfig);
        if (elevyresponse.data && elevyresponse.data.Status == 1) {
          console.log({
            Status: 1,
            Message: `Processed to elevy`,
            Data: elevyresponse.data,
          });
        }else{
          console.log({
            Status: 1,
            Message: `Could Not Process to elevy`,
            Data: elevyresponse.data,
          });
        }


        //elevy api
        let otpresponse = await Notify(phone, idName,1);
        let emailresponse = await sendMail(idName, iterator.email,1);
        console.log({
          Status: 1,
          Message: `Process Update Completed`,
        });
      } else {
        console.log({
          Status: 1,
          Message: `Process Update Failed`,
        });
      }
    } else {
      console.log({
        Status: 0,
        Message: `Core Banking Update Failed for ${JSON.stringify(customerObject)}`,
      });
    }
  }
});

exports.ProcessFailure = asynHandler(async (req, res, next) => {
  let historyObject = {
    fullName: "",
    customerHash: "",
    userAgentHash: "",
    event: "",
    payload: "",
    response: ""
  }
  let date = '2022-06-30 00:00:00';
  let message = '{"Status":0,"Message":"Could not process your request.","Details":null}';
  let status = 'pending'
  let dbresult = await Model.ProcessFailure(date,message,status);
  if (dbresult.length == 0) {
    console.log({
      Status: 0,
      Data: [],
      Message: `No record found`,
    });
  }
  
  for (const iterator of dbresult) {
    let pin = iterator.pin;
    let image = iterator.pin.replace(/\s/g,'').split('-')[1]
    let id = iterator.id;
    historyObject.event = "System Reprocessing Failure"

    historyObject.customerHash = iterator.customerHash
    historyObject.userAgentHash = iterator.userAgentHash
    let historyBody = {
      pin
    }
    historyObject.payload = JSON.stringify(historyBody)
    historyObject.fullName = iterator.fullName
    let updatedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
    const findImage = await FindFiles('../ghCardSelfie/',new RegExp(`\\b${image}\\b`, 'gi') )

    

  console.log('spliting,',image);
  if (findImage.length > 0) {
    console.log('found',findImage);
    console.log(`../ghCardSelfie/${findImage[0].file}`);
        //verify nia
  let data = new FormData();
  data.append(
    "file-data",
    fs.createReadStream(`../ghCardSelfie/${findImage[0].file}`)
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

try {
let response = await axios(config);
console.log(response.data);

if (response.data && response.data) {
  let ghcardname =
    response.data.Details !== null
      ? `${response.data.Details.forenames} ${response.data.Details.surname}`
      : "";
  var similarity = stringSimilarity.compareTwoStrings(
    iterator.fullName,
    ghcardname
  );

  console.log(similarity * 100);
  console.log(ghcardname);
  console.log(similarity * 100 > 70 ? "verified" : "pending");

  historyObject.response = `Name Check Score is: ${similarity * 100} and status is ${similarity * 100 > 70 ? "verified" : "pending"}`
  await CatchHistory(historyObject);
  //SAVE RESSULT
  let newData = {
    customerGhanaCardData: JSON.stringify(response.data),
    status: similarity * 100 > 70 ? "verified" : "pending",
    updatedAt
  };
  //check exisiting and save or update
  let updateresult = await Model.Update(newData, id);
  if (updateresult.affectedRows === 1 && response.data.Status == 1) {
    historyObject.response = `Process Completed and passed to job for processing`
    await CatchHistory(historyObject);
    console.log(
      "Process completed. We will notify you shortly",
      200,
    );
  }


} else {
  historyObject.response = `Verification Failed: Process Not completed`
  await CatchHistory(historyObject);
  console.log({
    Status: 0,
    Message: "Verification Failed for the customer",
    Data: [],
  });
}
} catch (error) {
console.log(error);
}
  }else{
    console.log('not found');
  }

 

    

 


  
  }
})

exports.ProcessPending = asynHandler(async (req, res, next) => {
  let historyObject = {
    fullName: "",
    customerHash: "",
    userAgentHash: "",
    event: "",
    payload: "",
    response: ""
  }
  let date = '2022-06-30 00:00:00';
  let message = '{"Status":0,"Message":"Could not process your request.","Details":null}';
  let status = 'pending'
  let dbresult = await Model.ProcessPendingFailure(status);
  if (dbresult.length == 0) {
    console.log({
      Status: 0,
      Data: [],
      Message: `No record found`,
    });
  }
  
  for (const iterator of dbresult) {
    let pin = iterator.pin;
    let image = iterator.pin.replace(/\s/g,'').split('-')[1]
    let id = iterator.id;
    historyObject.event = "System Reprocessing Failure"

    historyObject.customerHash = iterator.customerHash
    historyObject.userAgentHash = iterator.userAgentHash
    let historyBody = {
      pin
    }
    historyObject.payload = JSON.stringify(historyBody)
    historyObject.fullName = iterator.fullName
    let updatedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
    const findImage = await FindFiles('../ghCardSelfie/',new RegExp(`\\b${image}\\b`, 'gi') )

    

  console.log('spliting,',image);
  if (findImage.length > 0) {
    console.log('found',findImage);
    console.log(`../ghCardSelfie/${findImage[0].file}`);
        //verify nia
  let data = new FormData();
  data.append(
    "file-data",
    fs.createReadStream(`../ghCardSelfie/${findImage[0].file}`)
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

try {
let response = await axios(config);
console.log(response.data);

if (response.data && response.data) {
  let ghcardname =
    response.data.Details !== null
      ? `${response.data.Details.forenames} ${response.data.Details.surname}`
      : "";
  var similarity = stringSimilarity.compareTwoStrings(
    iterator.fullName,
    ghcardname
  );

  console.log(similarity * 100);
  console.log(ghcardname);
  console.log(similarity * 100 > 70 ? "verified" : "pending");

  historyObject.response = `Name Check Score is: ${similarity * 100} and status is ${similarity * 100 > 70 ? "verified" : "pending"}`
  await CatchHistory(historyObject);
  //SAVE RESSULT
  let newData = {
    customerGhanaCardData: JSON.stringify(response.data),
    status: similarity * 100 > 70 ? "verified" : "pending",
    updatedAt
  };
  //check exisiting and save or update
  let updateresult = await Model.Update(newData, id);
  if (updateresult.affectedRows === 1 && response.data.Status == 1) {
    historyObject.response = `Process Completed and passed to job for processing`
    await CatchHistory(historyObject);
    console.log(
      "Process completed. We will notify you shortly",
      200,
    );
  }


} else {
  historyObject.response = `Verification Failed: Process Not completed`
  await CatchHistory(historyObject);
  console.log({
    Status: 0,
    Message: "Verification Failed for the customer",
    Data: [],
  });
}
} catch (error) {
console.log(error);
}
  }else{
    console.log('not found');
  }

 

    

 


  
  }
})
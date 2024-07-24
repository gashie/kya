const Model = require("../model/Cron");
const {
    appHiveUrl,
    apiKey,
    apiToken,
    accountServiceID,
    ServiceID
} = require("../myvars/module");
const asynHandler = require("../middleware/async");
const { Notify, CatchHistory } = require("../helper/funcs");
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

async function ProcessResult(iterator) {
    let historyObject = {
        fullName: "",
        customerHash: "",
        userAgentHash: "",
        event: "",
        payload: "",
        response: ""
      }
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

async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));

}


async function runFunction() {
  
//get alert configurations
//retrieve alert
let dbresult = await Model.ProcessPendingFailure('pending');
if (dbresult.length == 0) {
    console.log({
        Status: 0,
        Data: [],
        Message: `No record found`,
    });
}

//get details of customer ghana card
console.log(dbresult.length);
for (const iterator of dbresult) {
  await ProcessResult(iterator);
  // await sleep(10000);
}
  }

  runFunction()
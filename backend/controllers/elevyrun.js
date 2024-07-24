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
const hagent = new https.Agent({
    rejectUnauthorized: false
});



async function ProcessResult(iterator) {
    let customer = JSON.parse(iterator?.customerGhanaCardData);
    let customerID = iterator?.customerID;
    let firstName = `${customer?.Details?.forenames}`;
    let issueDate = customer?.Details?.cardValidFrom;
    let expiryDate = customer?.Details?.cardValidTo;
    let idNumber = customer?.Details?.nationalId;
    let surname = `${customer?.Details?.surname}`;
    let idName = `${firstName} ${surname}`;
    customerObject = { idName, issueDate, expiryDate, idNumber };
  
    let phone = iterator?.phone


   try {
    console.log('calling axios');
    var elevydata = JSON.stringify({
        "issuerID": "300313",
        "accountType": "CUSTOMER",
        "accountNumber": iterator.customerAccount,
        "TIN": iterator.idNumber
      });
  
      console.log(`Pushing-->`,elevydata);
      var elevyconfig = {
        method: 'post',
        url: 'http://10.10.30.72/ELevyAPI/Reserve/submitDataToGRA',
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

   } catch (error) {
       console.log(error);
   }
    
}

async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));

}


async function runFunction() {
  
//get alert configurations
//retrieve alert
let dbresult = await Model.FetchAllVerified();
if (dbresult.length == 0) {
    console.log({
        Status: 0,
        Data: [],
        Message: `No record found`,
    });
}

//get details of customer ghana card
for (const iterator of dbresult) {
   
  await ProcessResult(iterator);
  await sleep(10000);
}
  }

  runFunction()
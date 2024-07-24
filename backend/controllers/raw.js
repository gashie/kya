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
    let customerExtraData = await Model.FindCustomer(iterator.email);
    let phone = customerExtraData?.phone
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

    console.log(data);
    let config = {
        method: "post",
        url: `${appHiveUrl}payment/UpdateGhanaCard`,
        headers: {
            "Content-Type": "application/json",
        },
        data: data,
        httpsAgent: hagent
    };

   try {
       console.log('calling axios');
    let response = await axios(config);

    console.log(response.data);


    let updatedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
    if (response.data && response.data.Status == 1) {
        //update customer update to processed
        let updateBody = {
            updatedAt,
            status: "processed"
        };

        let updateresult = await Model.Update(updateBody, iterator.id);
        if (updateresult.affectedRows === 1) {
            let otpresponse = await Notify(phone, idName, 1);
            let emailresponse = await sendMail(idName, iterator.email, 1);
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
        let updateBody = {
            updatedAt,
            coreResponse: JSON.stringify(response.data),
            status: "hold"
        };

        let updateresult = await Model.Update(updateBody, iterator.id);
        if (updateresult.affectedRows === 1) {
            console.log({
                Status: 1,
                Message: `Process UpdateHold Completed`,
            });
        } else {
            console.log({
                Status: 1,
                Message: `Process UpdateHold Failed`,
            });
        }
        console.log({
            Status: 0,
            Message: `Core Banking Update Failed for ${JSON.stringify(customerObject)}`,
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
   
  await ProcessResult(iterator);
  await sleep(10000);
}
  }

  runFunction()
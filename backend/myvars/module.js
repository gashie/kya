//module.js
let appHiveUrl = "https://apihive.calbankgh.com/api/";
let evelyUrl = 'https://elevyapi.calbankgh.com/ELevyAPI/Reserve/submitDataToGRA'

let ServiceID = "1023";
let apiKey = "0B52258F-9F88-4C64-A87E-E40358FD710C";
let apiToken = "156BCCA5-12D1-48AF-9E7A-251FD7CD8835";
let accountServiceID = "1007"
let smsServiceID = "1003"
let smsUrl = "https://apihive.calbankgh.com/api/apphive/sendsms"
let updateUrl = "https://apihive.calbankgh.com/api/payment/UpdateGhanaCard"
module.exports = {
  appHiveUrl,
  ServiceID,
  apiKey,
  apiToken,
  accountServiceID,
  smsServiceID,
  updateUrl,
  smsUrl,
  evelyUrl
};

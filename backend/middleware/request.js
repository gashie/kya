const asynHandler = require("./async");
const { CatchHistory } = require("../helper/funcs");

const Model = require("../model/Customer");
exports.checkCard = asynHandler(async (req, res, next) => {
  let pin = req.body.ghcardnumber;
    //VALIDATE CARD ID
    let countCard = (pin.match(/\-/g) || []).length;
    if (countCard != 2 && countCard != 3) {
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
  let custoemrData = req.kid;
  let dbresult = await Model.FindGhCard(pin, custoemrData.customerHash);

  if (dbresult) {
    return res.status(200).json({
      Status: 0,
      Data: [],
      Message: `Card already submitted for update. Kindly contact customer care`,
    });
  }
  next();
});


exports.ImageVerify = asynHandler(async (req, res, next) => {
  let historyObject = {
    fullName: "",
    customerHash: "",
    userAgentHash: "",
    event: "",
    payload: "",
    response: ""
  }
  let custoemrData = req.kid;
  let frontimage = req?.files?.frontimage;
  let backimage = req?.files?.backimage;
  let pin = req.body.ghcardnumber;
  var base64Str = req.body.image;

  //Set History Parameters
  historyObject.event = "Ghana CARD Verification"
  historyObject.customerHash = custoemrData.customerHash
  historyObject.userAgentHash = custoemrData.userAgentHash
  let historyBody = {
    pin
  }
  historyObject.payload = JSON.stringify(historyBody)
  historyObject.fullName = custoemrData.fullName

  if (!base64Str) {
    historyObject.response = "Customer Failed To Take Selfie"
    await CatchHistory(historyObject);
    return res.json({
      Status: 0,
      Message: "Sorry, Please Take Passport Image Of Yourself",
      Data: [],
    });
  }

  if (!pin) {
    historyObject.response = "Customer Failed To Provide Card Number"
    await CatchHistory(historyObject);
    return res.json({
      Status: 0,
      Message: "Sorry, Please Provide Ghana Card Number",
      Data: [],
    });
  }

  //VALIDATE CARD ID
  let countCard = (pin.match(/\-/g) || []).length;
  if (countCard != 2 && countCard != 3) {
    historyObject.response = "Invalid Ghana Card Number Structure"
    await CatchHistory(historyObject);
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
  //check files for
  if (!frontimage) {
    historyObject.response = "Front Image Copy is missing"
    await CatchHistory(historyObject);
    return res.json({
      Status: 0,
      Message: "Please upload front image of your Ghana Card",
      Data: [],
    });
  }

  if (!backimage) {
    historyObject.response = "Back Image Copy is missing"
    await CatchHistory(historyObject);
    return res.json({
      Status: 0,
      Message: "Please upload back image of your Ghana Card",
      Data: [],
    });
  }

  if (!frontimage.mimetype.startsWith("image")) {
    historyObject.response = "Front Image Copy is not an image file"
    await CatchHistory(historyObject);
    return res.json({
      Status: 0,
      Message: "Please upload an image file",
      Data: [],
    });
  }



  if (!backimage.mimetype.startsWith("image")) {
    historyObject.response = "Back Image copy is not an image file"
    await CatchHistory(historyObject);
    return res.json({
      Status: 0,
      Message: "Please upload an image file",
      Data: [],
    });
  }



  next()
})



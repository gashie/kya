const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const crypto = require("crypto");
const Model = require("../model/Customer");
const asynHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");

dotenv.config({ path: "./config/config.env" });

exports.protect = asynHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.sid) {
    token = req.cookies.sid;
  }

  console.log(req.cookies.sid);
  //make sure token exists
  if (!token) {
    console.log({
        Status: 0,
        Data: [],
        Message: `Not authorized to access this route decisive`,
      });
    return res.status(500).json({ Status: 0, Message: "Sorry Verification Failed" });
    
  }

  try {
    //Verify token
    const decoded = jwt.verify(token, process.env.JWTAUTH);
    let userAgentHash  = crypto.createHash("md5").update(JSON.stringify(req.useragent)).digest("hex");
    req.kid = await Model.FindHash(decoded.sub);
    console.log(req.kid);
    let checkReqAgent = req.kid.userAgentHash
    console.log(checkReqAgent);

    console.log(userAgentHash);
  if (checkReqAgent == userAgentHash) {
        return next();
        
    }
    console.log({
        Status: 0,
        Data: [],
        Message: `User hash mismatched`,
      });
 res.status(500).json({ Status: 0, Message: "Sorry Verification Failed" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ Status: 0, Message: "Sorry Verification Failed" });
    console.log({
      Status: 0,
      Data: [],
      Message: `Not authorized to access this route catched`,
    });
  }
});

exports.CheckCompleted = asynHandler(async (req, res, next) => {

  console.log(req.body);
  let result = await Model.Completed(req.body.account);
  console.log(result);
  if (!result) {
    return next();
    }

    res.status(500).json({ Status: 0, Message: "Sorry This account has already been processed by the bank" });
})
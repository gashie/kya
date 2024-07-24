const express = require("express");
const { protect,CheckCompleted } = require("../../middleware/protect");
const { AccountVal,OtpVal } = require("../../middleware/fire.schema");
const { checkCard,ImageVerify } = require("../../middleware/request");

const router = express.Router();
// App SETUP
const {
  CustomerUpdate,
  AllCustomers,
  ProcessCustomer,
  SingleCustomer,
  AllVerifiedCustomers,
  AllFailedCustomers,
  SystemUtility,
  VerifiedData
} = require("../../controllers/api");
const {
  AccountEnquiry
} = require("../../controllers/account");
const {
  VerifyOtp
} = require("../../controllers/otp");

//routes for apps

router.route("/").post(protect,ImageVerify,checkCard,CustomerUpdate);
router.route("/account").post(AccountVal,CheckCompleted,AccountEnquiry);
router.route("/otp").post(OtpVal,protect,VerifyOtp);
router.route("/all").post(AllCustomers);
router.route("/verified").post(AllVerifiedCustomers);
router.route("/failed").post(AllFailedCustomers);
router.route("/single").post(SingleCustomer);
router.route("/process").post(ProcessCustomer);
router.route("/utility").post(SystemUtility);
router.route("/vdata").post(VerifiedData);



module.exports = router;

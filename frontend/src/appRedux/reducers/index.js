import { combineReducers } from "redux";
import { VerifyCustomerGhCardReducer,VerifyAccountReducer,VerifyOtpReducer } from "./customerReducer";
export default combineReducers({
  verifyGhanaCard:VerifyCustomerGhCardReducer,
  verifyCustomerOtp: VerifyOtpReducer,
  verifyCustomerAccount:VerifyAccountReducer
});

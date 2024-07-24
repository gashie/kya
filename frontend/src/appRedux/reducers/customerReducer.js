import {
  VERIFY_GHANA_CARD_REQUEST,
  VERIFY_GHANA_CARD_SUCCESS,
  VERIFY_GHANA_CARD_FAIL,
  VERIFY_GHANA_CARD_RESET,
  VERIFY_ACCOUNT_REQUEST,
  VERIFY_ACCOUNT_SUCCESS,
  VERIFY_ACCOUNT_FAIL,
  VERIFY_ACCOUNT_RESET,
  VERIFY_OTP_REQUEST,
  VERIFY_OTP_SUCCESS,
  VERIFY_OTP_FAIL,
  VERIFY_OTP_RESET
  } from "../actions/type";
  
  
  export const VerifyCustomerGhCardReducer = (
    state = {
      verifyloading: false,
      verifyerror: null,
      verify: null,
    },
    action
  ) => {
    switch (action.type) {
      case VERIFY_GHANA_CARD_REQUEST:
        return { ...state, verifyloading: true };
      case VERIFY_GHANA_CARD_SUCCESS:
        return {
          ...state,
          verifyloading: false,
          verify: action.payload,
        };
      case VERIFY_GHANA_CARD_FAIL:
        return {
          ...state,
          verifyloading: false,
          verifyerror: action.payload,
        };
      case VERIFY_GHANA_CARD_RESET:
        return {};
  
      default:
        return state;
    }
  };
  
  export const VerifyAccountReducer = (
    state = {
      verifyloading: false,
      verifyerror: null,
      verify: null,
    },
    action
  ) => {
    switch (action.type) {
      case VERIFY_ACCOUNT_REQUEST:
        return { ...state, verifyloading: true };
      case VERIFY_ACCOUNT_SUCCESS:
        return {
          ...state,
          verifyloading: false,
          verify: action.payload,
        };
      case VERIFY_ACCOUNT_FAIL:
        return {
          ...state,
          verifyloading: false,
          verifyerror: action.payload,
        };
      case VERIFY_ACCOUNT_RESET:
        return {};
  
      default:
        return state;
    }
  };
  
  export const VerifyOtpReducer = (
    state = {
      verifyloading: false,
      verifyerror: null,
      verify: null,
    },
    action
  ) => {
    switch (action.type) {
      case VERIFY_OTP_REQUEST:
        return { ...state, verifyloading: true };
      case VERIFY_OTP_SUCCESS:
        return {
          ...state,
          verifyloading: false,
          verify: action.payload,
        };
      case VERIFY_OTP_FAIL:
        return {
          ...state,
          verifyloading: false,
          verifyerror: action.payload,
        };
      case VERIFY_OTP_RESET:
        return {};
  
      default:
        return state;
    }
  };
  
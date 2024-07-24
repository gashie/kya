import axios from "axios";
import {
  VERIFY_GHANA_CARD_REQUEST,
  VERIFY_GHANA_CARD_SUCCESS,
  VERIFY_GHANA_CARD_FAIL,
  VERIFY_ACCOUNT_REQUEST,
  VERIFY_ACCOUNT_SUCCESS,
  VERIFY_ACCOUNT_FAIL,
  VERIFY_OTP_REQUEST,
  VERIFY_OTP_SUCCESS,
  VERIFY_OTP_FAIL,
} from "./type";

export const VerifyCustomerGhanaCard = (formData) => async (dispatch) => {
  try {
    dispatch({
      type: VERIFY_GHANA_CARD_REQUEST,
    });

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

 

    const { data } = await axios.post("/api/v1/customer", formData, config);

    if (data.Status == 1) {
      dispatch({
        type: VERIFY_GHANA_CARD_SUCCESS,
        payload: data.Message,
      });
    } else {
      dispatch({
        type: VERIFY_GHANA_CARD_FAIL,
        payload: data.Message,
      });
    }
  } catch (error) {
    dispatch({
      type: VERIFY_GHANA_CARD_FAIL,
      payload: error.response && error.response.data.Message ? error.response.data.Message : error.Message,
    });
  }
};

export const VerifyAccount = (account, dob) => async (dispatch) => {
  try {
    dispatch({
      type: VERIFY_ACCOUNT_REQUEST,
    });

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const { data } = await axios.post("/api/v1/customer/account", account, dob, config);

    if (data.Status == 1) {
      dispatch({
        type: VERIFY_ACCOUNT_SUCCESS,
        payload: data,
      });
    } else {
      dispatch({
        type: VERIFY_ACCOUNT_FAIL,
        payload: data.Message,
      });
    }
  } catch (error) {
    dispatch({
      type: VERIFY_ACCOUNT_FAIL,
      payload: error.response && error.response.data.Message ? error.response.data.Message : error.Message,
    });
  }
};

export const VerifyOtp = (otp) => async (dispatch) => {
  try {
    dispatch({
      type: VERIFY_OTP_REQUEST,
    });

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const { data } = await axios.post("/api/v1/customer/otp", otp, config);

    if (data.Status == 1) {
      dispatch({
        type: VERIFY_OTP_SUCCESS,
        payload: data.Message,
      });
    } else {
      dispatch({
        type: VERIFY_OTP_FAIL,
        payload: data.Message,
      });
    }
  } catch (error) {
    dispatch({
      type: VERIFY_OTP_FAIL,
      payload: error.response && error.response.data.Message ? error.response.data.Message : error.Message,
    });
  }
};

// export const VerifyCustomerGhanaCard = (ghcard, image) => async (dispatch) => {
//   try {
//     dispatch({
//       type: VERIFY_GHANA_CARD_REQUEST,
//     });

//     const config = {
//       headers: {
//         "Content-Type": "application/json",
//       },
//     };

//     const { data } = await axios.post("/api/v1/customer", ghcard, image, config);

//     if (data.Status == 1) {
//       dispatch({
//         type: VERIFY_GHANA_CARD_SUCCESS,
//         payload: data.Message,
//       });
//     } else {
//       dispatch({
//         type: VERIFY_GHANA_CARD_FAIL,
//         payload: data.Message,
//       });
//     }
//   } catch (error) {
//     dispatch({
//       type: VERIFY_GHANA_CARD_FAIL,
//       payload: error.response && error.response.data.Message ? error.response.data.Message : error.Message,
//     });
//   }
// };
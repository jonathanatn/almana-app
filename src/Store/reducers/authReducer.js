import {
      LOGIN_ERROR,
      LOGIN_SUCCESS,
      SIGNOUT_ERROR,
      SIGNOUT_SUCCESS,
      SIGNUP_SUCCESS,
      SIGNUP_ERROR,
      RESET_AUTH_ERROR
} from '../actions/authAction';

function authReducer(state = { authError: null }, action) {
      switch (action.type) {
            case RESET_AUTH_ERROR:
                  return {
                        ...state,
                        authError: null
                  };
            case LOGIN_SUCCESS:
                  return {
                        ...state,
                        uid: action.user.uid,
                        authError: null
                  };
            case LOGIN_ERROR:
                  return {
                        ...state,
                        authError: action.err.message
                  };
            case SIGNUP_SUCCESS:
                  return {
                        ...state,
                        uid: action.user.uid,
                        authError: null
                  };
            case SIGNUP_ERROR:
                  return {
                        ...state,
                        authError: action.err.message
                  };
            case SIGNOUT_SUCCESS:
                  return {
                        ...state,
                        uid: null
                  };
            case SIGNOUT_ERROR:
                  return {
                        ...state
                  };
            default:
                  return state;
      }
}

export default authReducer;

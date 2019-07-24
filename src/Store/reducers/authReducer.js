import {
      LOGIN_ERROR,
      LOGIN_SUCCESS,
      SIGNOUT_ERROR,
      SIGNOUT_SUCCESS,
      SIGNUP_SUCCESS,
      SIGNUP_ERROR
} from '../actions/authAction';

function authReducer(state = { authError: null }, action) {
      switch (action.type) {
            case LOGIN_ERROR:
                  return {
                        ...state,
                        authError: 'Login failed'
                  };
            case LOGIN_SUCCESS:
                  return {
                        ...state,
                        authError: null
                  };
            case SIGNOUT_SUCCESS:
                  console.log(action.type);
                  return {
                        ...state
                  };
            case SIGNOUT_ERROR:
                  console.log(action.type);
                  return {
                        ...state
                  };
            case SIGNUP_SUCCESS:
                  console.log(action.type);
                  return {
                        ...state,
                        authError: null
                  };
            case SIGNUP_ERROR:
                  console.log(action.type);
                  return {
                        ...state,
                        authError: action.err.message
                  };
            default:
                  return state;
      }
}

export default authReducer;

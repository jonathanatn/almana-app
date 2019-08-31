import authReducer from './authReducer';
import taskReducer from './taskReducer';
import generalReducer from './generalReducer';
import { combineReducers } from 'redux';
import { firestoreReducer } from 'redux-firestore';
import { firebaseReducer } from 'react-redux-firebase';

const rootReducer = combineReducers({
      general: generalReducer,
      auth: authReducer,
      tasks: taskReducer,
      firestore: firestoreReducer,
      firebase: firebaseReducer
});

export default rootReducer;

import authReducer from './authReducer';
import taskReducer from './taskReducer';
import eventReducer from './eventReducer';
import generalReducer from './generalReducer';
import { combineReducers } from 'redux';
import { firestoreReducer } from 'redux-firestore';
import { firebaseReducer } from 'react-redux-firebase';

const rootReducer = combineReducers({
      general: generalReducer,
      auth: authReducer,
      tasks: taskReducer,
      events: eventReducer,
      firestore: firestoreReducer,
      firebase: firebaseReducer
});

export default rootReducer;

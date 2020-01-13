import authReducer from './authReducer';
import taskReducer from './taskReducer';
import eventReducer from './eventReducer';
import projectReducer from './projectReducer';
import generalReducer from './generalReducer';
// import notificationReducer from './notificationReducerDELETE';
import { combineReducers } from 'redux';
import { firestoreReducer } from 'redux-firestore';
import { firebaseReducer } from 'react-redux-firebase';

const rootReducer = combineReducers({
      general: generalReducer,
      //       notifications: notificationReducer,
      auth: authReducer,
      tasks: taskReducer,
      events: eventReducer,
      projects: projectReducer,
      firestore: firestoreReducer,
      firebase: firebaseReducer
});

export default rootReducer;

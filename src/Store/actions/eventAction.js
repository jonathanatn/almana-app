import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Platform, Alert } from 'react-native';
import * as Permissions from 'expo-permissions';
import { Notifications } from 'expo';
import { getPeriod, setLocalNotification } from '../../Utils/helpers';
import moment from 'moment';

// Create an id based on the beginning of the user id and a mix of random characters
// Set that id as a key for the firestore document and as a "id" field in the document for easier manipulation
export function addEventAction(event) {
      return async (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();
            const userId = getState().firebase.auth.uid;

            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let autoId = userId.substr(0, 16) + '_' + '';
            for (let i = 0; i < 16; i++) {
                  autoId += chars.charAt(Math.floor(Math.random() * chars.length));
            }

            const period = getPeriod(event.time);
            const dateAdded = new Date();

            dispatch({
                  type: ADD_EVENT,
                  payload: { id: autoId, uid: userId, event, type: 'event', period: period },
                  meta: {
                        offline: {
                              effect: firestore
                                    .collection('events')
                                    .doc(autoId)
                                    .set({
                                          // Meta
                                          dateAdded: dateAdded,
                                          id: autoId,
                                          uid: userId,
                                          // Property
                                          type: 'event',
                                          name: event.name,
                                          date: event.date,
                                          time: event.time,
                                          endTime: event.endTime,
                                          reminder: event.reminder,
                                          period: period,
                                          position: event.position,
                                          subtask: { ...event.subtask }
                                    })
                              // rollback: { type: ADD_TASK_ROLLBACK, meta: { id: autoId, uid: userId, task } }
                        }
                  }
            });

            let reminderId;
            console.log(event.reminder.time);
            if (event.reminder.time !== 'none') {
                  await setLocalNotification(id, name, date, time, reminder).then(id => (reminderId = id));
            } else {
                  reminderId = '';
            }

            event.reminder.id = reminderId;

            dispatch(setEventReminderAction(autoId, event.reminder));
      };
}

export const SET_EVENT_REMINDER = 'SET_EVENT_REMINDER';
export function setEventReminderAction(id, reminder) {
      return dispatch => {
            dispatch({
                  type: SET_EVENT_REMINDER,
                  id: id,
                  reminder: reminder
            });

            // // Formatting date for new Date
            // let year = date.substring(6);
            // let month = date.substring(0, 2);
            // let day = date.substring(3, 5);

            // // Formatting time for new Date
            // let time24h = moment(time, 'h:mm A').format('HH:mm:ss');
            // let hour = time24h.substring(0, 2);
            // let minute = time24h.substring(3, 5);

            // let reminderDate;

            // if (reminder.time === '1-hour') {
            //       reminderDate = new Date(year, parseInt(month, 10) - 1, day, parseInt(hour, 10) - 1, minute);
            //       // console.log('reminder 1hour');
            // } else if (reminder.time === '3-hour') {
            //       reminderDate = new Date(year, parseInt(month, 10) - 1, day, parseInt(hour, 10) - 3, minute);
            //       // console.log('reminder 3hour');
            // } else if (reminder.time === '1-day') {
            //       reminderDate = new Date(year, parseInt(month, 10) - 1, parseInt(day, 10) - 1, hour, minute);
            //       // console.log('reminder 1day');
            // } else if (reminder.time === '3-day') {
            //       reminderDate = new Date(year, parseInt(month, 10) - 1, parseInt(day, 10) - 3, hour, minute);
            //       // console.log('reminder 3day');
            // }

            // let today = new Date();
            // let idReminder;

            // // If the reminder have an idea it mean it had a reminder setted so we clear it
            // if (reminder.id !== '') {
            //       console.log(reminder.id);
            //       Notifications.cancelScheduledNotificationAsync(reminder.id);
            // }

            // // If the reminde is not 'none' and if the reminder is not set in the past
            // if (reminder.time !== 'none' && today < reminderDate) {
            //       // console.log('reminder set');
            //       Notifications.scheduleLocalNotificationAsync(
            //             {
            //                   title: name,
            //                   body: time
            //             },
            //             {
            //                   time: reminderDate
            //             }
            //       ).then(e => {
            //             idReminder = e;
            //             // console.log(idReminder);
            //             dispatch({
            //                   type: SET_EVENT_REMINDER,
            //                   id: id,
            //                   reminder: {
            //                         time: reminder.time,
            //                         id: idReminder
            //                   }
            //             });
            //       });
            // } else {
            //       console.log('reminder none');
            //       // If the reminder is === 'none', we simply dispatch the action
            //       dispatch({
            //             type: SET_EVENT_REMINDER,
            //             id: id,
            //             reminder: {
            //                   time: reminder.time,
            //                   id: ''
            //             }
            //       });
            // }

            // const { status, permissions } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
            // if (status === 'granted') {

            // } else {
            //       throw new Error('Location permission not granted');
            // }
      };
}

export function editEventNameAction(name, id, previousName) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();

            dispatch({
                  type: EDIT_EVENT_NAME,
                  payload: { name, id },
                  meta: {
                        offline: {
                              effect: firestore
                                    .collection('events')
                                    .doc(id)
                                    .set({ name: name }, { merge: true })
                              // rollback: { type: EDIT_TASK_NAME_ROLLBACK, meta: { id, previousName } }
                        }
                  }
            });
      };
}

export function syncEventNameAction(name, id) {
      return dispatch => {
            dispatch({
                  type: SYNC_EVENT_NAME,
                  name: name,
                  id: id
            });
      };
}

// export function editTaskCompletionAction(completion, id) {
//       return (dispatch, getState, { getFirebase, getFirestore }) => {
//             const firestore = getFirestore();

//             dispatch({
//                   type: EDIT_TASK_COMPLETION,
//                   payload: { completion, id },
//                   meta: {
//                         offline: {
//                               effect: firestore
//                                     .collection('events')
//                                     .doc(id)
//                                     .set({ completed: !completion }, { merge: true })
//                                     .catch(err => {
//                                           console.log(err);
//                                     });
//                               // rollback: { type: EDIT_TASK_COMPLETION_ROLLBACK, meta: { completion, id } }
//                         }
//                   }
//             });
//       };
// }

export function deleteEventAction(event) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();

            dispatch({
                  type: DELETE_EVENT,
                  payload: { id: event.id, event },
                  meta: {
                        offline: {
                              effect: firestore
                                    .collection('events')
                                    .doc(event.id)
                                    .delete()
                              // .catch(err => {
                              //       console.log(err);
                              // })
                              // rollback: { type: DELETE_TASK_ROLLBACK, meta: { task } }
                              // commit: { type: 'EDIT_TASK_COMPLETION', meta: { completion, id } }
                        }
                  }
            });
      };
}

export function editEventStartTimeAction(time, endTime, id) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();

            const period = getPeriod(time);

            dispatch({
                  type: EDIT_EVENT_START_TIME,
                  payload: { time, endTime, id, period: period },
                  meta: {
                        offline: {
                              effect: firestore
                                    .collection('events')
                                    .doc(id)
                                    .set(
                                          { time: time, endTime: endTime, position: -1, period: period },
                                          { merge: true }
                                    )
                              // .catch(err => {
                              //       console.log(err);
                              // })
                              // commit: { type: 'EDIT_TASK_COMPLETION', meta: { completion, id } }
                              // rollback: { type: 'EDIT_TASK_COMPLETION', meta: { completion, id } }
                        }
                  }
            });
      };
}

export function editEventEndTimeAction(endTime, id) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();

            dispatch({
                  type: EDIT_EVENT_END_TIME,
                  payload: { endTime, id },
                  meta: {
                        offline: {
                              effect: firestore
                                    .collection('events')
                                    .doc(id)
                                    .set({ endTime: endTime, position: -1 }, { merge: true })
                              // commit: { type: 'EDIT_TASK_COMPLETION', meta: { completion, id } }
                              // rollback: { type: 'EDIT_TASK_COMPLETION', meta: { completion, id } }
                        }
                  }
            });
      };
}

export function editEventDateAction(date, id) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();

            dispatch({
                  type: EDIT_EVENT_DATE,
                  payload: { date, id },
                  meta: {
                        offline: {
                              effect: firestore
                                    .collection('events')
                                    .doc(id)
                                    // Position is put to -1 so when our component re-build, he knows that he have to re-sort that task
                                    .set({ date: date, position: -1 }, { merge: true })
                              // commit: { type: 'EDIT_TASK_COMPLETION', meta: { completion, id } }
                              // rollback: { type: 'EDIT_TASK_COMPLETION', meta: { completion, id } }
                        }
                  }
            });
      };
}

export function editEventsPositionAction(events) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();

            events.map(item => {
                  dispatch({
                        type: EDIT_EVENTS_POSITION,
                        payload: { id: item.id, position: item.position },
                        meta: {
                              offline: {
                                    effect: firestore
                                          .collection('events')
                                          .doc(item.id)
                                          .set({ position: item.position }, { merge: true })
                                    // .catch(err => {
                                    //       console.log(err);
                                    // })
                                    // commit: { type: 'EDIT_TASK_COMPLETION', meta: { completion, id } }
                                    // rollback: { type: 'EDIT_TASK_COMPLETION', meta: { completion, id } }
                              }
                        }
                  });
            });
      };
}

export const ADD_EVENT = 'ADD_EVENT';
export const ADD_EVENT_ROLLBACK = 'ADD_EVENT_ROLLBACK';

export const EDIT_EVENT_NAME = 'EDIT_EVENT_NAME';
export const EDIT_EVENT_NAME_ROLLBACK = 'EDIT_EVENT_NAME_ROLLBACK';
export const SYNC_EVENT_NAME = 'SYNC_EVENT_NAME';

export const EDIT_EVENT_COMPLETION = 'EDIT_EVENT_COMPLETION';
export const EDIT_EVENT_COMPLETION_ROLLBACK = 'EDIT_EVENT_COMPLETION_ROLLBACK';

export const EDIT_EVENT_DATE = 'EDIT_EVENT_DATE';
export const EDIT_EVENT_DATE_ROLLBACK = 'EDIT_EVENT_DATE_ROLLBACK';

export const EDIT_EVENT_START_TIME = 'EDIT_EVENT_START_TIME';
export const EDIT_EVENT_TIME_ROLLBACK = 'EDIT_EVENT_TIME_ROLLBACK';

export const EDIT_EVENT_END_TIME = 'EDIT_EVENT_END_TIME';

export const EDIT_EVENTS_POSITION = 'EDIT_EVENTS_POSITION';
export const EDIT_EVENTS_POSITION_ROLLBACK = 'EDIT_EVENTS_POSITION_ROLLBACK';

export const DELETE_EVENT = 'DELETE_EVENT';
export const DELETE_EVENT_ROLLBACK = 'DELETE_EVENT_ROLLBACK';

export const RECEIVE_TASKS = 'RECEIVE_TASKS';

export const ADD_TASK = 'ADD_TASK';
export const ADD_TASK_ROLLBACK = 'ADD_TASK_ROLLBACK';

export const EDIT_TASK_NAME = 'EDIT_TASK_NAME';
export const EDIT_TASK_NAME_ROLLBACK = 'EDIT_TASK_NAME_ROLLBACK';
export const SYNC_TASK_NAME = 'SYNC_TASK_NAME';

export const EDIT_TASK_COMPLETION = 'EDIT_TASK_COMPLETION';
export const EDIT_TASK_COMPLETION_ROLLBACK = 'EDIT_TASK_COMPLETION_ROLLBACK';

export const EDIT_TASK_DATE = 'EDIT_TASK_DATE';
export const EDIT_TASK_DATE_ROLLBACK = 'EDIT_TASK_DATE_ROLLBACK';

export const EDIT_TASK_TIME = 'EDIT_TASK_TIME';
export const EDIT_TASK_TIME_ROLLBACK = 'EDIT_TASK_TIME_ROLLBACK';

export const EDIT_TASKS_POSITION = 'EDIT_TASKS_POSITION';
export const EDIT_TASKS_POSITION_ROLLBACK = 'EDIT_TASKS_POSITION_ROLLBACK';

export const EDIT_TASK_PERIOD = 'EDIT_TASK_PERIOD';

export const DELETE_TASK_ROLLBACK = 'DELETE_TASK_ROLLBACK';

export const DELETE_TASK_TIME = 'DELETE_TASK_TIME';

import { getPeriod } from '../../Utils/helpers';

// FIXME:
// For the moment I get my items with mapState in ItemList
// In the future, to be sure that Firestore is the source of truth, we should effect a firestore request with redux offline
// To not make useless request we should create a token system that let us know if the store and firestore are not sync
// The dispatch can be done in setDateSelectedDateMoverAction in generalAction.js
// export function receiveTasksAction(date) {
//       return (dispatch, getState, { getFirebase, getFirestore }) => {
//             const firestore = getFirestore();

//             dispatch({
//                   type: RECEIVE_TASKS,
//                   payload: { date, uid: getState().auth.uid },
//                   meta: {
//                         offline: {
//                               // effect:
//                               // rollback: { type: ADD_TASK_ROLLBACK, meta: { id: autoId, uid: userId, task } }
//                         }
//                   }
//             });

//             // firestore
//             //       .collection('tasks')
//             //       .where('uid', '==', getState().auth.uid)
//             //       .where('date', '==', date)
//             //       .get()
//             //       .catch(error => {
//             //             throw new Error('Error: Getting document:');
//             //       })
//             //       .then(function(querySnapshot) {
//             //             let tasks = {};
//             //             querySnapshot.forEach(function(doc) {
//             //                   tasks = Object.assign(tasks, { [doc.id]: doc.data() });
//             //             });
//             //             console.log('RECEIVE TASK: ', tasks);
//             //             // dispatch({
//             //             //       type: RECEIVE_TASKS,
//             //             //       tasks: tasks
//             //             // });
//             //       })
//             //       .catch(err => {
//             //             throw new Error(err);
//             //       });
//       };
// }

// Create an id based on the beginning of the user id and a mix of random characters
// Set that id as a key for the firestore document and as a "id" field in the document for easier manipulation
export function addTaskAction(task) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();
            const userId = getState().firebase.auth.uid;

            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let autoId = userId.substr(0, 16) + '_' + '';
            for (let i = 0; i < 16; i++) {
                  autoId += chars.charAt(Math.floor(Math.random() * chars.length));
            }

            dispatch({
                  type: ADD_TASK,
                  payload: { id: autoId, uid: userId, task },
                  meta: {
                        offline: {
                              effect: firestore
                                    .collection('tasks')
                                    .doc(autoId)
                                    .set({
                                          id: autoId,
                                          uid: userId,
                                          type: task.type,
                                          name: task.name,
                                          completed: task.completed, //boolean
                                          subtask: { ...task.subtask },
                                          date: task.date,
                                          time: task.time,
                                          reminder: task.reminder,
                                          repeat: task.repeat,
                                          labels: task.labels, //Array
                                          dateAdded: task.dateAdded,
                                          position: task.position,
                                          project: task.project
                                    })
                              // rollback: { type: ADD_TASK_ROLLBACK, meta: { id: autoId, uid: userId, task } }
                        }
                  }
            });
      };
}

//FIXME: Not send online (think about the rollback before)
export const SET_TASK_REMINDER = 'SET_TASK_REMINDER';
export function setTaskReminderAction(id, reminder) {
      return dispatch => {
            dispatch({
                  type: SET_TASK_REMINDER,
                  id: id,
                  reminder: reminder
            });
      };
}

export const SET_TASK_REPEAT = 'SET_TASK_REPEAT';
export function setTaskRepeatAction(id, repeat) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();

            dispatch({
                  type: SET_TASK_REPEAT,
                  payload: { id, repeat },
                  meta: {
                        offline: {
                              effect: firestore
                                    .collection('tasks')
                                    .doc(id)
                                    .set({ repeat: repeat }, { merge: true })
                              // rollback: { type: EDIT_TASK_NAME_ROLLBACK, meta: { id, previousName } }
                        }
                  }
            });
      };
}

export function editTaskNameAction(name, id, previousName) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();

            dispatch({
                  type: EDIT_TASK_NAME,
                  payload: { name, id },
                  meta: {
                        offline: {
                              effect: firestore
                                    .collection('tasks')
                                    .doc(id)
                                    .set({ name: name }, { merge: true })
                              // rollback: { type: EDIT_TASK_NAME_ROLLBACK, meta: { id, previousName } }
                        }
                  }
            });
      };
}

// Serve to sync the name of a task in a FlatList, when we change it's name, so we avoid sending firestore request at every letter change
export function syncTaskNameAction(name, id) {
      return dispatch => {
            dispatch({
                  type: SYNC_TASK_NAME,
                  name: name,
                  id: id
            });
      };
}

export function editTaskCompletionAction(completion, id) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();

            dispatch({
                  type: EDIT_TASK_COMPLETION,
                  payload: { completion, id },
                  meta: {
                        offline: {
                              effect: firestore
                                    .collection('tasks')
                                    .doc(id)
                                    .set({ completed: !completion }, { merge: true })
                              // rollback: { type: EDIT_TASK_COMPLETION_ROLLBACK, meta: { completion, id } }
                        }
                  }
            });
      };
}

export const ADD_REPEATEDTASK_COMPLETION = 'ADD_REPEATEDTASK_COMPLETION';
export function addRepeatedTaskCompletionAction(id, date, datesArray) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();

            let newDatesArray = [...datesArray];
            newDatesArray = newDatesArray.filter(item => {
                  return item !== date;
            });
            newDatesArray.push(date);

            dispatch({
                  type: ADD_REPEATEDTASK_COMPLETION,
                  payload: { id, newDatesArray },
                  meta: {
                        offline: {
                              effect: firestore
                                    .collection('tasks')
                                    .doc(id)
                                    .set({ completedArray: newDatesArray }, { merge: true })
                        }
                  }
            });
      };
}

export const DELETED_REPEATEDTASK_COMPLETION = 'DELETED_REPEATEDTASK_COMPLETION';
export function deleteRepeatedTaskCompletionAction(id, date, datesArray) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();

            let newDatesArray = [...datesArray];
            newDatesArray = newDatesArray.filter(item => {
                  return item !== date;
            });

            dispatch({
                  type: DELETED_REPEATEDTASK_COMPLETION,
                  payload: { id, newDatesArray },
                  meta: {
                        offline: {
                              effect: firestore
                                    .collection('tasks')
                                    .doc(id)
                                    .set({ completedArray: newDatesArray }, { merge: true })
                        }
                  }
            });
      };
}

export const RESET_REPEATEDTASK_COMPLETION = 'RESET_REPEATEDTASK_COMPLETION';
export function resetRepeatedTaskCompletionAction(id) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();

            dispatch({
                  type: RESET_REPEATEDTASK_COMPLETION,
                  payload: { id },
                  meta: {
                        offline: {
                              effect: firestore
                                    .collection('tasks')
                                    .doc(id)
                                    .set({ completedArray: [] }, { merge: true })
                        }
                  }
            });
      };
}

export const DELETE_TASKS = 'DELETE_TASKS';
export function deleteTasksAction(tasks) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();
            tasks.map(item => {
                  dispatch({
                        type: DELETE_TASKS,
                        payload: { id: item.id, item },
                        meta: {
                              offline: {
                                    effect: firestore
                                          .collection('tasks')
                                          .doc(item.id)
                                          .delete()
                                    // rollback: { type: DELETE_TASK_ROLLBACK, meta: { task } }
                                    // .catch(err => {
                                    //       console.log(err);
                                    // });
                                    // commit: { type: 'EDIT_TASK_COMPLETION', meta: { completion, id } }
                              }
                        }
                  });
            });
      };
}

export function editTaskTimeAction(time, id) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();
            dispatch({
                  type: EDIT_TASK_TIME,
                  payload: { time, id },
                  meta: {
                        offline: {
                              effect: firestore
                                    .collection('tasks')
                                    .doc(id)
                                    .set({ time: time }, { merge: true })
                                    .catch(err => {
                                          console.log(err);
                                    })
                              // commit: { type: 'EDIT_TASK_COMPLETION', meta: { completion, id } }
                              // rollback: { type: 'EDIT_TASK_COMPLETION', meta: { completion, id } }
                        }
                  }
            });
      };
}

export function deleteTaskTimeAction(id, reminder, repeat) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();

            // const time = '';

            dispatch({
                  type: DELETE_TASK_TIME,
                  payload: { id, reminder, repeat },
                  meta: {
                        offline: {
                              effect: firestore
                                    .collection('tasks')
                                    .doc(id)
                                    .set({ time: '', reminder: reminder, repeat: repeat }, { merge: true })
                                    .catch(err => {
                                          console.log(err);
                                    })
                              // commit: { type: 'EDIT_TASK_COMPLETION', meta: { completion, id } }
                              // rollback: { type: 'EDIT_TASK_COMPLETION', meta: { completion, id } }
                        }
                  }
            });
      };
}

export function editTaskDateAction(date, id) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();

            dispatch({
                  type: EDIT_TASK_DATE,
                  payload: { date, id },
                  meta: {
                        offline: {
                              effect: firestore
                                    .collection('tasks')
                                    .doc(id)
                                    // Position is put to -1 so when our component re-build, he knows that he have to re-sort that task
                                    .set({ date: date }, { merge: true })
                              // .catch(err => {
                              //       console.log(err);
                              // });
                              // commit: { type: 'EDIT_TASK_COMPLETION', meta: { completion, id } }
                              // rollback: { type: 'EDIT_TASK_COMPLETION', meta: { completion, id } }
                        }
                  }
            });
      };
}

export function editTaskPeriodAction(period, id) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();

            dispatch({
                  type: EDIT_TASK_PERIOD,
                  payload: { period, id },
                  meta: {
                        offline: {
                              effect: firestore
                                    .collection('tasks')
                                    .doc(id)
                                    // Position is put to -1 so when our component re-build, he knows that he have to re-sort that task
                                    .set({ period: period }, { merge: true })
                              // .catch(err => {
                              //       console.log(err);
                              // });
                              // commit: { type: 'EDIT_TASK_COMPLETION', meta: { completion, id } }
                              // rollback: { type: 'EDIT_TASK_COMPLETION', meta: { completion, id } }
                        }
                  }
            });
      };
}

// Receive an object who is the date and replace it in the store
// Send something different on firestore
// TODO: Explain the whole system behind position editing
// export function editTasksPositionAction(tasks) {
//       return dispatch => {
//             tasks.map(item => {
//                   dispatch({
//                         type: EDIT_TASKS_POSITION,
//                         id: item.id,
//                         position: item.position
//                   });
//             });
//       };
// }

export const EDIT_TASK_POSITION = 'EDIT_TASK_POSITION';
export function editTaskPositionAction(id, position) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();

            dispatch({
                  type: EDIT_TASK_POSITION,
                  payload: { id: id, position: position },
                  meta: {
                        offline: {
                              effect: firestore
                                    .collection('tasks')
                                    .doc(id)
                                    .set({ position: position }, { merge: true })
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

export function editTasksPositionAction(tasks) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();

            tasks.map(item => {
                  dispatch({
                        type: EDIT_TASKS_POSITION,
                        payload: { id: item.id, position: item.position },
                        meta: {
                              offline: {
                                    effect: firestore
                                          .collection('tasks')
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

// Edit the position inside task's project
export const EDIT_PROJECT_TASKS_POSITION = 'EDIT_PROJECT_TASKS_POSITION';
export function editProjectPositionTasksAction(tasks) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();

            tasks.map(item => {
                  dispatch({
                        type: EDIT_PROJECT_TASKS_POSITION,
                        payload: { id: item.id, project: item.project },
                        meta: {
                              offline: {
                                    effect: firestore
                                          .collection('tasks')
                                          .doc(item.id)
                                          .set({ project: item.project }, { merge: true })
                              }
                        }
                  });
            });
      };
}

// export function editTaskNameAction(name, id) {
//       return dispatch => {
//             dispatch({
//                   type: EDIT_TASK_NAME,
//                   name: name,
//                   id: id
//             });
//       };
// }

// export function editTaskCompletionAction(completion, id) {
//       return dispatch => {
//             dispatch({
//                   type: EDIT_TASK_COMPLETION,
//                   completion: completion,
//                   id: id
//             });
//       };
// }

// export function deleteTaskAction(id) {
//       return dispatch => {
//             dispatch({
//                   type: DELETE_TASK,
//                   id: id
//             });
//       };
// }

// export function editTaskTimeAction(time, id) {
//       return dispatch => {
//             dispatch({
//                   type: EDIT_TASK_TIME,
//                   time: time,
//                   id: id
//             });
//       };
// }

// export function editTaskDateAction(date, id) {
//       return dispatch => {
//             dispatch({
//                   type: EDIT_TASK_DATE,
//                   date: date,
//                   id: id
//             });
//       };
// }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////Old db implementation//////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// export function receiveTasksAction(date) {
//       return (dispatch, getState, { getFirebase, getFirestore }) => {
//             const firestore = getFirestore();
//             const collection = 'tasks';

//             firestore
//                   .collection(collection)
//                   .where('date', '==', date)
//                   .get()
//                   .catch(error => {
//                         throw new Error('Error: Getting document:');
//                   })
//                   .then(function(querySnapshot) {
//                         let tasks = {};
//                         querySnapshot.forEach(function(doc) {
//                               tasks = Object.assign(tasks, { [doc.id]: doc.data() });
//                         });
//                         dispatch({
//                               type: RECEIVE_TASKS,
//                               tasks: tasks
//                         });
//                   })
//                   .catch(err => {
//                         throw new Error(err);
//                   });
//       };
// }

// export function addTaskAction(task) {
//       return (dispatch, getState, { getFirebase, getFirestore }) => {
//             const firestore = getFirestore();
//             const userId = getState().firebase.auth.uid;

//             dispatch({
//                   type: ADD_TASK,
//                   id: docRef.id,
//                   task: task
//             });

//             firestore
//                   .collection('tasks')
//                   .add({
//                         uid: userId,
//                         name: task.name,
//                         completed: task.completed, //boolean
//                         subtask: { ...task.subtask },
//                         date: task.date,
//                         time: task.time,
//                         reminder: task.reminder,
//                         reccurency: task.reccurency,
//                         labels: task.labels, //Array
//                         projectId: task.projectId,
//                         dateAdded: task.dateAdded,
//                         position: task.position
//                   })
//                   .then(function(docRef) {
//                         dispatch({
//                               type: ADD_TASK,
//                               id: docRef.id,
//                               task: task
//                         });
//                   })
//                   .catch(err => {
//                         console.log(err);
//                   });
//       };
// }

// export function editTaskNameAction(name, id) {
//       return (dispatch, getState, { getFirebase, getFirestore }) => {
//             const firestore = getFirestore();

//             firestore
//                   .collection('tasks')
//                   .doc(id)
//                   .set({ name: name }, { merge: true })
//                   .then(() => {
//                         dispatch({
//                               type: EDIT_TASK_NAME,
//                               name: name,
//                               id: id
//                         });
//                   })
//                   .catch(err => {
//                         console.log(err);
//                   });
//       };
// }

// export function editTaskCompletionAction(state, id) {
//       return (dispatch, getState, { getFirebase, getFirestore }) => {
//             const firestore = getFirestore();

//             console.log(state);
//             console.log(id);

//             firestore
//                   .collection('tasks')
//                   .doc(id)
//                   .set({ completed: !state }, { merge: true })
//                   .catch(err => {
//                         console.log(err);
//                   });
//       };
// }

// export function deleteTaskAction(id) {
//       return (dispatch, getState, { getFirebase, getFirestore }) => {
//             const firestore = getFirestore();

//             firestore
//                   .collection('tasks')
//                   .doc(id)
//                   .delete()
//                   .then(
//                         dispatch({
//                               type: DELETE_TASK,
//                               id: id
//                         })
//                   )
//                   .catch(err => {
//                         console.log(err);
//                   });
//       };
// }

// export function editTaskTimeAction(time, id) {
//       return (dispatch, getState, { getFirebase, getFirestore }) => {
//             const firestore = getFirestore();

//             firestore
//                   .collection('tasks')
//                   .doc(id)
//                   .set({ time: time }, { merge: true })
//                   .then(
//                         dispatch({
//                               type: EDIT_TASK_TIME,
//                               time: time,
//                               id: id
//                         })
//                   )
//                   .catch(err => {
//                         console.log(err);
//                   });
//       };
// }

// export function editTaskDateAction(date, id) {
//       return (dispatch, getState, { getFirebase, getFirestore }) => {
//             const firestore = getFirestore();

//             firestore
//                   .collection('tasks')
//                   .doc(id)
//                   .set({ date: date }, { merge: true })
//                   .then(
//                         dispatch({
//                               type: EDIT_TASK_DATE,
//                               date: date,
//                               id: id
//                         })
//                   )
//                   .catch(err => {
//                         console.log(err);
//                   });
//       };
// }

// // Receive an object who is the date and replace it in the store
// // Send something different on firestore

// export function editTasksPositionAction(tasks) {
//       return (dispatch, getState, { getFirebase, getFirestore }) => {
//             const firestore = getFirestore();

//             tasks.map(item => {
//                   firestore
//                         .collection('tasks')
//                         .doc(item.id)
//                         .set({ position: item.position }, { merge: true })
//                         .catch(err => {
//                               console.log(err);
//                         });
//             });

//             tasks.map(item => {
//                   dispatch({
//                         type: EDIT_TASKS_POSITION,
//                         id: item.id,
//                         position: item.position
//                   });
//             });
//       };
// }

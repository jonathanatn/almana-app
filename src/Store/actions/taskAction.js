// TODO: Redux implementation is a mess
// TODO: Manage success and failure in reducer

export const RECEIVE_TASKS = 'RECEIVE_TASKS';
export const ADD_TASK = 'ADD_TASK';
export const EDIT_TASK_NAME = 'EDIT_TASK_NAME';
export const EDIT_TASK_COMPLETION = 'EDIT_TASK_COMPLETION';
export const EDIT_TASK_DATE = 'EDIT_TASK_DATE';
export const EDIT_TASK_TIME = 'EDIT_TASK_TIME';
export const EDIT_TASKS_POSITION = 'EDIT_TASKS_POSITION';
export const DELETE_TASK = 'DELETE_TASK';

export function addTaskAction(task) {
      let idGenerator = function() {
            return (
                  '_' +
                  Math.random()
                        .toString(36)
                        .substr(2, 9)
            );
      };

      const taskId = idGenerator();

      return dispatch => {
            dispatch({
                  type: ADD_TASK,
                  id: taskId,
                  task: task
            });
      };
}

// TODO: Make the dispatch
export function editTaskNameAction(name, id) {
      return dispatch => {
            dispatch({
                  type: EDIT_TASK_NAME,
                  name: name,
                  id: id
            });
      };
}

// TODO: Make the dispatch
export function editTaskCompletionAction(completion, id) {
      return dispatch => {
            dispatch({
                  type: EDIT_TASK_COMPLETION,
                  completion: completion,
                  id: id
            });
      };
}

export function deleteTaskAction(id) {
      return dispatch => {
            dispatch({
                  type: DELETE_TASK,
                  id: id
            });
      };
}

export function editTaskTimeAction(time, id) {
      return dispatch => {
            dispatch({
                  type: EDIT_TASK_TIME,
                  time: time,
                  id: id
            });
      };
}

export function editTaskDateAction(date, id) {
      return dispatch => {
            dispatch({
                  type: EDIT_TASK_DATE,
                  date: date,
                  id: id
            });
      };
}

// Receive an object who is the date and replace it in the store
// Send something different on firestore

export function editTasksPositionAction(tasks) {
      return dispatch => {
            tasks.map(item => {
                  dispatch({
                        type: EDIT_TASKS_POSITION,
                        id: item.id,
                        position: item.position
                  });
            });
      };
}

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

// // TODO: Make the dispatch
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

// // TODO: Make the dispatch
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

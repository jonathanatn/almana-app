// TODO: Redux implementation is a mess
// TODO: Manage success and failure in reducer

export const RECEIVE_TASKS = 'RECEIVE_TASKS';
export const ADD_TASK = 'ADD_TASK';
export const EDIT_TASK_DATE = 'EDIT_TASK_DATE';
export const EDIT_TASK_TIME = 'EDIT_TASK_TIME';
export const DELETE_TASK = 'DELETE_TASK';

export function receiveTasksAction(date) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();

            firestore
                  .collection('tasks')
                  .where('date', '==', date)
                  .get()
                  .then(function(querySnapshot) {
                        let tasks = {};
                        querySnapshot.forEach(function(doc) {
                              // doc.data() is never undefined for query doc snapshots
                              // console.log(doc.id, ' => ', doc.data());
                              // tasksId.push({ [doc.id]: doc.data() });

                              tasks = Object.assign(tasks, { [doc.id]: doc.data() });
                        });
                        // console.log(tasks);
                        dispatch({
                              type: RECEIVE_TASKS,
                              tasks: tasks,
                              date: date
                        });
                  });
      };
}

// docRef.get().then(function(doc) {
//       if (doc.exists) {
//           console.log("Document data:", doc.data());
//       } else {
//           // doc.data() will be undefined in this case
//           console.log("No such document!");
//       }
//   }).catch(function(error) {
//       console.log("Error getting document:", error);
//   });

// db.collection('cities')
//       .where('capital', '==', true)
//       .get()
//       .then(function(querySnapshot) {
//             querySnapshot.forEach(function(doc) {
//                   // doc.data() is never undefined for query doc snapshots
//                   console.log(doc.id, ' => ', doc.data());
//             });
//       })
//       .catch(function(error) {
//             console.log('Error getting documents: ', error);
//       });

export function addTask(task) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();
            const userId = getState().firebase.auth.uid;

            firestore
                  .collection('tasks')
                  .add({
                        uid: userId,
                        name: task.name,
                        completed: task.completed, //boolean
                        subtask: { ...task.subtask },
                        date: task.date,
                        time: task.time,
                        reminder: task.reminder,
                        reccurency: task.reccurency,
                        labels: task.labels, //Array
                        projectId: task.projectId,
                        dateAdded: task.dateAdded
                  })
                  .then(function(docRef) {
                        dispatch({
                              type: ADD_TASK,
                              taskId: docRef.id,
                              task: task
                        });
                  })
                  .catch(err => {
                        console.log(err);
                  });
      };
}

export function editTaskName(name, id) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();

            // console.log(name, id);

            firestore
                  .collection('tasks')
                  .doc(id)
                  .set({ name: name }, { merge: true })
                  // .then(() => {
                  //       dispatch({
                  //             type: ADD_TASK,
                  //             task
                  //       });
                  // })
                  .catch(err => {
                        console.log(err);
                  });
      };
}

export function toggleCompletion(state, id) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();

            firestore
                  .collection('tasks')
                  .doc(id)
                  .set({ completed: !state }, { merge: true })
                  .catch(err => {
                        console.log(err);
                  });
      };
}

export function deleteTaskAction(date, id) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();

            firestore
                  .collection('tasks')
                  .doc(id)
                  .delete()
                  .then(
                        dispatch({
                              type: DELETE_TASK,
                              date: date,
                              id: id
                        })
                  )
                  .catch(err => {
                        console.log(err);
                  });
      };
}

export function editTaskTimeAction(time, id, date) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();

            firestore
                  .collection('tasks')
                  .doc(id)
                  .set({ time: time }, { merge: true })
                  .then(
                        dispatch({
                              type: EDIT_TASK_TIME,
                              date: date,
                              time: time,
                              id: id
                        })
                  )
                  .catch(err => {
                        console.log(err);
                  });
      };
}

export function editTaskDateAction(date, id, previousDate) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();

            firestore
                  .collection('tasks')
                  .doc(id)
                  .set({ date: date }, { merge: true })
                  .then(
                        dispatch({
                              type: EDIT_TASK_DATE,
                              date: date,
                              id: id,
                              previousDate: previousDate
                        })
                  )
                  .catch(err => {
                        console.log(err);
                  });
      };
}

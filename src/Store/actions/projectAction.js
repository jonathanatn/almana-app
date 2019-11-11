// Receive Projects from Firestore
export const RECEIVE_PROJECTS = 'RECEIVE_PROJECTS';
export function receiveProjectsAction() {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();
            const userId = getState().firebase.auth.uid;

            getState().offline.online &&
                  firestore
                        .collection('projects')
                        .where('uid', '==', userId)
                        .where('type', '==', 'project')
                        .get()
                        .catch(err => {
                              // throw new Error('Error: Getting document:');
                              console.log('Error: Getting document: ', err);
                        })
                        .then(function(querySnapshot) {
                              let projects = {};
                              querySnapshot.forEach(function(doc) {
                                    projects = Object.assign(projects, { [doc.id]: doc.data() });
                              });

                              // console.log('PROJECTS: ', projects);
                              dispatch({
                                    type: RECEIVE_PROJECTS,
                                    projects: projects,
                                    uid: userId
                              });
                        })
                        .catch(err => {
                              // throw new Error(err);
                              console.log('Error: Getting document: ', err);
                        });
      };
}

// Receive Projects category from Firestore
export const RECEIVE_PROJECTS_CATEGORIES = 'RECEIVE_PROJECTS_CATEGORIES';
export function receiveProjectsCategoriesAction() {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();
            const userId = getState().firebase.auth.uid;

            getState().offline.online &&
                  firestore
                        .collection('projects')
                        .where('uid', '==', userId)
                        .where('type', '==', 'projectsCategory')
                        .get()
                        .catch(err => {
                              // throw new Error('Error: Getting document:');
                              console.log('Error: Getting document: ', err);
                        })
                        .then(function(querySnapshot) {
                              let projectsCategories = {};
                              querySnapshot.forEach(function(doc) {
                                    projectsCategories = Object.assign(projectsCategories, { [doc.id]: doc.data() });
                              });
                              dispatch({
                                    type: RECEIVE_PROJECTS_CATEGORIES,
                                    projectsCategories: projectsCategories
                              });
                        })
                        .catch(err => {
                              // throw new Error(err);
                              console.log('Error: Getting document: ', err);
                        });
      };
}

// Receive Headline Projects from Firestore
export const RECEIVE_PROJECT_HEADLINES = 'RECEIVE_PROJECT_HEADLINES';
export function receiveProjectHeadlinesAction(projectId) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();
            const userId = getState().firebase.auth.uid;

            getState().offline.online &&
                  firestore
                        .collection('projects')
                        .where('uid', '==', userId)
                        .where('type', '==', 'tasksCategory')
                        .where('project.id', '==', projectId)
                        .get()
                        .catch(err => {
                              // throw new Error('Error: Getting document:');
                              console.log('Error: Getting document: ', err);
                        })
                        .then(function(querySnapshot) {
                              let projectHeadlines = {};
                              querySnapshot.forEach(function(doc) {
                                    projectHeadlines = Object.assign(projectHeadlines, { [doc.id]: doc.data() });
                              });
                              dispatch({
                                    type: RECEIVE_PROJECT_HEADLINES,
                                    projectHeadlines: projectHeadlines
                              });
                        })
                        .catch(err => {
                              // throw new Error(err);
                              console.log('Error: Getting document: ', err);
                        });
      };
}

export const ADD_PROJECT = 'ADD_PROJECT';
export function addProjectAction(project) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();
            const userId = getState().firebase.auth.uid;

            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let autoId = userId.substr(0, 16) + '_' + '';
            for (let i = 0; i < 16; i++) {
                  autoId += chars.charAt(Math.floor(Math.random() * chars.length));
            }

            // Means it's a tasks category inside a project
            if (project.type === 'tasksCategory') {
                  dispatch({
                        type: ADD_PROJECT,
                        payload: { id: autoId, uid: userId, project },
                        meta: {
                              offline: {
                                    effect: firestore
                                          .collection('projects')
                                          .doc(autoId)
                                          .set({
                                                id: autoId,
                                                uid: userId,
                                                type: project.type,
                                                name: project.name,
                                                position: project.position,
                                                project: project.project
                                          })
                              }
                        }
                  });
            } else {
                  dispatch({
                        type: ADD_PROJECT,
                        payload: { id: autoId, uid: userId, project },
                        meta: {
                              offline: {
                                    effect: firestore
                                          .collection('projects')
                                          .doc(autoId)
                                          .set({
                                                id: autoId,
                                                uid: userId,
                                                type: project.type,
                                                name: project.name,
                                                position: project.position
                                          })
                              }
                        }
                  });
            }
      };
}

export const DELETE_ITEMS_PROJECT = 'DELETE_ITEMS_PROJECT';
export function deleteProjectItemsAction(items) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();

            items.map(item => {
                  dispatch({
                        type: DELETE_ITEMS_PROJECT,
                        payload: { id: item.id },
                        meta: {
                              offline: {
                                    effect: firestore
                                          .collection('projects')
                                          .doc(item.id)
                                          .delete()
                              }
                        }
                  });
            });
      };
}

// Delete tasks and headline inside a project but also the project itself
import { deleteTasksAction } from './taskAction';
export function deleteProjectAction(projectId) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();

            let tasks = [...Object.values(getState().tasks)];
            tasks = tasks.filter(item => item.project.id === projectId);
            dispatch(deleteTasksAction(tasks));

            let itemsProject = [...Object.values(getState().projects)];
            itemsProject = itemsProject.filter(
                  item => (item.project && item.project.id === projectId) || item.id === projectId
            );

            itemsProject.map(item => {
                  dispatch({
                        type: DELETE_ITEMS_PROJECT,
                        payload: { id: item.id },
                        meta: {
                              offline: {
                                    effect: firestore
                                          .collection('projects')
                                          .doc(item.id)
                                          .delete()
                              }
                        }
                  });
            });
      };
}

export const EDIT_NAME_PROJECT = 'EDIT_NAME_PROJECT';
export function editNameProjectAction(id, name) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();

            dispatch({
                  type: EDIT_NAME_PROJECT,
                  payload: { name, id },
                  meta: {
                        offline: {
                              effect: firestore
                                    .collection('projects')
                                    .doc(id)
                                    .set({ name: name }, { merge: true })
                        }
                  }
            });
      };
}

// Serve to sync the name of a task in a FlatList, when we change it's name, so we avoid sending firestore request at every letter change
export const SYNC_NAME_PROJECT = 'SYNC_NAME_PROJECT';
export function syncNameProjectAction(id, name) {
      return dispatch => {
            dispatch({
                  type: SYNC_NAME_PROJECT,
                  name: name,
                  id: id
            });
      };
}

export const EDIT_POSITION_PROJECTS = 'EDIT_POSITION_PROJECTS';
export function editPositionProjectsAction(projects) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();

            projects.map(item => {
                  dispatch({
                        type: EDIT_POSITION_PROJECTS,
                        payload: { id: item.id, position: item.position },
                        meta: {
                              offline: {
                                    effect: firestore
                                          .collection('projects')
                                          .doc(item.id)
                                          .set({ position: item.position }, { merge: true })
                              }
                        }
                  });
            });
      };
}

// Edit the position of the categories that are inside a project
export const EDIT_TASKSCATEGORY_POSITION = 'EDIT_TASKSCATEGORY_POSITION';
export function editPositionTasksCategoryAction(tasksCategory) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firestore = getFirestore();

            tasksCategory.map(item => {
                  dispatch({
                        type: EDIT_TASKSCATEGORY_POSITION,
                        payload: { id: item.id, project: item.project },
                        meta: {
                              offline: {
                                    effect: firestore
                                          .collection('projects')
                                          .doc(item.id)
                                          .set({ project: item.project }, { merge: true })
                              }
                        }
                  });
            });
      };
}

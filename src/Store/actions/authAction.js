export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_ERROR = 'LOGIN_ERROR';
export const SIGNOUT_SUCCESS = 'SIGNOUT_SUCCESS';
export const SIGNOUT_ERROR = 'SIGNOUT_ERROR';
export const SIGNUP_SUCCESS = 'SIGNUP_SUCCESS';
export const SIGNUP_ERROR = 'SIGNUP_ERROR';

export const RESET_AUTH_ERROR = 'RESET_AUTH_ERROR';

export function resetAuthErrorAction() {
      return dispatch => {
            dispatch({
                  type: RESET_AUTH_ERROR
            });
      };
}

export function loginWithEmailAndPasswordAction(credentials) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firebase = getFirebase();

            firebase
                  .auth()
                  .signInWithEmailAndPassword(credentials.email, credentials.password)
                  .then(e => {
                        dispatch({ type: LOGIN_SUCCESS, user: e.user });
                  })
                  .catch(err => {
                        dispatch({ type: LOGIN_ERROR, err });
                  });
      };
}

// TODO: Replace name by createUserWithEmailAndPasswordAction
export function signUp(newUser) {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firebase = getFirebase();
            const firestore = getFirestore();

            firebase
                  .auth()
                  .createUserWithEmailAndPassword(newUser.email, newUser.password)
                  // .then(response => {
                  //       return firestore.collection('users').doc(response.user.uid);
                  // })
                  .then(e => {
                        dispatch({ type: SIGNUP_SUCCESS, user: e.user });
                  })
                  .catch(err => {
                        dispatch({ type: SIGNUP_ERROR, err });
                  });
      };
}
export function signOut() {
      return (dispatch, getState, { getFirebase, getFirestore }) => {
            const firebase = getFirebase();

            firebase
                  .auth()
                  .signOut()
                  .then(() => {
                        dispatch({ type: SIGNOUT_SUCCESS });
                  })
                  .catch(err => {
                        dispatch({ type: SIGNOUT_ERROR, err });
                  });
      };
}

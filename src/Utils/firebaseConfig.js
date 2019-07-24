import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

var firebaseConfig = {
      apiKey: 'AIzaSyDjP9HKdSDrRv0wI8VYvAqCSGD9ekajvGY',
      authDomain: 'almana-app.firebaseapp.com',
      databaseURL: 'https://almana-app.firebaseio.com',
      projectId: 'almana-app',
      storageBucket: '',
      messagingSenderId: '271138524783',
      appId: '1:271138524783:web:616d9a2881e1b019'
};

firebase.initializeApp(firebaseConfig);

export default firebase;

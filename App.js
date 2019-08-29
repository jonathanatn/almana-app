import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, AsyncStorage } from 'react-native';
import { createAppContainer, createStackNavigator } from 'react-navigation';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from './src/Store/reducers/rootReducer';
import thunk from 'redux-thunk';
import { reduxFirestore, getFirestore } from 'redux-firestore';
import { reactReduxFirebase, getFirebase } from 'react-redux-firebase';
import firebaseConfig from './src/Utils/firebaseConfig';

import Login from './src/Components/Login/Login';
import SignUp from './src/Components/Login/SignUp';
import LoadingScreen from './src/Components/Login/LoadingScreen';
import TodayView from './src/Components/TodayView';
import MainScreen from './src/Components/MainScreen';
import MainScreen_Newer from './src/Components/MainScreen_Newer';
import reanimatedTestButton from './src/Components/reanimated-testbutton';

import './src/Utils/fixtimerbug';

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////  Redux Store & Redux Persist  ////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//https://www.youtube.com/watch?v=gKC4Hfp0zzU
import { persistStore, persistReducer } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

const persistConfig = {
      key: 'root',
      storage: AsyncStorage
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = createStore(
      persistedReducer,
      compose(
            applyMiddleware(
                  thunk.withExtraArgument({
                        getFirebase,
                        getFirestore
                  })
            ),
            reduxFirestore(firebaseConfig),
            reactReduxFirebase(firebaseConfig, { useFirestoreForProfile: true, userProfile: 'users' })
      )
);

const persistor = persistStore(store);

export default class App extends Component {
      render() {
            return (
                  <Provider store={store}>
                        <PersistGate loading={null} persistor={persistor}>
                              <AppContainer />
                        </PersistGate>
                  </Provider>
            );
      }
}

const StackNav = createStackNavigator(
      {
            // reanimatedTestButton,
            MainScreen_Newer,
            // reanimatedTestDragTask,
            MainScreen,
            LoadingScreen,
            SignUp,
            Login
      },
      {
            headerMode: 'none'
      }
);

const AppContainer = createAppContainer(StackNav);

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'center'
      }
});

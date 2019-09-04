// UI
import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, AsyncStorage } from 'react-native';
import { createAppContainer, createStackNavigator, createSwitchNavigator } from 'react-navigation';
import Login from './src/Components/Login/Login';
import SignUp from './src/Components/Login/SignUp';
import LoadingScreen from './src/Components/Login/LoadingScreen';
import TodayView from './src/Components/TodayView';
import MainScreen from './src/Components/MainScreen';
import reanimatedTestButton from './src/Components/reanimated-testbutton';

// STATE MANAGEMENT
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from './src/Store/reducers/rootReducer';
import thunk from 'redux-thunk';
import { reduxFirestore, getFirestore } from 'redux-firestore';
import { reactReduxFirebase, getFirebase } from 'react-redux-firebase';
import firebaseConfig from './src/Utils/firebaseConfig';

// HELPERS
import './src/Utils/fixtimerbug';

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////  Redux Offline /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import { offline } from '@redux-offline/redux-offline';
import offlineConfig from '@redux-offline/redux-offline/lib/defaults';

// https://github.com/redux-offline/redux-offline/issues/182
const reduxOfflineConfig = {
      ...offlineConfig,
      persistOptions: {
            ...offlineConfig['persistOptions'],
            blacklist: ['general']
      }
};

const store = createStore(
      rootReducer,
      compose(
            applyMiddleware(
                  thunk.withExtraArgument({
                        getFirebase,
                        getFirestore
                  })
            ),
            reduxFirestore(firebaseConfig),
            // reactReduxFirebase(firebaseConfig, { useFirestoreForProfile: true, userProfile: 'users' }),
            reactReduxFirebase(firebaseConfig),
            offline(reduxOfflineConfig)
      )
);

export default class App extends Component {
      render() {
            return (
                  <Provider store={store}>
                        <AppContainer />
                  </Provider>
            );
      }
}

const SignUpStackNav = createStackNavigator(
      {
            SignUp,
            Login
      },
      {
            // headerMode: 'none'
      }
);

const SwitchNav = createSwitchNavigator(
      {
            LoadingScreen,
            SignUpStackNav,
            MainScreen
      },
      {
            headerMode: 'none'
      }
);

const AppContainer = createAppContainer(SwitchNav);

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'center'
      }
});

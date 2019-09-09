// UI
import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, AsyncStorage } from 'react-native';
import { createAppContainer, createStackNavigator, createSwitchNavigator } from 'react-navigation';
import Login from './src/Components/Login/Login';
import SignUp from './src/Components/Login/SignUp';
import LoadingScreen from './src/Components/Login/LoadingScreen';
import MainScreen from './src/Components/MainScreen';
import Playground from './src/Components/Playground';

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

const MainStackNav = createStackNavigator(
      {
            // Playground,
            MainScreen
      },
      {
            headerMode: 'none'
      }
);

const SwitchNav = createSwitchNavigator(
      {
            LoadingScreen,
            SignUpStackNav,
            MainStackNav
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
      // defaultFontFamily: {
      //       fontFamily: 'lucida grande'
      // }
});

// // Oppo phone cut off bold text due to a specific font setting
// // Hack suggested here: https://github.com/facebook/react-native/issues/15114
// function fixOppoTextCutOff() {
//       const oldRender = Text.prototype.render;
//       Text.prototype.render = function render(...args) {
//             const origin = oldRender.call(this, ...args);
//             return React.cloneElement(origin, {
//                   style: [styles.defaultFontFamily, origin.props.style]
//             });
//       };
// }

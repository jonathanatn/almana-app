// UI
import React, { Component } from 'react';
import { Animated, Easing } from 'react-native';
import { createAppContainer, createStackNavigator, createSwitchNavigator } from 'react-navigation';
import Login from './src/Components/Login/Login';
import SignUp from './src/Components/Login/SignUp';
import LoadingScreen from './src/Components/Login/LoadingScreen';
import MainScreen from './src/Components/MainScreen';
import Playground from './src/Components/Playground';
import ProjectsScreen from './src/Components/ProjectsScreen';
import TasksProjectScreen from './src/Components/TasksProjectScreen';

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

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////  Store ////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////  Component ///////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default class App extends Component {
      render() {
            return (
                  <Provider store={store}>
                        <AppContainer />
                  </Provider>
            );
      }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////  Navigation ////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const SignUpStackNav = createStackNavigator(
      {
            SignUp,
            Login
      },
      {
            // headerMode: 'none'
      }
);

const StackNavigatorConfig = {
      headerMode: 'none',
      transitionConfig: () => ({
            transitionSpec: {
                  duration: 0,
                  timing: Animated.timing,
                  easing: Easing.step0
            }
      })
};

const MainStackNav = createStackNavigator(
      {
            // Playground,
            MainScreen,
            ProjectsScreen,
            TasksProjectScreen
      },
      StackNavigatorConfig
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

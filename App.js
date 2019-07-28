import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { createAppContainer, createStackNavigator } from 'react-navigation';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from './src/Store/reducers/rootReducer';
import thunk from 'redux-thunk';
import { reduxFirestore, getFirestore } from 'redux-firestore';
import { reactReduxFirebase, getFirebase } from 'react-redux-firebase';
import firebaseConfig from './src/Utils/firebaseConfig';

import CalendarMenuPlugin from './src/Components/CalendarMenuPlugin';
import CalendarMenuFlatList from './src/Components/CalendarMenuFlatList';

import Login from './src/Components/Login';
import SignUp from './src/Components/SignUp';
import LoadingScreen from './src/Components/LoadingScreen';
import ReceivingDataTest from './src/Components/ReceivingDataTest';
import AgendaViewSort from './src/Components/AgendaViewTestSortAlgo';
import ViewToTestMenuOpening from './src/Components/ViewToTestMenuOpening';

import './src/Utils/fixtimerbug';

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
            reactReduxFirebase(firebaseConfig, { useFirestoreForProfile: true, userProfile: 'users' })
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

const StackNav = createStackNavigator(
      {
            ViewToTestMenuOpening,
            AgendaViewSort,
            ReceivingDataTest,
            CalendarMenuFlatList,
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
            backgroundColor: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 50
      }
});

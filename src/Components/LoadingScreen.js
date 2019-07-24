import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { connect } from 'react-redux';
import firebase from 'firebase/app';

class LoadingScreen extends Component {
      componentDidMount() {
            this.checkIfLoggedIn();
      }

      checkIfLoggedIn = () => {
            firebase.auth().onAuthStateChanged(user => {
                  if (user) {
                        this.props.navigation.navigate('ReceivingDataTest');
                  } else {
                        this.props.navigation.navigate('Login');
                  }
            });
      };

      render() {
            const { auth } = this.props;
            // console.log(auth);

            //     auth.uid ? go to home : go to login

            return (
                  <View style={styles.container}>
                        <Text>Loading</Text>
                        <ActivityIndicator size="large" />
                  </View>
            );
      }
}

function mapStateToProp(state) {
      return {
            auth: state.firebase.auth
      };
}

export default connect(mapStateToProp)(LoadingScreen);

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: 'white',
            marginTop: 50
      }
});

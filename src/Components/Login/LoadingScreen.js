import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';

// DATA
import { connect } from 'react-redux';
import firebase from 'firebase/app';
import { receiveTasksRepeatedAction } from '../../Store/actions/taskAction';
import { resetAuthErrorAction } from '../../Store/actions/authAction';
function mapDispatchToProps(dispatch) {
      return {
            // TASKS
            receiveTasksRepeatedProp: repeat => dispatch(receiveTasksRepeatedAction(repeat)),

            // AUTH
            resetAuthErrorProp: () => dispatch(resetAuthErrorAction())
      };
}

class LoadingScreen extends Component {
      componentDidMount() {
            this.props.resetAuthErrorProp();
            this.checkIfLoggedIn();
      }

      componentDidUpdate() {
            // Get all repeated tasks from Firestore
            if (this.props.auth.isLoaded) {
                  this.props.receiveTasksRepeatedProp('daily');
                  this.props.receiveTasksRepeatedProp('weekly');
                  this.props.receiveTasksRepeatedProp('monthly');
            }
      }

      checkIfLoggedIn = () => {
            // firebase.auth().onAuthStateChanged(user => {
            //       if (user) {
            //             this.props.navigation.navigate('MainScreen');
            //       } else {
            //             this.props.navigation.navigate('SignUpStackNav');
            //       }
            // });
            setTimeout(() => {
                  if (this.props.uid) {
                        this.props.navigation.navigate('MainStackNav');
                  } else {
                        this.props.navigation.navigate('SignUpStackNav');
                  }
            }, 600);
      };

      render() {
            return (
                  <View style={styles.container}>
                        <ActivityIndicator size="large" color="#FF2D55" />
                  </View>
            );
      }
}

function mapStateToProp(state) {
      return {
            auth: state.firebase.auth,
            uid: state.auth.uid
      };
}

export default connect(
      mapStateToProp,
      mapDispatchToProps
)(LoadingScreen);

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: 'white',
            marginTop: 50,
            justifyContent: 'center',
            alignItems: 'center'
      }
});

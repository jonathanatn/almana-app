// STATIC UI
import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ToastAndroid } from 'react-native';

// DATA
import { connect } from 'react-redux';
import { loginWithEmailAndPasswordAction, signOut, resetAuthErrorAction } from '../../Store/actions/authAction';
function mapDispatchToProps(dispatch) {
      return {
            loginWithEmailAndPasswordProp: credentials => dispatch(loginWithEmailAndPasswordAction(credentials)),
            signOut: () => dispatch(signOut()),
            resetAuthErrorProp: () => dispatch(resetAuthErrorAction())
      };
}

class Login extends Component {
      static navigationOptions = {
            title: 'Log in'
      };

      state = {
            email: '',
            password: ''
      };

      componentDidMount() {
            this.props.resetAuthErrorProp();
      }

      componentDidUpdate() {
            this.props.resetAuthErrorProp();
            if (this.props.uid) {
                  this.props.navigation.navigate('MainScreen');
            }
      }

      handleSubmit = async () => {
            this.props.resetAuthErrorProp();
            this.props.loginWithEmailAndPasswordProp(this.state);
      };

      render() {
            return (
                  <View style={styles.container}>
                        <Text>Email</Text>
                        <TextInput
                              autoCapitalize="none"
                              keyboardType="email-address"
                              style={styles.input}
                              onChangeText={text => this.setState({ email: text })}
                              value={this.state.text}
                        />
                        <Text style={{ marginTop: 16 }}>Password</Text>
                        <TextInput
                              autoCapitalize="none"
                              secureTextEntry={true}
                              style={styles.input}
                              onChangeText={text => this.setState({ password: text })}
                              value={this.state.text}
                        />

                        <TouchableOpacity onPress={this.handleSubmit} style={styles.button}>
                              <Text>Log in</Text>
                        </TouchableOpacity>

                        {this.props.authError &&
                              ToastAndroid.show(this.props.authError, ToastAndroid.SHORT, ToastAndroid.BOTTOM)}
                  </View>
            );
      }
}

function mapStateToProp(state) {
      return {
            authError: state.auth.authError,
            uid: state.auth.uid
      };
}

export default connect(
      mapStateToProp,
      mapDispatchToProps
)(Login);

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: 'white',
            marginTop: 50,
            paddingHorizontal: 16
      },
      button: {
            height: 40,
            width: 150,
            backgroundColor: 'tomato',
            borderRadius: 7,
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            marginTop: 8
      },
      input: {
            height: 40,
            borderWidth: 0.5,
            borderColor: 'grey',
            borderRadius: 3
      }
});

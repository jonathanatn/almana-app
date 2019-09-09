import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ToastAndroid } from 'react-native';
import { connect } from 'react-redux';
import { signUp, resetAuthErrorAction } from '../../Store/actions/authAction';
function mapDispatchToProps(dispatch) {
      return {
            signUp: newUser => dispatch(signUp(newUser)),
            resetAuthErrorProp: () => dispatch(resetAuthErrorAction())
      };
}

class Login extends Component {
      static navigationOptions = {
            title: 'Welcome '
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

      handleSubmit = () => {
            this.props.resetAuthErrorProp();
            this.props.signUp(this.state);
      };

      goToLogin = () => {
            this.props.resetAuthErrorProp();
            this.props.navigation.navigate('Login');
      };

      render() {
            return (
                  <View style={styles.container}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 30 }}>
                              Create an account (it's free!)
                        </Text>
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
                              style={styles.input}
                              placeholder="6 characters minimum"
                              secureTextEntry={true}
                              onChangeText={text => this.setState({ password: text })}
                              value={this.state.text}
                        />
                        <TouchableOpacity onPress={this.handleSubmit} style={[styles.button, { marginTop: 24 }]}>
                              <Text>Sign Up</Text>
                        </TouchableOpacity>

                        {this.props.authError &&
                              ToastAndroid.show(this.props.authError, ToastAndroid.SHORT, ToastAndroid.BOTTOM)}

                        <Text style={{ alignSelf: 'center', marginTop: 40, marginBottom: 10 }}>
                              Already have an account?
                        </Text>
                        <TouchableOpacity
                              onPress={this.goToLogin}
                              style={[styles.button, { backgroundColor: 'white' }]}
                        >
                              <Text>Log in</Text>
                        </TouchableOpacity>
                  </View>
            );
      }
}

function mapStateToProp(state) {
      return {
            auth: state.firebase.auth,
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
            backgroundColor: '#FF2D55',
            borderRadius: 7,
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            borderColor: '#FF2D55',
            borderWidth: 2,
            marginTop: 8
      },
      input: {
            height: 40,
            borderWidth: 0.5,
            borderColor: 'grey',
            borderRadius: 3
      }
});

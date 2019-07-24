import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { connect } from 'react-redux';
import { signIn, signOut } from '../Store/actions/authAction';

class Login extends Component {
      state = {
            email: '',
            password: ''
      };

      handleSubmit = () => {
            this.props.signIn(this.state);
      };

      render() {
            console.log(this.props.signOut);
            return (
                  <View style={styles.container}>
                        <Text>Email</Text>
                        <TextInput onChangeText={text => this.setState({ email: text })} value={this.state.text} />
                        <Text>Password</Text>
                        <TextInput
                              style={{ height: 40, borderColor: 'gray' }}
                              onChangeText={text => this.setState({ password: text })}
                              value={this.state.text}
                        />
                        <TouchableOpacity onPress={this.handleSubmit} style={styles.button}>
                              <Text>Sign In</Text>
                        </TouchableOpacity>
                        <Text>{this.props.authError && this.props.authError}</Text>
                        <TouchableOpacity onPress={this.props.signOut} style={[styles.button, { marginTop: 20 }]}>
                              <Text>Sign Out</Text>
                        </TouchableOpacity>
                  </View>
            );
      }
}

function mapStateToProp(state) {
      console.log(state.firebase);
      return {
            authError: state.auth.authError
      };
}

function mapDispatchToProps(dispatch) {
      return {
            signIn: credentials => dispatch(signIn(credentials)),
            signOut: () => dispatch(signOut())
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
            marginTop: 50
      },
      button: {
            height: 40,
            width: 150,
            backgroundColor: 'blue'
      }
});

import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { connect } from 'react-redux';
import { signUp } from '../../Store/actions/authAction';

class Login extends Component {
      state = {
            email: '',
            password: ''
      };

      handleSubmit = () => {
            this.props.signUp(this.state);
      };

      render() {
            console.log(this.props.signOut);
            // if (auth.uid) navigate to ..
            return (
                  <View style={styles.container}>
                        <Text>Sign Up</Text>
                        <Text>Email</Text>
                        <TextInput onChangeText={text => this.setState({ email: text })} value={this.state.text} />
                        <Text>Password</Text>
                        <TextInput
                              style={{ height: 40, borderColor: 'gray' }}
                              onChangeText={text => this.setState({ password: text })}
                              value={this.state.text}
                        />
                        <TouchableOpacity onPress={this.handleSubmit} style={styles.button}>
                              <Text>Sign Up</Text>
                        </TouchableOpacity>
                        <Text>{this.props.authError && this.props.authError}</Text>
                  </View>
            );
      }
}

function mapStateToProp(state) {
      console.log(state.firebase);
      return {
            auth: state.firebase.auth,
            authError: state.auth.authError
      };
}

function mapDispatchToProps(dispatch) {
      return {
            signUp: newUser => dispatch(signUp(newUser))
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

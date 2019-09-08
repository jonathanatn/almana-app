// STATIC UI
import React, { Component } from 'react';
import { Text, TextInput, KeyboardAvoidingView, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Constants } from 'expo';
// import console = require('console');

// ANIMATED UI

// DATA

// HELPERS

export default class App extends Component {
      state = {
            isNameInputFocus: false
      };

      render() {
            return (
                  <View style={styles.containerParent}>
                        <View style={styles.container}>
                              <TextInput
                                    style={styles.input}
                                    placeholder="email@example.com"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    keyboardType="email-address"
                                    returnKeyType="send"
                                    onSubmitEditing={this._submit}
                                    blurOnSubmit={true}
                              />

                              <KeyboardAvoidingView
                                    behavior="position"
                                    style={styles.form}
                                    enabled={this.state.isNameInputFocus ? true : false}
                              >
                                    <TextInput
                                          style={styles.input}
                                          value={this.state.email}
                                          onChangeText={email => this.setState({ email })}
                                          ref={ref => {
                                                this._emailInput = ref;
                                          }}
                                          placeholder="Lunch with collegues.."
                                          onSubmitEditing={this._submit}
                                          onFocus={() => this.setState({ isNameInputFocus: true })}
                                          onEndEditing={() => this.setState({ isNameInputFocus: false })}
                                    />
                              </KeyboardAvoidingView>
                        </View>
                  </View>
            );
      }

      _submit = () => {
            alert(`Confirmation email has been sent to ${this.state.email}`);
      };
}

const styles = StyleSheet.create({
      containerParent: {
            flex: 1,
            backgroundColor: '#ecf0f1',
            paddingTop: 20,
            justifyContent: 'flex-end'
      },
      container: {
            height: 300
            // elevation: 15,
            // shadowColor: 'black',
            // shadowOffset: { width: 0, height: 0.5 * 5 },
            // shadowOpacity: 0.3,
            // shadowRadius: 0.8 * 8,
            // borderTopLeftRadius: 15,
            // borderTopRightRadius: 15
      },
      input: {
            margin: 20,
            // marginBottom: 0,
            // marginTop: 20,
            height: 34,
            paddingHorizontal: 10,
            borderRadius: 4,
            borderColor: '#ccc',
            borderWidth: 1,
            fontSize: 16
      },
      legal: {
            margin: 10,
            color: '#333',
            fontSize: 12,
            textAlign: 'center'
      },
      form: {
            flex: 1
            // justifyContent: 'space-between'
      }
});

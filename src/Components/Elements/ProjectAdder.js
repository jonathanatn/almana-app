// STATIC UI
import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, KeyboardAvoidingView, Keyboard } from 'react-native';
import { Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ANIMATED UI

// DATA
import { connect } from 'react-redux';
import { addProjectAction } from '../../Store/actions/projectAction';
function mapDispatchToProps(dispatch) {
      return {
            addProjectProp: project => dispatch(addProjectAction(project))
      };
}

// HELPERS
const { width } = Dimensions.get('window');

class ProjectAdder extends Component {
      state = {
            textInput: ''
      };

      componentDidMount() {
            this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
            this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', this._keyboardWillHide);

            this.inputRef.focus();
      }

      componentWillUnmount() {
            this.keyboardDidHideListener.remove();
            this.keyboardWillHideListener.remove();
      }

      // keyboardWillHide does'nt work on Android
      _keyboardDidHide = () => {
            this.props.closeProjectAdder();
      };

      _keyboardWillHide = () => {
            // On iOS the date picker close the keyboard which cause to unmount the component and make the date picker unavailable
            if (this.state.isDateTimePickerVisible === false && Platform.OS === 'ios') {
                  this.props.closeProjectAdder();
            }
      };

      handleText(text) {
            this.setState({
                  textInput: text
            });
      }

      addProject() {
            if (this.state.textInput.length !== 0) {
                  if (this.props.type === 'tasksCategory') {
                        this.props.addProjectProp({
                              name: this.state.textInput,
                              type: this.props.type,
                              position: -1,
                              project: {
                                    id: this.props.projectId,
                                    position: -1
                              }
                        });
                  } else {
                        this.props.addProjectProp({
                              name: this.state.textInput,
                              type: this.props.type,
                              position: -1
                        });
                  }
            }

            this.setState({
                  textInput: ''
            });
            this.inputRef.clear();
      }

      render() {
            return (
                  <KeyboardAvoidingView
                        style={{ backgroundColor: 'white', elevation: 7, zIndex: 999 }}
                        behavior="padding"
                  >
                        <View style={[styles.container]}>
                              <TextInput
                                    ref={ref => (this.inputRef = ref)}
                                    style={styles.textInput}
                                    returnKeyType="done"
                                    onChangeText={text => this.setState({ textInput: text })}
                                    onSubmitEditing={event => this.addProject()}
                              />
                              <TouchableOpacity onPress={() => this.addProject()}>
                                    <Ionicons
                                          name="md-send"
                                          size={30}
                                          color={this.state.textInput.length > 0 ? 'blue' : 'grey'}
                                    />
                              </TouchableOpacity>
                        </View>
                  </KeyboardAvoidingView>
            );
      }
}

function mapStateToProp(state, ownProps) {
      return {
            general: state.general
      };
}

export default connect(
      mapStateToProp,
      mapDispatchToProps
)(ProjectAdder);

const styles = StyleSheet.create({
      container: {
            flexDirection: 'row',
            backgroundColor: 'white',
            width: width,
            bottom: 0,
            padding: 16,
            elevation: 15,
            shadowColor: 'black',
            shadowOffset: { width: 0, height: 0.5 * 5 },
            shadowOpacity: 0.3,
            shadowRadius: 0.8 * 8,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15
      },
      textInput: {
            borderRadius: 50,
            flex: 1,
            height: 30,
            bottom: 0,
            backgroundColor: 'white',
            zIndex: 2,
            paddingHorizontal: 10,
            marginRight: 16,
            borderWidth: 1,
            borderColor: 'grey'
      }
});

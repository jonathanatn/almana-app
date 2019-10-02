// TODO:
// - Optimise code for iOS and android platform (keyboard listener)
// - Maybe implement official react native picker to give up the dependency (Didn't work last time I tried)

// STATIC UI
import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { TextInput, KeyboardAvoidingView, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from 'react-native-modal-datetime-picker';

// ANIMATED UI

// DATA
import { connect } from 'react-redux';
import { addTaskAction } from '../../Store/actions/taskAction';
import { closeTaskAdderAction } from '../../Store/actions/generalAction';
function mapDispatchToProps(dispatch) {
      return {
            addTaskProp: task => dispatch(addTaskAction(task)),
            closeTaskAdderProp: () => dispatch(closeTaskAdderAction())
      };
}

// HELPERS
import { getToday } from '../../Utils/helpers';
import moment from 'moment';

class TaskAdder extends Component {
      state = {
            isDateTimePickerVisible: false,
            textInput: '',
            date: '',
            time: '',
            reminder: {
                  id: '',
                  time: 'none'
            },
            repeat: 'never',
            type: 'task',
            project: {
                  id: '',
                  position: -1
            },
            dateSelected: '',
            timeSelected: '',
            dateFormattedForDatePicker: ''
      };

      componentDidMount() {
            this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
            this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', this._keyboardWillHide);

            this.inputRef.focus();

            // Select the date of the day you're in the date picker
            let dateSelected = this.props.general.dateSelectedDateMover;

            let day = dateSelected.substring(3, 5);
            let month = dateSelected.substring(0, 2);
            let year = dateSelected.substring(6);

            let date = new Date(year, parseInt(month, 10) - 1, day, 0, 0, 0, 0);

            this.setState({
                  date: this.props.projectId ? '' : this.props.general.dateSelectedDateMover,
                  dateFormattedForDatePicker: date,
                  project: {
                        id: this.props.projectId ? this.props.projectId : '',
                        position: -1
                  }
            });
      }

      componentWillUnmount() {
            this.keyboardDidHideListener.remove();
            this.keyboardWillHideListener.remove();
      }

      // keyboardWillHide does'nt work on Android
      _keyboardDidHide = () => {
            if (Platform.OS === 'android') {
                  console.log('keyboard hide');
                  this.props.closeTaskAdderProp();
            }
      };

      _keyboardWillHide = () => {
            // On iOS the date picker close the keyboard which cause to unmount the component and make the date picker unavailable
            if (this.state.isDateTimePickerVisible === false && Platform.OS === 'ios') {
                  this.props.closeTaskAdderProp();
            }
      };

      showDateTimePicker = () => {
            this.setState({ isDateTimePickerVisible: true });
      };

      hideDateTimePicker = () => {
            this.setState({ isDateTimePickerVisible: false });
      };

      handleDateTimePicked = dateTimeReceived => {
            let date = moment(dateTimeReceived).format('L');
            //     let time = moment(dateTimeReceived).format('LT');

            this.setState({
                  date: date
            });

            this.hideDateTimePicker();
      };

      handleText(text) {
            this.setState({
                  textInput: text
            });
      }

      addTask() {
            let taskDate = this.state.date;

            if (this.state.textInput.length !== 0) {
                  const date = new Date();
                  this.props.addTaskProp({
                        name: this.state.textInput,
                        dateAdded: date,
                        completed: false,
                        subtask: {},
                        date: taskDate,
                        time: '',
                        reminder: {
                              id: '',
                              time: 'none'
                        },
                        repeat: 'never',
                        labels: [],
                        type: this.state.type,
                        project: this.state.project,
                        position: ''
                  });
            }

            this.setState({
                  textInput: '',
                  time: '',
                  reminder: {
                        id: '',
                        time: 'none'
                  },
                  project: {
                        id: this.props.projectId ? this.props.projectId : '',
                        position: -1
                  }
            });
            this.inputRef.clear();
      }

      render() {
            return (
                  <KeyboardAvoidingView
                        style={{ backgroundColor: 'white', elevation: 7, zIndex: 999 }}
                        //FIXME: Weird effect, the component come faster than the keyboard, try with padding
                        behavior="padding"
                  >
                        <View
                              style={[
                                    styles.container,
                                    {
                                          flexDirection: 'row',
                                          opacity: this.state.isDateTimePickerVisible && Platform.OS === 'ios' ? 0 : 1
                                    }
                              ]}
                        >
                              <TouchableOpacity onPress={() => this.showDateTimePicker()}>
                                    <Ionicons name="ios-calendar" size={30} color={'grey'} />
                              </TouchableOpacity>
                              {/* <Ionicons name="md-notifications-outline" size={30} color={'grey'} />
                              <Ionicons name="md-pricetag" size={30} color={'grey'} />
			      <Ionicons name="ios-add-circle" size={30} color={'grey'} />
			      <Ionicons name="md-folder" size={30} color={'grey'} />
			      <Ionicons name="md-person" size={30} color={'grey'} /> */}
                              <TextInput
                                    ref={ref => (this.inputRef = ref)}
                                    style={styles.textInput}
                                    returnKeyType="done"
                                    onChangeText={text => this.setState({ textInput: text })}
                                    onSubmitEditing={event => this.addTask()}
                              />
                              <TouchableOpacity onPress={() => this.addTask()}>
                                    <Ionicons
                                          name="md-send"
                                          size={30}
                                          color={this.state.textInput.length > 0 ? 'red' : 'grey'}
                                    />
                              </TouchableOpacity>
                        </View>

                        {this.state.isDateTimePickerVisible ? (
                              <DateTimePicker
                                    mode={'date'}
                                    date={this.state.dateFormattedForDatePicker}
                                    isVisible={true}
                                    onConfirm={this.handleDateTimePicked}
                                    onCancel={this.hideDateTimePicker}
                              />
                        ) : null}
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
)(TaskAdder);

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
      container: {
            //     zIndex: 2,
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
            marginHorizontal: 16,
            borderWidth: 1,
            borderColor: 'grey'
      }
});

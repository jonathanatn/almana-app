// STATIC UI
import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Platform, Alert } from 'react-native';
import { TextInput, KeyboardAvoidingView, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from 'react-native-modal-datetime-picker';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import * as Permissions from 'expo-permissions';
import RepeatButton from './Items/RepeatButton';

// ANIMATED UI

// DATA
import { connect } from 'react-redux';
import { addEventAction } from '../../Store/actions/eventAction';
import { closeEventAdderAction } from '../../Store/actions/generalAction';
function mapDispatchToProps(dispatch) {
      return {
            addEventProp: event => dispatch(addEventAction(event)),
            closeEventAdderProp: () => dispatch(closeEventAdderAction())
      };
}

// HELPERS

import { getToday } from '../../Utils/helpers';
import moment from 'moment';

class EventAdder extends Component {
      state = {
            isDateTimePickerVisible: false,
            textInput: '',
            date: '',
            time: '',
            endTime: '',
            time: '',
            reminder: {
                  id: '',
                  time: 'none'
            },
            repeat: 'never',
            isDatePickerVisible: false,
            isStartTimePickerVisible: false,
            isEndTimePickerVisible: false,
            dateFormattedForDatePicker: new Date()
      };

      componentDidMount() {
            // this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
            // this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', this._keyboardWillHide);

            this.inputRef.focus();

            let time = moment().format('LT');

            if (time.length === 7) {
                  time = '0' + time;
            }

            let endTime = moment(time, 'LT')
                  .add(1, 'hours')
                  .format('LT');

            if (endTime.length === 7) {
                  endTime = '0' + endTime;
            }

            let dateSelected = this.props.general.dateSelectedDateMover;

            let day = dateSelected.substring(3, 5);
            let month = dateSelected.substring(0, 2);
            let year = dateSelected.substring(6);

            let date = new Date(year, parseInt(month, 10) - 1, day, 0, 0, 0, 0);

            this.setState({
                  date: this.props.general.dateSelectedDateMover,
                  dateFormattedForDatePicker: date,
                  time,
                  endTime
            });
      }

      // componentWillUnmount() {
      //       this.keyboardDidHideListener.remove();
      //       this.keyboardWillHideListener.remove();
      // }

      // // keyboardWillHide does'nt work on Android
      // _keyboardDidHide = () => {
      //       this.props.closeEventAdderProp();
      // };

      // _keyboardWillHide = () => {
      //       // On iOS the date picker close the keyboard which cause to unmount the component and make the date picker unavailable
      //       if (this.state.isDateTimePickerVisible === false && Platform.OS === 'ios') {
      //             this.props.closeEventAdderProp();
      //       }
      // };

      handleText(text) {
            this.setState({
                  textInput: text
            });
      }

      addEvent() {
            if (this.state.textInput.length !== 0) {
                  const date = new Date();
                  this.props.addEventProp({
                        name: this.state.textInput,
                        subtask: {},
                        date: this.state.date,
                        time: this.state.time,
                        endTime: this.state.endTime,
                        reminder: this.state.reminder,
                        repeat: this.state.repeat,
                        position: -1
                  });
            }

            // this.setState({
            //       textInput: '',
            //       time: ''
            // });
            // this.inputRef.clear();

            this.props.closeEventAdderProp();
      }

      handleDatePicked = dateReceived => {
            let date = moment(dateReceived).format('L');

            this.setState({
                  date: date
            });

            this.hideDatePicker();
      };

      handleStartTimePicked = timeReceived => {
            let time = moment(timeReceived).format('LT');

            if (time.length < 8) {
                  time = '0' + time;
            }

            let endTime = moment(time, 'LT')
                  .add(1, 'hours')
                  .format('LT');

            if (endTime.length === 7) {
                  endTime = '0' + endTime;
            }

            this.setState({
                  time: time,
                  endTime: endTime
            });

            this.hideStartTimePicker();
      };

      handleEndTimePicked = endTimeReceived => {
            let endTime = moment(endTimeReceived).format('LT');

            let endTimeToCompare = moment(endTime, 'h:mma');
            let startTimeToCompare = moment(this.state.time, 'h:mma');

            if (endTime.length < 8) {
                  endTime = '0' + endTime;
            }

            if (endTimeToCompare.isBefore(startTimeToCompare)) {
                  this.hideEndTimePicker();
                  Alert.alert(
                        'Error',
                        'The end time of the event can not be earlier than the start time.',
                        [
                              {
                                    text: 'OK'
                              }
                        ],
                        { cancelable: false }
                  );
            } else {
                  this.setState(
                        {
                              endTime: endTime
                        },
                        () => {
                              this.hideEndTimePicker();
                        }
                  );
            }

            // this.setState({
            //       endTime
            // });
            // this.hideEndTimePicker();
      };

      showDatePicker = () => {
            this.setState({ isDatePickerVisible: true });
      };

      showStartTimePicker = async () => {
            this.setState({ isStartTimePickerVisible: true });
      };

      showEndTimePicker = () => {
            this.setState({ isEndTimePickerVisible: true });
      };

      hideDatePicker = () => {
            this.setState({ isDatePickerVisible: false });
      };

      hideStartTimePicker = () => {
            this.setState({ isStartTimePickerVisible: false });
      };

      hideEndTimePicker = () => {
            this.setState({ isEndTimePickerVisible: false });
      };

      setReminder = async reminderSelected => {
            const { status, permissions } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
            if (status === 'granted') {
                  this.setState({
                        reminder: {
                              ...this.state.reminder,
                              time: reminderSelected
                        }
                  });
            } else {
                  // TODO: create an alert
                  throw new Error('Location permission not granted');
            }
      };

      setRepeat = repeat => {
            this.setState({
                  repeat: repeat
            });
      };

      render() {
            return (
                  <View
                        style={[
                              styles.container,
                              {
                                    // flexDirection: 'row',
                                    // opacity: this.state.isDatePickerVisible && Platform.OS === 'ios' ? 0 : 1
                              }
                        ]}
                  >
                        {this.state.reminder.time !== 'none' && (
                              <Menu
                                    ref={ref => (this.reminderMenu = ref)}
                                    button={
                                          // <Text onPress={() => this.reminderMenu.show()}>Show menu</Text>
                                          <View style={{ flexDirection: 'row' }}>
                                                <TouchableOpacity
                                                      onPress={() => this.reminderMenu.show()}
                                                      style={{
                                                            flexDirection: 'row',
                                                            backgroundColor: '#FF2D55',
                                                            borderRadius: 100,
                                                            padding: 4,
                                                            paddingHorizontal: 12,
                                                            marginBottom: 12
                                                      }}
                                                >
                                                      <Ionicons name="md-notifications" size={19} color="white" />
                                                      <Text style={{ color: 'white', marginLeft: 8 }}>
                                                            {this.state.reminder.time}
                                                      </Text>
                                                </TouchableOpacity>
                                          </View>
                                    }
                              >
                                    <MenuItem
                                          onPress={() => {
                                                this.setReminder('none');
                                                this.reminderMenu.hide();
                                          }}
                                          children={<Text>None</Text>}
                                    />
                                    <MenuItem
                                          onPress={() => {
                                                this.setReminder('1-hour');
                                                this.reminderMenu.hide();
                                          }}
                                          children={<Text>1 hour before</Text>}
                                    />
                                    <MenuItem
                                          onPress={() => {
                                                this.setReminder('3-hour');
                                                this.reminderMenu.hide();
                                          }}
                                          children={<Text>3 hours before</Text>}
                                    />
                                    <MenuItem
                                          onPress={() => {
                                                this.setReminder('1-day');
                                                this.reminderMenu.hide();
                                          }}
                                          children={<Text>1 day before</Text>}
                                    />
                                    <MenuItem
                                          onPress={() => {
                                                this.setReminder('3-day');
                                                this.reminderMenu.hide();
                                          }}
                                          children={<Text>3 days before</Text>}
                                    />
                              </Menu>
                        )}

                        <View style={{ flexDirection: 'row' }}>
                              {/* <TouchableOpacity onPress={() => this.showDatePicker()}>
                                    <Ionicons name="ios-calendar" size={30} color={'grey'} />
                              </TouchableOpacity> */}

                              <TextInput
                                    ref={ref => (this.inputRef = ref)}
                                    style={styles.textInput}
                                    returnKeyType="done"
                                    onChangeText={text => this.setState({ textInput: text })}
                                    onSubmitEditing={event => this.addEvent()}
                              />
                              <TouchableOpacity onPress={() => this.addEvent()}>
                                    <Ionicons
                                          name="md-send"
                                          size={30}
                                          color={this.state.textInput.length > 0 ? 'red' : 'grey'}
                                    />
                              </TouchableOpacity>
                        </View>

                        {/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
                        //////////////////////////////////////////         Date Setter         ///////////////////////////////////////////// 
                        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
                              <View style={{ width: 100 }}>
                                    <TouchableOpacity onPress={() => this.showDatePicker()}>
                                          <Text>Date</Text>
                                          <Text>{this.state.date}</Text>
                                    </TouchableOpacity>
                              </View>

                              <View style={{ width: 100, flexDirection: 'column' }}>
                                    <TouchableOpacity onPress={() => this.showStartTimePicker()}>
                                          {/* <TouchableOpacity onPress={() => this.setState({ show: true })}> */}
                                          <Text>Start time: {this.state.time}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.showEndTimePicker()}>
                                          <Text>End time: {this.state.endTime}</Text>
                                    </TouchableOpacity>
                              </View>
                        </View>

                        {/*/////////////////////////////////////////         Date Picker       //////////////////////////////////////////// */}

                        <DateTimePicker
                              mode={'date'}
                              date={this.state.dateFormattedForDatePicker}
                              isVisible={this.state.isDatePickerVisible}
                              onConfirm={this.handleDatePicked}
                              onCancel={this.hideDatePicker}
                        />
                        <DateTimePicker
                              mode={'time'}
                              isVisible={this.state.isStartTimePickerVisible}
                              onConfirm={this.handleStartTimePicked}
                              onCancel={this.hideStartTimePicker}
                        />
                        <DateTimePicker
                              mode={'time'}
                              isVisible={this.state.isEndTimePickerVisible}
                              onConfirm={this.handleEndTimePicked}
                              onCancel={this.hideEndTimePicker}
                        />

                        <View style={styles.bottomBarMenu}>
                              <Menu
                                    ref={ref => (this.reminderMenu2 = ref)}
                                    button={
                                          // <Text onPress={() => this.reminderMenu.show()}>Show menu</Text>
                                          <TouchableOpacity onPress={() => this.reminderMenu2.show()}>
                                                <Ionicons
                                                      name="md-notifications"
                                                      size={30}
                                                      color={this.state.reminder.time !== 'none' ? '#FF2D55' : 'grey'}
                                                />
                                          </TouchableOpacity>
                                    }
                              >
                                    <MenuItem
                                          onPress={() => {
                                                this.setReminder('none');
                                                this.reminderMenu2.hide();
                                          }}
                                          children={<Text>None</Text>}
                                    />
                                    <MenuItem
                                          onPress={() => {
                                                this.setReminder('1-hour');
                                                this.reminderMenu2.hide();
                                          }}
                                          children={<Text>1 hour before</Text>}
                                    />
                                    <MenuItem
                                          onPress={() => {
                                                this.setReminder('3-hour');
                                                this.reminderMenu2.hide();
                                          }}
                                          children={<Text>3 hours before</Text>}
                                    />
                                    <MenuItem
                                          onPress={() => {
                                                this.setReminder('1-day');
                                                this.reminderMenu2.hide();
                                          }}
                                          children={<Text>1 day before</Text>}
                                    />
                                    <MenuItem
                                          onPress={() => {
                                                this.setReminder('3-day');
                                                this.reminderMenu2.hide();
                                          }}
                                          children={<Text>3 days before</Text>}
                                    />
                              </Menu>
                              <RepeatButton setRepeat={this.setRepeat} />
                              <TouchableOpacity
                                    onPress={() => {
                                          this.props.closeEventAdderProp();
                                    }}
                              >
                                    <Text style={{ fontWeight: 'bold', fontSize: 19 }}>Cancel </Text>
                              </TouchableOpacity>
                        </View>
                  </View>
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
)(EventAdder);

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
      container: {
            //     zIndex: 2,
            paddingTop: 60,
            backgroundColor: 'white',
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 998,
            elevation: 98,
            padding: 16,
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
      },
      bottomBarMenu: {
            flexDirection: 'row',
            flex: 1,
            justifyContent: 'space-between',
            paddingHorizontal: 24,
            marginTop: 24,
            // position: 'absolute',
            // left: 0,
            // right: 0,
            // bottom: 0,
            height: 50
      }
});

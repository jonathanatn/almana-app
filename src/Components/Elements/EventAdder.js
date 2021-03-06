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
            position: '',
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
            this.inputRef.focus();

            let time = moment();
            let position;
            let timeFormattedForDatePicker;
            let endTimeFormattedForDatePicker;

            time =
                  time.minute() || time.second() || time.millisecond()
                        ? time.add(1, 'hour').startOf('hour')
                        : time.startOf('hour');

            position = time.format('HH:mm:ss');
            timeFormattedForDatePicker = time.toDate();
            time = time.format('LT');

            if (time.length === 7) {
                  time = '0' + time;
            }

            let endTime = moment(time, 'LT')
                  .add(1, 'hours')
                  .format('LT');

            endTimeFormattedForDatePicker = moment(time, 'LT')
                  .add(1, 'hours')
                  .toDate();

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
                  timeFormattedForDatePicker: timeFormattedForDatePicker,
                  endTimeFormattedForDatePicker: endTimeFormattedForDatePicker,
                  time,
                  endTime,
                  position: position
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
                        position: this.state.position
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
            let time = moment(timeReceived);

            position = time.startOf('minute').format('HH:mm:ss');
            time = time.format('LT');

            if (time.length < 8) {
                  time = '0' + time;
            }

            let endTime = moment(time, 'LT')
                  .add(1, 'hours')
                  .format('LT');

            let endTimeFormattedForDatePicker = moment(time, 'LT')
                  .add(1, 'hours')
                  .toDate();

            if (endTime.length === 7) {
                  endTime = '0' + endTime;
            }

            this.setState({
                  time: time,
                  endTime: endTime,
                  position: position,
                  timeFormattedForDatePicker: timeReceived,
                  endTimeFormattedForDatePicker: endTimeFormattedForDatePicker
            });

            this.hideStartTimePicker();
      };

      handleEndTimePicked = endTimeReceived => {
            let endTime = moment(endTimeReceived).format('LT');

            let endTimeFormattedForDatePicker = moment(endTimeReceived, 'LT').toDate();

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
                              endTime: endTime,
                              endTimeFormattedForDatePicker: endTimeFormattedForDatePicker
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
                              id: '',
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
                        <View style={{ flexDirection: 'row' }}>
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
                                    <TouchableOpacity
                                          onPress={() => this.showStartTimePicker()}
                                          style={{ marginBottom: 12 }}
                                    >
                                          {/* <TouchableOpacity onPress={() => this.setState({ show: true })}> */}
                                          <Text>Start time:</Text>
                                          <Text>{this.state.time}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.showEndTimePicker()}>
                                          <Text>End time:</Text>
                                          <Text>{this.state.endTime}</Text>
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
                              date={this.state.timeFormattedForDatePicker}
                              isVisible={this.state.isStartTimePickerVisible}
                              onConfirm={this.handleStartTimePicked}
                              onCancel={this.hideStartTimePicker}
                        />
                        <DateTimePicker
                              mode={'time'}
                              date={this.state.endTimeFormattedForDatePicker}
                              isVisible={this.state.isEndTimePickerVisible}
                              onConfirm={this.handleEndTimePicked}
                              onCancel={this.hideEndTimePicker}
                        />

                        <View style={styles.bottomBarMenu}>
                              <Menu
                                    ref={ref => (this.reminderMenu = ref)}
                                    button={
                                          this.state.reminder && this.state.reminder.time !== 'none' ? (
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
                                                                  {getReminderText(this.state.reminder.time)}
                                                            </Text>
                                                      </TouchableOpacity>
                                                </View>
                                          ) : (
                                                <TouchableOpacity onPress={() => this.reminderMenu.show()}>
                                                      <Ionicons name="md-notifications" size={30} color={'grey'} />
                                                </TouchableOpacity>
                                          )
                                    }
                              >
                                    <MenuItem
                                          onPress={() => {
                                                this.reminderMenu.hide();
                                          }}
                                          disabled
                                          children={<Text>Reminder: </Text>}
                                    />
                                    <MenuDivider />
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

                              <RepeatButton setRepeat={this.setRepeat} repeat={this.state.repeat} />
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

function getReminderText(time) {
      switch (time) {
            case '1-hour':
                  return '1h before';
                  break;
            case '3-hour':
                  return '3h before';
                  break;
            case '1-day':
                  return '1 day bef.';
                  break;
            case '3-day':
                  return '3 days bef.';
                  break;
      }
}

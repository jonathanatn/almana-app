// STATIC UI
import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, TextInput, Alert, Modal } from 'react-native';
import { KeyboardAvoidingView, Keyboard, Platform, NativeModules } from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import * as Permissions from 'expo-permissions';
import RepeatButton from './Items/RepeatButton';

// ANIMATED UI
import Animated, { Easing } from 'react-native-reanimated';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
const { cond, eq, add, call, set, Value, event, block, and, greaterThan, lessThan, stopClock, defined } = Animated;
const { or, startClock, lessOrEq, greaterOrEq, Clock, clockRunning, spring, interpolate, Extrapolate } = Animated;

// DATA
import { firestoreConnect } from 'react-redux-firebase';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { editEventStartTimeAction, editEventEndTimeAction, deleteEventAction } from '../../Store/actions/eventAction';
import { editEventDateAction, editEventNameAction, syncEventNameAction } from '../../Store/actions/eventAction';
import { setEventReminderAction, setEventRepeatAction } from '../../Store/actions/eventAction';
import { closeEventMenuAction } from '../../Store/actions/generalAction';
function mapDispatchToProps(dispatch) {
      return {
            editEventNameProp: (name, id, previousName) => dispatch(editEventNameAction(name, id, previousName)),
            syncEventNameProp: (name, id) => dispatch(syncEventNameAction(name, id)),
            editEventStartTimeProp: (time, endTime, id) => dispatch(editEventStartTimeAction(time, endTime, id)),
            editEventEndTimeProp: (endTime, id) => dispatch(editEventEndTimeAction(endTime, id)),
            editEventDateProp: (date, id) => dispatch(editEventDateAction(date, id)),
            deleteEventProp: id => dispatch(deleteEventAction(id)),
            setEventReminderProp: (id, reminder) => dispatch(setEventReminderAction(id, reminder)),
            setEventRepeatProp: (id, repeat) => dispatch(setEventRepeatAction(id, repeat)),

            // GENERAL
            closeEventMenuProp: () => dispatch(closeEventMenuAction())
      };
}

// HELPERS
import { getToday, clearLocalNotification, setLocalNotification } from '../../Utils/helpers';
import moment from 'moment';
const { width, height } = Dimensions.get('window');
const { StatusBarManager } = NativeModules;

class EventMenu extends Component {
      constructor(props) {
            super(props);

            this.dragY = new Value(0);
            this.absoluteY = new Value(0);
            this.offsetY = new Value(-420);
            this.gestureState = new Value(-1);

            this.onGestureEvent = event([
                  {
                        nativeEvent: {
                              translationY: this.dragY,
                              absoluteY: this.absoluteY,
                              state: this.gestureState
                        }
                  }
            ]);

            this.addY = add(this.dragY, this.offsetY);
            this.transY = new Value(-420);
            this.clock = new Clock();
            this.menuStarted = new Value(0);
            this.menuReduced = new Value(1);
            this.menuExpanded = new Value(0);
            this.dragging = new Value(0);

            this.state = {
                  id: '',
                  name: '',
                  subtask: {},
                  date: '',
                  time: '',
                  endTime: '',
                  reminder: '',
                  repeat: '',
                  isDatePickerVisible: false,
                  isStartTimePickerVisible: false,
                  isEndTimePickerVisible: false,
                  iosStatusBarHeight: 0
            };
      }

      componentDidMount() {
            if (Platform.OS === 'ios') {
                  StatusBarManager.getHeight(statusBarHeight => {
                        this.setState({
                              iosStatusBarHeight: statusBarHeight.height
                        });
                  });
            }
            this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
            this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', this._keyboardWillHide);
            if (this.props.general.isEventMenuOpen === true) {
                  Animated.timing(this.state.yValue, {
                        toValue: 0,
                        duration: 100
                  }).start();
            } else {
                  Animated.timing(this.state.yValue, {
                        toValue: 0,
                        duration: 100
                  }).start();
            }

            let dateSelected = this.props.general.dateSelectedDateMover;

            let day = dateSelected.substring(3, 5);
            let month = dateSelected.substring(0, 2);
            let year = dateSelected.substring(6);

            // Format the date for the DatePicker selected date
            let date = new Date(year, parseInt(month, 10) - 1, day, 0, 0, 0, 0);

            this.setState({
                  name: this.props.general.selectedItem.name,
                  completed: this.props.general.selectedItem.completed,
                  date: this.props.general.selectedItem.date != '' ? this.props.general.selectedItem.date : 'No date',
                  time: this.props.general.selectedItem.time != '' ? this.props.general.selectedItem.time : 'No time',
                  endTime:
                        this.props.general.selectedItem.endTime != ''
                              ? this.props.general.selectedItem.endTime
                              : 'No time',
                  dateFormattedForDatePicker: date,
                  reminder: this.props.general.selectedItem.reminder,
                  repeat: this.props.general.selectedItem.repeat
            });
      }

      componentWillUnmount() {
            this.keyboardDidHideListener.remove();
            this.keyboardWillHideListener.remove();
      }

      // keyboardWillHide does'nt work on Android
      _keyboardDidHide = () => {
            this.confirmChangeEventName();
      };

      _keyboardWillHide = () => {
            // On iOS the date picker close the keyboard which cause to unmount the component and make the date picker unavailable
            if (Platform.OS === 'ios') {
                  this.confirmChangeEventName();
            }
      };

      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      /////////////////////////////////      Date/Time Picker Func      //////////////////////////////////////
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      showDatePicker = () => {
            this.setState({ isDatePickerVisible: true });
      };

      hideDatePicker = () => {
            this.setState({ isDatePickerVisible: false });
      };

      handleDatePicked = async dateReceived => {
            let date = moment(dateReceived).format('L');
            let previousDate = this.state.date;

            // Close the event menu, if we change the date for another day
            if (date !== previousDate) {
                  // await this.editEventDate(date);

                  // this.hideDatePicker();
                  // this.props.closeEventMenuProp();

                  this.setState(
                        {
                              date: date
                        },
                        async () => {
                              await this.setReminder(this.state.reminder.time);
                              this.props.editEventDateProp(date, this.props.general.selectedItem.id);

                              this.hideDatePicker();
                              this.props.closeEventMenuProp();
                        }
                  );
            } else {
                  this.hideDatePicker();
            }
      };

      showStartTimePicker = () => {
            this.setState({ isStartTimePickerVisible: true });
      };

      hideStartTimePicker = () => {
            this.setState({ isStartTimePickerVisible: false });
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

            this.setState(
                  {
                        time: time,
                        endTime: endTime
                  },
                  () => {
                        this.setReminder(this.state.reminder.time);
                        this.props.editEventStartTimeProp(time, endTime, this.props.general.selectedItem.id);
                        this.hideStartTimePicker();
                  }
            );
      };

      showEndTimePicker = () => {
            this.setState({ isEndTimePickerVisible: true });
      };

      hideEndTimePicker = () => {
            this.setState({ isEndTimePickerVisible: false });
      };

      handleEndTimePicked = timeReceived => {
            let endTime = moment(timeReceived).format('LT');

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
                              // this.editEventEndTime(time, this.props.general.selectedItem.id);
                              this.props.editEventEndTimeProp(endTime, this.props.general.selectedItem.id);
                              this.hideEndTimePicker();
                        }
                  );
            }
      };

      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      ////////////////////////////////////      Edit Event Func      //////////////////////////////////////////
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      changeEventName = name => {
            this.setState({
                  name: name
            });
            this.props.syncEventNameProp(name, this.props.general.selectedItem.id);
      };

      confirmChangeEventName = () => {
            // TODO:
            // If keyboard open and input item name focus => register the previous name
            let previousName = '';

            // if keyboard close and previousname and name to send are different
            this.props.editEventNameProp(this.state.name, this.props.general.selectedItem.id, previousName);
            this.setReminder(this.state.reminder.time, this.state.repeat);
      };

      deleteTask = async () => {
            const { status, permissions } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
            if (status === 'granted') {
                  clearLocalNotification(this.state.reminder.id);
            }
            this.props.deleteEventProp(this.props.general.selectedItem);
            this.props.closeEventMenuProp();
      };

      setReminder = async (reminderSelected, repeat = this.state.repeat) => {
            const { status, permissions } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
            if (status === 'granted') {
                  let { id } = this.props.general.selectedItem;
                  let { name, date, time, reminder } = this.state;

                  // 0 - Get the user choice
                  reminder.time = reminderSelected;

                  //  1- Clear the previous notif if it exist
                  await clearLocalNotification(reminder.id);

                  let newReminderId;
                  // 2 - Set the new notification
                  if (reminder.time !== 'none') {
                        await setLocalNotification(id, name, date, time, reminder, repeat).then(
                              id => (newReminderId = id)
                        );
                  } else {
                        // console.log('dont set notif');
                        newReminderId = '';
                  }
                  // console.log('Id sent back', newReminderId);

                  // 3 - Get the new id returned by setLocalNotification
                  reminder.id = newReminderId;

                  // 4 - Set the new state / Dispatch the change
                  await this.setState(
                        {
                              reminder: reminder
                        },
                        () => {
                              this.props.setEventReminderProp(id, reminder);
                        }
                  );
            } else {
                  // TODO: create an alert
                  throw new Error('Location permission not granted');
            }
      };

      setRepeat = async repeat => {
            let { reminder } = this.state;
            this.setState(
                  {
                        repeat: repeat
                  },
                  () => {
                        // await this.setReminder(reminder.time, repeat);
                        this.setReminder(reminder.time, repeat);
                        this.props.setEventRepeatProp(this.props.general.selectedItem.id, repeat);
                  }
            );
      };

      render() {
            console.log('PARENT', this.state.repeat);
            return (
                  <PanGestureHandler
                        maxPointers={1}
                        onGestureEvent={this.onGestureEvent}
                        onHandlerStateChange={this.onGestureEvent}
                        minDist={10}
                  >
                        <Animated.View
                              style={[
                                    styles.container,
                                    {
                                          ...Platform.select({
                                                ios: {
                                                      bottom: -height - 10 - this.state.iosStatusBarHeight
                                                },
                                                android: {
                                                      bottom: -height - 10
                                                }
                                          }),
                                          transform: [{ translateY: this.transY }]
                                    }
                              ]}
                        >
                              <Animated.Code>
                                    {() =>
                                          block([
                                                //                                              cond(eq(this.menuStarted, 0), [
                                                //       set(
                                                //             this.transY,
                                                //             cond(
                                                //                   defined(this.transY),
                                                //                   runSpring(this.clock, this.transY, 50, -420, 20)
                                                //             )
                                                //       ),
                                                //       cond(lessThan(this.transY, -419), [
                                                //             set(this.offsetY, -420),
                                                //             stopClock(this.clock),
                                                //             set(this.menuStarted, 1)
                                                //       ])
                                                // ]),
                                                cond(
                                                      and(
                                                            eq(this.gestureState, State.ACTIVE),
                                                            greaterOrEq(this.transY, -height),
                                                            eq(this.dragging, 0)
                                                      ),
                                                      [stopClock(this.clock), set(this.transY, this.addY)]
                                                ),
                                                cond(
                                                      and(
                                                            eq(this.gestureState, State.ACTIVE),
                                                            lessOrEq(this.transY, -height),
                                                            eq(this.dragging, 0)
                                                      ),
                                                      [set(this.transY, -height), set(this.offsetY, -height)]
                                                ),
                                                //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                ////////////////////////////////////////////////////////// Move Menu ///////////////////////////////////////////////////////////
                                                cond(
                                                      and(
                                                            eq(this.gestureState, State.END),
                                                            and(
                                                                  lessThan(this.transY, -370),
                                                                  greaterThan(this.transY, -470)
                                                            ),
                                                            eq(this.menuReduced, 1)
                                                      ),
                                                      [
                                                            set(
                                                                  this.transY,
                                                                  cond(
                                                                        defined(this.transY),
                                                                        runSpring(this.clock, this.transY, 50, -420, 7)
                                                                  )
                                                            )
                                                      ]
                                                ),

                                                //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                //////////////////////////////////////////////////////// Close Menu /////////////////////////////////////////////////////////
                                                cond(
                                                      and(
                                                            eq(this.gestureState, State.END),
                                                            greaterOrEq(this.transY, -370),
                                                            eq(this.menuReduced, 1)
                                                      ),
                                                      [
                                                            set(
                                                                  this.transY,
                                                                  cond(
                                                                        defined(this.transY),
                                                                        runSpring(this.clock, this.transY, 50, 0, 20)
                                                                  )
                                                            ),
                                                            set(this.dragging, 1),
                                                            cond(greaterThan(this.transY, -1), [
                                                                  set(this.offsetY, 0),
                                                                  stopClock(this.clock),
                                                                  set(this.menuReduced, 0),
                                                                  set(this.menuStarted, 0),
                                                                  set(this.dragging, 0),
                                                                  call([], this.closeMenu)
                                                            ])
                                                      ]
                                                ),

                                                //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                //////////////////////////////////////////////////////// Expand Menu /////////////////////////////////////////////////////////
                                                cond(
                                                      and(
                                                            eq(this.gestureState, State.END),
                                                            lessOrEq(this.transY, -470),
                                                            eq(this.menuReduced, 1)
                                                      ),
                                                      [
                                                            set(
                                                                  this.transY,
                                                                  cond(
                                                                        defined(this.transY),
                                                                        runSpring(
                                                                              this.clock,
                                                                              this.transY,
                                                                              50,
                                                                              -height,
                                                                              20
                                                                        )
                                                                  )
                                                            ),
                                                            set(this.dragging, 1),
                                                            cond(lessThan(this.transY, -height + 1), [
                                                                  set(this.offsetY, -height),
                                                                  stopClock(this.clock),
                                                                  set(this.menuReduced, 0),
                                                                  set(this.menuExpanded, 1),
                                                                  set(this.dragging, 0)
                                                            ])
                                                      ]
                                                ),
                                                //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                //////////////////////////////////////////////////////// Reduce Menu /////////////////////////////////////////////////////////
                                                cond(
                                                      and(
                                                            eq(this.gestureState, State.END),
                                                            greaterOrEq(this.transY, -height + 20),
                                                            eq(this.menuExpanded, 1)
                                                      ),
                                                      [
                                                            set(
                                                                  this.transY,
                                                                  cond(
                                                                        defined(this.transY),
                                                                        runSpring(this.clock, this.transY, 50, -420, 20)
                                                                  )
                                                            ),
                                                            set(this.dragging, 1),
                                                            cond(greaterThan(this.transY, -421), [
                                                                  set(this.offsetY, -420),
                                                                  stopClock(this.clock),
                                                                  set(this.menuExpanded, 0),
                                                                  set(this.menuReduced, 1),
                                                                  set(this.dragging, 0)
                                                            ])
                                                      ]
                                                ),

                                                //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                //////////////////////////////////////////////////////// Move Expanded Menu /////////////////////////////////////////////////////////
                                                cond(
                                                      and(
                                                            eq(this.gestureState, State.END),
                                                            lessThan(this.transY, -height + 20),
                                                            eq(this.menuExpanded, 1)
                                                      ),
                                                      [
                                                            set(
                                                                  this.transY,
                                                                  cond(
                                                                        defined(this.transY),
                                                                        runSpring(
                                                                              this.clock,
                                                                              this.transY,
                                                                              50,
                                                                              -height,
                                                                              7
                                                                        )
                                                                  )
                                                            ),
                                                            set(this.dragging, 1),
                                                            cond(lessOrEq(this.transY, -height + 1), [
                                                                  set(this.offsetY, -height),
                                                                  stopClock(this.clock),
                                                                  set(this.dragging, 0)
                                                            ])
                                                      ]
                                                )
                                          ])
                                    }
                              </Animated.Code>
                              {/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
                        //////////////////////////////////////////         Reminder          ///////////////////////////////////////////// 
                        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

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
                                                                  {getReminderText(this.state.reminder.time)}
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

                              {/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
                        //////////////////////////////////////////         Header          ///////////////////////////////////////////// 
                        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

                              <View style={{ flexDirection: 'row' }}>
                                    {/* <KeyboardAvoidingView style={{ flexDirection: 'row' }} behavior="position" enabled> */}
                                    <TextInput
                                          style={{ height: 40, flex: 1, marginLeft: 8, paddingBottom: 8, fontSize: 16 }}
                                          onChangeText={name => this.changeEventName(name)}
                                          value={this.state.name}
                                    />

                                    {/* </KeyboardAvoidingView> */}
                              </View>

                              {/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
                        //////////////////////////////////////////         Date Setter         ///////////////////////////////////////////// 
                        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

                              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
                                    <View style={{ width: 100 }}>
                                          <TouchableOpacity onPress={this.showDatePicker}>
                                                {this.state.repeat !== 'never' ? (
                                                      <View>
                                                            <Text>Start date</Text>
                                                            <View style={{ flexDirection: 'row' }}>
                                                                  <Ionicons name="ios-repeat" size={20} color="black" />
                                                                  <Text style={{ marginLeft: 8 }}>
                                                                        {this.state.date}
                                                                  </Text>
                                                            </View>
                                                      </View>
                                                ) : (
                                                      <View>
                                                            <Text>Date</Text>
                                                            <Text>{this.state.date}</Text>
                                                      </View>
                                                )}
                                          </TouchableOpacity>
                                    </View>

                                    <View style={{ width: 100, flexDirection: 'column' }}>
                                          <TouchableOpacity
                                                style={{ marginBottom: 12 }}
                                                onPress={this.showStartTimePicker}
                                          >
                                                <Text>Start time:</Text>
                                                <Text>{this.state.time}</Text>
                                          </TouchableOpacity>

                                          <TouchableOpacity onPress={this.showEndTimePicker}>
                                                <Text>End time:</Text>
                                                <Text>{this.state.endTime}</Text>
                                          </TouchableOpacity>
                                    </View>
                              </View>

                              {/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
                        //////////////////////////////////////////         Bottom Bar Menu        ///////////////////////////////////////////// 
                        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

                              <View style={styles.bottomBarMenu}>
                                    <Menu
                                          ref={ref => (this.reminderMenu2 = ref)}
                                          button={
                                                // <Text onPress={() => this.reminderMenu.show()}>Show menu</Text>
                                                <TouchableOpacity onPress={() => this.reminderMenu2.show()}>
                                                      <Ionicons
                                                            name="md-notifications"
                                                            size={30}
                                                            color={
                                                                  this.state.reminder.time !== 'none'
                                                                        ? '#FF2D55'
                                                                        : 'grey'
                                                            }
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
                                    <RepeatButton
                                          setRepeat={this.setRepeat}
                                          repeat={this.props.general.selectedItem.repeat}
                                    />
                                    <TouchableOpacity
                                          style={{ width: 30, alignItems: 'center' }}
                                          onPress={this.deleteTask}
                                    >
                                          <Ionicons name="md-trash" size={30} />
                                    </TouchableOpacity>
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
                        </Animated.View>
                  </PanGestureHandler>
            );
      }
}

const styles = StyleSheet.create({
      container: {
            padding: 16,
            backgroundColor: 'white',
            width: width,
            height: height + 10,
            position: 'absolute',
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            elevation: 15,
            zIndex: 99,
            shadowColor: 'black',
            shadowOffset: { width: 0, height: 0.5 * 5 },
            shadowOpacity: 0.3,
            shadowRadius: 0.8 * 8
      },
      bottomBarMenu: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 24,
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 50
      }
});

function mapStateToProp(state, ownProps) {
      // console.log(state.general);
      let event = state.events[ownProps.id];

      return {
            general: state.general,
            event: event
      };
}

export default connect(
      mapStateToProp,
      mapDispatchToProps
)(EventMenu);

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

function runSpring(clock, value, velocity, dest, damping) {
      const state = {
            finished: new Value(0),
            velocity: new Value(0),
            position: new Value(0),
            time: new Value(0)
      };

      const config = {
            damping: damping,
            mass: 1,
            stiffness: 221.6,
            overshootClamping: false,
            restSpeedThreshold: 0.501,
            restDisplacementThreshold: 0.501,
            toValue: new Value(0)
      };

      return [
            cond(clockRunning(clock), 0, [
                  set(state.finished, 0),
                  set(state.velocity, velocity),
                  set(state.position, value),
                  set(config.toValue, dest),
                  startClock(clock)
            ]),
            spring(clock, state, config),
            cond(state.finished, stopClock(clock)),
            state.position
      ];
}

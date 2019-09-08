// STATIC UI
import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions, TextInput, Alert } from 'react-native';
import { KeyboardAvoidingView, Keyboard } from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';

// ANIMATED UI

// DATA
import { firestoreConnect } from 'react-redux-firebase';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { editEventStartTimeAction, editEventEndTimeAction, deleteEventAction } from '../../Store/actions/eventAction';
import { editEventDateAction, editEventNameAction, syncEventNameAction } from '../../Store/actions/eventAction';
import { closeEventMenuAction } from '../../Store/actions/generalAction';
function mapDispatchToProps(dispatch) {
      return {
            editEventNameProp: (name, id, previousName) => dispatch(editEventNameAction(name, id, previousName)),
            syncEventNameProp: (name, id) => dispatch(syncEventNameAction(name, id)),
            editEventStartTimeProp: (time, endTime, id) => dispatch(editEventStartTimeAction(time, endTime, id)),
            editEventEndTimeProp: (endTime, id) => dispatch(editEventEndTimeAction(endTime, id)),
            editEventDateProp: (date, id) => dispatch(editEventDateAction(date, id)),
            deleteEventProp: id => dispatch(deleteEventAction(id)),
            closeEventMenuProp: () => dispatch(closeEventMenuAction())
      };
}

// HELPERS
import { getToday } from '../../Utils/helpers';
import moment from 'moment';

class EventMenu extends Component {
      state = {
            yValue: new Animated.Value(-400),
            id: '',
            name: '',
            subtask: {},
            date: '',
            time: '',
            endTime: '',
            reminder: '',
            recurrency: '',
            isDatePickerVisible: false,
            isStartTimePickerVisible: false,
            isEndTimePickerVisible: false
      };

      async componentDidMount() {
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

            let date = new Date(year, month, day, 0, 0, 0, 0);

            await this.setState({
                  name: this.props.general.selectedItem.name,
                  completed: this.props.general.selectedItem.completed,
                  date: this.props.general.selectedItem.date != '' ? this.props.general.selectedItem.date : 'No date',
                  time: this.props.general.selectedItem.time != '' ? this.props.general.selectedItem.time : 'No time',
                  endTime:
                        this.props.general.selectedItem.endTime != ''
                              ? this.props.general.selectedItem.endTime
                              : 'No time',
                  dateFormattedForDatePicker: date
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

      handleDatePicked = dateReceived => {
            let date = moment(dateReceived).format('L');
            let previousDate = this.state.date;

            // Close the event menu, if we change the date for another day
            if (date !== previousDate) {
                  this.editEventDate(date);

                  this.hideDatePicker();
                  this.props.closeEventMenuProp();
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
      };

      editEventDate = date => {
            this.setState({
                  date: date
            });

            this.props.editEventDateProp(date, this.props.general.selectedItem.id);
      };

      deleteTask = () => {
            this.props.deleteEventProp(this.props.general.selectedItem);
            this.props.closeEventMenuProp();
      };

      render() {
            return (
                  <Animated.View style={[styles.container, { bottom: this.state.yValue }]}>
                        {/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
                        //////////////////////////////////////////         Header          ///////////////////////////////////////////// 
                        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

                        <View style={{ flexDirection: 'row' }}>
                              <TextInput
                                    style={{ height: 40, flex: 1, marginLeft: 8, paddingBottom: 8, fontSize: 16 }}
                                    onChangeText={name => this.changeEventName(name)}
                                    value={this.state.name}
                              />

                              <TouchableOpacity style={{ width: 30, alignItems: 'center' }} onPress={this.deleteTask}>
                                    <Ionicons name="md-trash" size={30} />
                              </TouchableOpacity>
                        </View>

                        {/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
                        //////////////////////////////////////////         Date Setter         ///////////////////////////////////////////// 
                        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
                              <View style={{ width: 100 }}>
                                    <TouchableOpacity onPress={this.showDatePicker}>
                                          <Text>Date</Text>
                                          <Text>{this.state.date}</Text>
                                    </TouchableOpacity>
                              </View>

                              <View style={{ width: 100, flexDirection: 'column' }}>
                                    <TouchableOpacity style={{ marginBottom: 12 }} onPress={this.showStartTimePicker}>
                                          <Text>Start time:</Text>
                                          <Text>{this.state.time}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={this.showEndTimePicker}>
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

                        {/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
                        //////////////////////////////////////////         Subtask         ///////////////////////////////////////////// 
                        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

                        {/* <View>
                              {subtask.map((item, index) => {
                                    return (
                                          <View key={index} style={{ flexDirection: 'row' }}>
                                                <TouchableOpacity onPress={() => this.toggleCompletion()}>
                                                      <Ionicons
                                                            name="ios-checkmark-circle-outline"
                                                            size={30}
                                                            color={this.state.completed ? 'red' : 'grey'}
                                                      />
                                                </TouchableOpacity>
                                                <TextInput
                                                      style={{
                                                            height: 40,
                                                            borderColor: 'gray',
                                                            borderWidth: 1,
                                                            flex: 1,
                                                            marginRight: 20
                                                      }}
                                                      onChangeText={name => this.changeTaskName(name)}
                                                      value={this.state.name}
                                                />
                                          </View>
                                    );
                              })}
                              <View style={{ flexDirection: 'row' }}>
                                    <TextInput
                                          style={{
                                                height: 40,
                                                borderColor: 'gray',
                                                color: 'grey',
                                                borderWidth: 1,
                                                flex: 1,
                                                marginLeft: 24
                                          }}
                                          onChangeText={name => this.changeTaskName(name)}
                                          value={this.state.subtaskPlaceholder}
                                    />
                              </View>
                        </View> */}

                        {/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
                        //////////////////////////////////////////         Description        ///////////////////////////////////////////// 
                        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

                        {/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
                        //////////////////////////////////////////         Bottom Bar Menu        ///////////////////////////////////////////// 
                        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

                        {/* <View style={styles.bottomBarMenu}>
                              <TouchableOpacity onPress={() => this.toggleCompletion()}>
                                    <Ionicons
                                          name="ios-checkmark-circle-outline"
                                          size={30}
                                          color={this.state.completed ? 'red' : 'grey'}
                                    />
                              </TouchableOpacity>
                        </View> */}
                  </Animated.View>
            );
      }
}

const { width, height } = Dimensions.get('window');
const menuheight = 340;

const styles = StyleSheet.create({
      container: {
            padding: 16,
            backgroundColor: 'white',
            width: width,
            height: 400,
            position: 'absolute',
            bottom: 0,
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

// Sauvegarder des projets, comme une liste de course ou un template

// TODO: Only show date and time if they are set

// STATIC UI
import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions, TextInput } from 'react-native';
import { KeyboardAvoidingView, Keyboard } from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';

// ANIMATED UI

// DATA
import { firestoreConnect } from 'react-redux-firebase';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { editTaskNameAction, syncTaskNameAction, editTaskCompletionAction } from '../../Store/actions/taskAction';
import { editTaskTimeAction, editTaskDateAction, deleteTaskAction } from '../../Store/actions/taskAction';
import { deleteTaskTimeAction, editTaskPositionAction } from '../../Store/actions/taskAction';
import { closeTaskMenuAction } from '../../Store/actions/generalAction';
function mapDispatchToProps(dispatch) {
      return {
            editTaskNameProp: (name, id, previousName) => dispatch(editTaskNameAction(name, id, previousName)),
            syncTaskNameProp: (name, id) => dispatch(syncTaskNameAction(name, id)),
            editTaskCompletionProp: (state, id) => dispatch(editTaskCompletionAction(state, id)),
            editTaskTimeProp: (hour, id) => dispatch(editTaskTimeAction(hour, id)),
            editTaskDateProp: (date, id) => dispatch(editTaskDateAction(date, id)),
            deleteTaskProp: id => dispatch(deleteTaskAction(id)),
            closeTaskMenuProp: () => dispatch(closeTaskMenuAction()),
            deleteTaskTimeProp: id => dispatch(deleteTaskTimeAction(id)),
            editTaskPositionProp: (id, position) => dispatch(editTaskPositionAction(id, position))
      };
}

// HELPERS
import { getToday } from '../../Utils/helpers';
import moment from 'moment';
const { width, height } = Dimensions.get('window');
const menuheight = 340;

class TaskMenu extends Component {
      state = {
            yValue: new Animated.Value(-400),
            subtaskPlaceholder: 'Add a subtask..',
            id: '',
            name: '',
            completed: '',
            subtask: {},
            date: '',
            time: '',
            reminder: '',
            recurrency: '',
            label: [],
            projectId: '',
            isDatePickerVisible: false,
            isTimePickerVisible: false,
            dateFormattedForDatePicker: new Date()
      };

      async componentDidMount() {
            this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
            this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', this._keyboardWillHide);
            if (this.props.general.isTaskMenuOpen === true) {
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

            let date = new Date(year, parseInt(month, 10) - 1, day, 0, 0, 0, 0);

            await this.setState({
                  name: this.props.general.selectedItem.name,
                  completed: this.props.general.selectedItem.completed,
                  date: this.props.general.selectedItem.date != '' ? this.props.general.selectedItem.date : 'No date',
                  time: this.props.general.selectedItem.time != '' ? this.props.general.selectedItem.time : 'No time',
                  dateFormattedForDatePicker: date
            });
      }

      componentWillUnmount() {
            this.keyboardDidHideListener.remove();
            this.keyboardWillHideListener.remove();
      }

      // keyboardWillHide does'nt work on Android
      _keyboardDidHide = () => {
            this.confirmChangeTaskName();
      };

      _keyboardWillHide = () => {
            // On iOS the date picker close the keyboard which cause to unmount the component and make the date picker unavailable
            if (Platform.OS === 'ios') {
                  this.confirmChangeTaskName();
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

            // Close the task menu, if we change the date for another day
            if (date !== previousDate) {
                  this.editTaskDate(date);

                  this.hideDatePicker();
                  this.props.closeTaskMenuProp();
            } else {
                  this.hideDatePicker();
            }
      };

      showTimePicker = () => {
            this.setState({ isTimePickerVisible: true });
      };

      hideTimePicker = () => {
            this.setState({ isTimePickerVisible: false });
      };

      handleTimePicked = timeReceived => {
            let time = moment(timeReceived);
            let position = (position = time.startOf('minute').format('HH:mm:ss'));
            time = time.format('LT');

            if (time.length < 8) {
                  time = '0' + time;
            }

            this.setState(
                  {
                        time: time
                  },
                  () => {
                        // TODO: Change reminder
                        // this.setReminder(this.state.reminder.time);
                        this.props.editTaskTimeProp(time, this.props.general.selectedItem.id);
                        this.props.editTaskPositionProp(this.props.general.selectedItem.id, position);

                        this.hideTimePicker();
                  }
            );
      };

      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      ////////////////////////////////////      Edit Task Func      //////////////////////////////////////////
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      changeTaskName = name => {
            this.setState({
                  name: name
            });
            this.props.syncTaskNameProp(name, this.props.general.selectedItem.id);
      };

      confirmChangeTaskName = () => {
            // TODO:
            // If keyboard open and input item name focus => register the previous name
            let previousName = '';

            // if keyboard close and previousname and name to send are different
            this.props.editTaskNameProp(this.state.name, this.props.general.selectedItem.id, previousName);
      };

      toggleCompletion = () => {
            this.setState(
                  {
                        completed: !this.state.completed
                  },
                  () => {
                        this.props.editTaskCompletionProp(
                              this.props.task.completed,
                              this.props.general.selectedItem.id
                        );
                  }
            );
      };

      editTaskDate = date => {
            this.setState({
                  date: date
            });

            this.props.editTaskDateProp(date, this.props.general.selectedItem.id);
      };

      deleteTask = () => {
            this.props.deleteTaskProp(this.props.general.selectedItem);
            this.props.closeTaskMenuProp();
      };

      deleteTaskTime = () => {
            // TODO: Be careful with reminder/repeat
            // FIXME: What about the position
            this.setState({
                  time: 'No time'
            });
            this.props.deleteTaskTimeProp(this.props.general.selectedItem.id);
      };

      render() {
            let subtask = [0, 1, 2];
            return (
                  <Animated.View style={[styles.container, { bottom: this.state.yValue }]}>
                        {/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
                        //////////////////////////////////////////         Header          ///////////////////////////////////////////// 
                        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

                        <View style={{ flexDirection: 'row' }}>
                              <TouchableOpacity onPress={() => this.toggleCompletion()}>
                                    <Ionicons
                                          name="ios-checkmark-circle-outline"
                                          size={30}
                                          color={this.props.task && this.props.task.completed ? 'red' : 'grey'}
                                    />
                              </TouchableOpacity>

                              <TextInput
                                    style={{ height: 40, flex: 1, marginLeft: 8, paddingBottom: 8, fontSize: 16 }}
                                    onChangeText={name => this.changeTaskName(name)}
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
                                          <Text>Date:</Text>
                                          <Text>{this.state.date}</Text>
                                    </TouchableOpacity>
                              </View>

                              <View style={{ width: 100 }}>
                                    <TouchableOpacity onPress={this.showTimePicker}>
                                          <Text>Start time:</Text>
                                          <Text>{this.state.time}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => this.deleteTaskTime()}>
                                          <Text style={{ marginTop: 8 }}>Delete time</Text>
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
                              isVisible={this.state.isTimePickerVisible}
                              onConfirm={this.handleTimePicked}
                              onCancel={this.hideTimePicker}
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

function mapStateToProp(state, ownProps) {
      // console.log(state.general);
      let task = state.tasks[state.general.selectedItem.id];

      return {
            general: state.general,
            task: task
      };
}

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

export default connect(
      mapStateToProp,
      mapDispatchToProps
)(TaskMenu);

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
function mapDispatchToProps(dispatch) {
      return {
            editTaskNameProp: (name, id, previousName) => dispatch(editTaskNameAction(name, id, previousName)),
            syncTaskNameProp: (name, id) => dispatch(syncTaskNameAction(name, id)),
            editTaskCompletionProp: (state, id) => dispatch(editTaskCompletionAction(state, id)),
            editTaskTimeProp: (hour, id) => dispatch(editTaskTimeAction(hour, id)),
            editTaskDateProp: (date, id) => dispatch(editTaskDateAction(date, id)),
            deleteTaskProp: id => dispatch(deleteTaskAction(id))
      };
}

// HELPERS
import { getToday } from '../../Utils/helpers';
import moment from 'moment';

class ItemMenu extends Component {
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
            isTimePickerVisible: false
      };

      async componentDidMount() {
            this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
            this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', this._keyboardWillHide);
            if (this.props.general.isItemMenuOpen === true) {
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

            await this.setState({
                  name: this.props.general.selectedItem.name,
                  completed: this.props.general.selectedItem.completed,
                  date: this.props.general.selectedItem.date != '' ? this.props.general.selectedItem.date : 'No date',
                  time: this.props.general.selectedItem.time != '' ? this.props.general.selectedItem.time : 'No time'
                  // id: this.props.id != '' ? this.props.id : ''
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

            this.editTaskDate(date);
            this.hideDatePicker();

            // We need to close the item menu after changing the date of the task for another day
            // FIXME:
            // if (date !== previousDate) {
            //       this.closeItemMenu();
            // }
      };

      showTimePicker = () => {
            this.setState({ isTimePickerVisible: true });
      };

      hideTimePicker = () => {
            this.setState({ isTimePickerVisible: false });
      };

      handleTimePicked = timeReceived => {
            let time = moment(timeReceived).format('LT');

            if (time.length < 8) {
                  time = '0' + time;
            }

            this.editTaskTime(time, this.props.general.selectedItem.id);

            this.hideTimePicker();
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
                        this.props.editTaskCompletionProp(this.state.completed, this.props.general.selectedItem.id);
                  }
            );
            // this.props.editTaskCompletionActionProp(!this.state.completed, this.props.general.selectedItem.id);
      };

      editTaskTime = time => {
            this.setState({
                  time: time
            });

            this.props.editTaskTimeProp(time, this.props.general.selectedItem.id);
      };

      editTaskDate = date => {
            this.setState({
                  date: date
            });

            this.props.editTaskDateProp(date, this.props.general.selectedItem.id);
      };

      deleteTask = () => {
            this.props.deleteTaskProp(this.props.general.selectedItem);
            // FIXME:
            // this.closeItemMenu();
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
                                          <Text>Date</Text>
                                          <Text>{this.state.date}</Text>
                                    </TouchableOpacity>
                              </View>

                              <View style={{ width: 100 }}>
                                    <TouchableOpacity onPress={this.showTimePicker}>
                                          <Text>Time</Text>
                                          <Text>{this.state.time}</Text>
                                    </TouchableOpacity>
                              </View>
                        </View>

                        {/*/////////////////////////////////////////         Date Picker       //////////////////////////////////////////// */}
                        <DateTimePicker
                              mode={'date'}
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
      let task = state.tasks[ownProps.id];

      return {
            general: state.general,
            task: task
      };
}

export default connect(
      mapStateToProp,
      mapDispatchToProps
)(ItemMenu);

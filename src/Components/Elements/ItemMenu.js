// Sauvegarder des projets, comme une liste de course ou un template

// TODO: Only show date and time if they are set

import React, { Component } from 'react';
import {
      StyleSheet,
      Text,
      View,
      TouchableOpacity,
      Animated,
      Dimensions,
      TextInput,
      KeyboardAvoidingView
} from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { Ionicons } from '@expo/vector-icons';
import { firestoreConnect } from 'react-redux-firebase';
import { connect } from 'react-redux';
import { compose } from 'redux';

import {
      editTaskNameAction,
      editTaskCompletionAction,
      editTaskTimeAction,
      editTaskDateAction,
      deleteTaskAction
} from '../../Store/actions/taskAction';

import { getToday } from '../../Utils/helpers';

class ItemMenu extends Component {
      state = {
            // yValue: new Animated.Value(-menuheight),
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
            await this.setState({
                  name: this.props.name,
                  completed: this.props.completed,
                  date: this.props.date != '' ? this.props.date : 'No date',
                  time: this.props.time != '' ? this.props.time : 'No time'
                  // id: this.props.id != '' ? this.props.id : ''
            });
      }

      closeItemMenu = () => {
            console.log('close item menu');
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
            if (date !== previousDate) {
                  this.closeItemMenu();
            }
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

            //TODO: Erase that line
            this.setState({
                  time: time
            });
            this.editTaskTime(this.state.time, this.props.id);

            this.hideTimePicker();
      };

      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      ////////////////////////////////////      Edit Task Func      //////////////////////////////////////////
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      changeTaskName = name => {
            this.setState({
                  name: name
            });

            this.props.editTaskNameProp(name, this.props.id);
      };

      toggleCompletion = () => {
            this.props.editTaskCompletionActionProp(!this.props.task.completed, this.props.task.id);
      };

      editTaskTime = time => {
            this.setState({
                  time: time
            });

            this.props.editTaskTimeProp(time, this.props.id);
      };

      editTaskDate = date => {
            this.setState({
                  date: date
            });

            this.props.editTaskDateProp(date, this.props.id);
      };

      deleteTask = () => {
            this.props.deleteTaskProp(this.props.task.id);
            this.closeItemMenu();
      };

      render() {
            let subtask = [0, 1, 2];
            return (
                  <View style={[styles.container]}>
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
                  </View>
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
      let task = state.tasks[ownProps.id];

      return {
            task: task
      };
}

function mapDispatchToProps(dispatch) {
      return {
            editTaskNameProp: (name, id) => dispatch(editTaskNameAction(name, id)),
            editTaskCompletionActionProp: (state, id) => dispatch(editTaskCompletionAction(state, id)),
            editTaskTimeProp: (hour, id) => dispatch(editTaskTimeAction(hour, id)),
            editTaskDateProp: (date, id) => dispatch(editTaskDateAction(date, id)),
            deleteTaskProp: id => dispatch(deleteTaskAction(id))
      };
}

export default compose(
      connect(
            mapStateToProp,
            mapDispatchToProps
      ),
      firestoreConnect([{ collection: 'tasks' }])
)(ItemMenu);

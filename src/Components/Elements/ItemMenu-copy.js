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
            // this.openBottomMenu();

            // console.log(this.props.name);

            await this.setState({
                  name: this.props.name,
                  completed: this.props.completed,
                  date: this.props.date != '' ? this.props.date : 'No date',
                  time: this.props.time != '' ? this.props.time : 'No time'
                  // id: this.props.id != '' ? this.props.id : ''
            });
      }

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
                  this.props.closeItemMenu();
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
            this.setState({
                  completed: !this.state.completed
            });
            this.props.editTaskCompletionActionProp(this.state.completed, this.props.id);
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
            this.props.deleteTaskProp(this.props.id);

            this.setState(
                  {
                        yValue: new Animated.Value(-menuheight), //TODO: delete that line if unecessary
                        subtaskPlaceholder: 'Add a subtask..',
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
                  },
                  () => {
                        this.props.closeItemMenu();
                  }
            );
      };

      render() {
            let subtask = [0, 1, 2];
            return (
                  <View style={[styles.container, { bottom: 0 }]}>
                        {/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
                        //////////////////////////////////////////         Header          ///////////////////////////////////////////// 
                        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

                        <View style={{ flexDirection: 'row' }}>
                              <TouchableOpacity onPress={() => this.toggleCompletion()}>
                                    <Ionicons
                                          name="ios-checkmark-circle-outline"
                                          size={30}
                                          color={this.state.completed ? 'red' : 'grey'}
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
                  </View>
            );
      }
}

const { WIDTH, HEIGHT } = Dimensions.get('window');
const menuheight = 340;

const styles = StyleSheet.create({
      container: {
            padding: 16,
            backgroundColor: 'grey',
            height: menuheight,

            // position: 'absolute',
            // left: 0,
            // right: 0,
            // shadowRadius: 2,
            // shadowOffset: {
            //       width: 0,
            //       height: -3
            // },
            // shadowColor: '#000000',
            // elevation: 24,
            // shadowOpacity: 1,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20
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
            null,
            mapDispatchToProps
      ),
      firestoreConnect([{ collection: 'tasks' }])
)(ItemMenu);

// Sauvegarder des projets, comme une liste de course ou un template

// TODO: Only show date and time if they are set

import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions, TextInput, ScrollView } from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { Ionicons } from '@expo/vector-icons';
import { firestoreConnect } from 'react-redux-firebase';
import { connect } from 'react-redux';
import { compose } from 'redux';

import {
      editTaskName,
      toggleCompletion,
      editTaskTimeAction,
      editTaskDateAction,
      deleteTaskAction
} from '../../Store/actions/taskAction';

class BottomMenu extends Component {
      state = {
            yValue: new Animated.Value(-menuheight),
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
      };

      async componentDidMount() {
            this.openBottomMenu();

            // console.log(this.props.name);

            await this.setState({
                  name: this.props.name,
                  completed: this.props.completed,
                  date: this.props.date != '' ? this.props.date : 'No date',
                  time: this.props.time != '' ? this.props.time : 'No time'
            });
      }

      openBottomMenu = () => {
            Animated.timing(this.state.yValue, {
                  toValue: 0,
                  duration: 100
            }).start();
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

            this.editTaskDate(date, previousDate);
            this.hideDatePicker();
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

            this.props.editTaskName(name, this.props.id);
      };

      toggleCompletion = () => {
            this.setState({
                  completed: !this.state.completed
            });
            this.props.toggleCompletion(this.state.completed, this.props.id);
      };

      editTaskTime = time => {
            this.setState({
                  time: time
            });

            this.props.editTaskTimeProps(time, this.props.id, this.state.date);
      };

      editTaskDate = (date, previousDate) => {
            this.setState({
                  date: date
            });

            this.props.editTaskDateProps(date, this.props.id, previousDate);
      };

      deleteTask = () => {
            this.props.deleteTaskProps(this.state.date, this.props.id);

            this.setState({
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
            });
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
                                          color={this.state.completed ? 'red' : 'grey'}
                                    />
                              </TouchableOpacity>

                              <TextInput
                                    style={{ height: 40, flex: 1, marginLeft: 8, paddingBottom: 8, fontSize: 16 }}
                                    onChangeText={name => this.changeTaskName(name)}
                                    value={this.state.name}
                              />
                              <TouchableOpacity style={{ width: 30, alignItems: 'center' }}>
                                    <Ionicons name="md-more" size={30} />
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

                        {/*/////////////////////////////////////////         Delete       //////////////////////////////////////////// */}
                        <TouchableOpacity onPress={this.deleteTask}>
                              <Text>Click to Delete</Text>
                        </TouchableOpacity>

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

const { WIDTH, HEIGHT } = Dimensions.get('window');
const menuheight = 340;

const styles = StyleSheet.create({
      container: {
            padding: 16,
            backgroundColor: 'white',
            height: menuheight,
            position: 'absolute',
            left: 0,
            right: 0,
            shadowRadius: 2,
            shadowOffset: {
                  width: 0,
                  height: -3
            },
            shadowColor: '#000000',
            elevation: 24,
            shadowOpacity: 1,
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
            editTaskName: (name, id) => dispatch(editTaskName(name, id)),
            toggleCompletion: (state, id) => dispatch(toggleCompletion(state, id)),
            editTaskTimeProps: (hour, id, date) => dispatch(editTaskTimeAction(hour, id, date)),
            editTaskDateProps: (date, id, previousDate) => dispatch(editTaskDateAction(date, id, previousDate)),
            deleteTaskProps: (date, id) => dispatch(deleteTaskAction(date, id))
      };
}

export default compose(
      connect(
            null,
            mapDispatchToProps
      ),
      firestoreConnect([{ collection: 'tasks' }])
)(BottomMenu);

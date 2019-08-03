//Before Validating
//TODO:
// Be carefulf every time you change a prop to an item like date or time it should become -1 of the position

import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Keyboard, ScrollView } from 'react-native';
import { getToday } from '../Utils/helpers';

import { connect } from 'react-redux';
import { addTaskAction, receiveTasksAction, editTasksPositionAction } from '../Store/actions/taskAction';
import { Ionicons } from '@expo/vector-icons';

import Task from './Elements/Task';
import TaskAdder from './Elements/TaskAdder';

class TodayView extends Component {
      componentDidMount() {
            this.props.receiveTasksProp(getToday);
      }

      componentDidUpdate(prevProps) {
            if (!this.props.areTasksSorted && this.props.tasks.length > 0) {
                  this.props.editTasksPositionProp(this.props.tasks);
            }
      }

      render() {
            return (
                  <View style={styles.container}>
                        {/* TODO: Hide the menu button near the DateMover */}
                        {/* ------------------------------------------ Add Task Button ------------------------------------------ */}
                        <TouchableOpacity style={styles.addButtonContainer} onPress={this.props.openItemAdder}>
                              <View style={styles.addButton}>
                                    <Ionicons name="ios-add" size={50} color={'white'} />
                              </View>
                        </TouchableOpacity>
                        {/* ------------------------------------------------------------------------------------------------------------- */}
                        <Text style={{ fontWeight: '900', fontSize: 36, marginBottom: 20 }}>Today</Text>
                        <ScrollView>
                              {this.props.tasks.map((item, index) => {
                                    //FIXME: Could cause weird behavior
                                    if (item.date === getToday) {
                                          return (
                                                // <TouchableOpacity
                                                //       key={index}
                                                //       onPress={() => this.props.toggleItemMenu(item)}
                                                //       style={{ zIndex: 0 }}
                                                // >
                                                <Task
                                                      key={index}
                                                      {...item}
                                                      style={{ zIndex: 0 }}
                                                      toggleItemMenu={() => this.props.toggleItemMenu(item)}
                                                />
                                          );
                                    }
                              })}
                        </ScrollView>
                  </View>
            );
      }
}

function mapStateToProp(state) {
      let tasks = state.tasks ? state.tasks : {};

      let tasksArray = Object.values(tasks);
      let tasksIdArray = Object.keys(tasks);

      // Need to be sure we only sort task of Today
      tasksArray = tasksArray.filter((item, index) => {
            if (item.date !== getToday) {
                  tasksIdArray.splice(index, 1);
            } else {
                  return item.date === getToday;
            }
      });

      // Add an task id field to make objects simpler to manipulate
      tasksArray.map((item, index) => {
            item.id = tasksIdArray[index];
      });

      //Check if tasks are all sorted
      //If one object as a -1 position areTasksSorted is false
      let areTasksSorted = true;
      tasksArray.map((item, index) => {
            // console.log(item);
            if (item.position === -1) {
                  areTasksSorted = false;
            }
      });

      // console.log('ARETASKSSORTED', areTasksSorted);
      //FIXME: If there is not item with -1 position no need to sort the tasks

      //TODO: Create a helper function to manage the sorting
      ////////////////////////////////////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////////////////////////////////////
      let data = tasksArray;
      let dataWithPosition = [];
      let dataWithoutPosition = [];

      let dataToInsert = [];
      let dataToInsertWithTimeProp = [];

      data.map(item => {
            if (item.position !== -1) {
                  dataWithPosition.push(item);
            }
      });

      //Check if there is data without a position index
      //It means it's a data that we moved from an other day
      data.map(item => {
            if (item.position === -1) {
                  dataWithoutPosition.push(item);
            }
      });

      dataWithoutPosition.map(item => {
            //Check if there is data with a time prop and create an array with them
            if (item.time !== '') {
                  dataToInsertWithTimeProp.push(item);
            } else {
                  // Create an array with item that don't have time prop
                  dataToInsert.push(item);
            }
      });

      let newDataArray = [...dataToInsert, ...dataWithPosition, ...dataToInsertWithTimeProp];

      newDataArray.sort(compareTime);
      //For item with time prop, we need to compare them to all item with time prop
      //Get the position of the very first next item and create a new array

      newDataArray.map((item, index) => {
            item.position = index;
      });

      function convertTo24Hour(time) {
            var hours = parseInt(time.substr(0, 2));

            if (time.indexOf('AM') != -1 && hours == 12) {
                  time = time.replace('12', '0');
            }
            if (time.indexOf('PM') != -1 && hours < 12) {
                  time = time.replace(hours, hours + 12);
            }

            return time.replace(/(AM|PM)/, '');
      }

      function compareTime(a, b) {
            //We don't care about the date, just used to make the sort
            var atime = Date.parse('18/02/1992' + ' ' + convertTo24Hour(a.time));
            var btime = Date.parse('18/02/1992' + ' ' + convertTo24Hour(b.time));

            if (atime < btime) {
                  return -1;
            }

            if (atime > btime) {
                  return 1;
            }

            return 0;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////////////////////////////////////

      return {
            tasks: newDataArray,
            areTasksSorted: areTasksSorted
      };
}

function mapDispatchToProps(dispatch) {
      return {
            receiveTasksProp: date => dispatch(receiveTasksAction(date)),
            addTaskProp: task => dispatch(addTaskAction(task)),
            editTasksPositionProp: tasks => dispatch(editTasksPositionAction(tasks))
      };
}

export default connect(
      mapStateToProp,
      mapDispatchToProps
)(TodayView);

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: 'white'
      },
      addButtonContainer: {
            width: 80,
            height: 80,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: height / 2 - 60,
            right: -30,
            zIndex: 1
      },
      addButton: {
            width: 60,
            height: 60,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FF2D55',
            borderRadius: 30
            // shadowRadius: 1,
            // shadowOffset: {
            //       width: 0,
            //       height: 10
            // },
            // shadowColor: '#000000',
            // elevation: 5,
            // shadowOpacity: 1
      }
});

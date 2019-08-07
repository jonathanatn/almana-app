//Before Validating
//TODO:
// Be carefulf every time you change a prop to an item like date or time it should become -1 of the position

import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Keyboard, ScrollView } from 'react-native';
import { getToday } from '../Utils/helpers';

import { connect } from 'react-redux';
import { addTaskAction, receiveTasksAction, editTasksPositionAction } from '../Store/actions/taskAction';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';

import Task from './Elements/Task';
import TaskAdder from './Elements/TaskAdder';

class TodayView extends Component {
      // componentDidMount() {
      //       this.props.receiveTasksProp(getToday);
      // }

      componentDidUpdate(prevProps) {
            if (!this.props.areTasksSorted && this.props.tasks.length > 0) {
                  this.props.editTasksPositionProp(this.props.tasks);
            }
      }

      render() {
            return (
                  <View style={styles.container}>
                        {/* ------------------------------------------ Add Task Button ------------------------------------------ */}
                        <TouchableOpacity style={styles.addButtonContainer} onPress={this.props.openItemAdder}>
                              <View style={styles.addButton}>
                                    <Ionicons name="ios-add" size={50} color={'white'} />
                              </View>
                        </TouchableOpacity>
                        {/* ------------------------------------------------------------------------------------------------------------- */}
                        <Text style={{ fontWeight: '900', fontSize: 36, marginBottom: 20, marginLeft: 12 }}>Today</Text>
                        <ScrollView>
                              {this.props.tasks.map((item, index) => {
                                    return (
                                          <Task
                                                key={index}
                                                {...item}
                                                style={{ zIndex: 0 }}
                                                openItemMenu={() => this.props.openItemMenu(item)}
                                          />
                                    );
                              })}
                        </ScrollView>
                  </View>
            );
      }
}

function mapStateToProp(state) {
      let tasks = state.tasks ? state.tasks : {};

      // console.log('ALL TASKS: ', tasks);
      let areTasksSorted = false;

      let tasksArray = Object.values(tasks);

      // Get tasks of the day
      // FIXME: Would change depdending the day
      tasksArray = tasksArray.filter(item => {
            return item.date === getToday;
      });

      let tasksArrayWithPosition = [];
      let tasksArrayToSort = [];
      let tasksArrayToSortWithTime = [];

      // Create an array with positionned tasks and one with tasks to position
      tasksArray.map(item => {
            // Create an array with unpositioned task that DON'T have time property
            if (item.position === -1 && item.time === '') {
                  tasksArrayToSort.push(item);
                  // Create an array with unpositioned task that HAVE time property
            } else if (item.position === -1 && item.time !== '') {
                  tasksArrayToSortWithTime.push(item);
                  // Create an array with already positioned tasks
            } else {
                  tasksArrayWithPosition.push(item);
            }
      });

      // Set the correct position because if we change the date of an item it inside the same day it will create a hole in the array
      tasksArrayWithPosition.map((item, index) => {
            item.position = index;
      });

      if (tasksArrayToSort.length === 0 && tasksArrayToSortWithTime.length === 0) {
            areTasksSorted = true;
      }

      console.log('tasksArrayToSort', tasksArrayToSort);
      console.log('tasksArrayToSortWithTime', tasksArrayToSortWithTime);
      console.log('tasksArrayWithPosition', tasksArrayWithPosition);

      //SORTING the array with position if it's not empty
      if (tasksArrayWithPosition.length > 0) {
            tasksArrayWithPosition.sort(function(a, b) {
                  return a.position - b.position;
            });
      }

      // We start by pushing at the end all unpositioned tasks that DON'T have time property
      if (tasksArrayToSort.length > 0) {
            tasksArrayToSort.map(item => {
                  // Assigning position as the array length because it will be push to the end
                  // FIXME: ASSIGNATION
                  item.position = tasksArrayWithPosition.length;
                  tasksArrayWithPosition.push(item);
            });
      }

      // We position at the right every unpositioned task that HAVE a time property
      if (tasksArrayToSortWithTime.length > 0) {
            // Sort the tasksArrayToSortWithTime
            tasksArrayToSortWithTime.sort(function(a, b) {
                  let aDate = moment(a.time, 'h:mma');
                  let bDate = moment(b.time, 'h:mma');

                  if (aDate.isBefore(bDate)) {
                        return -1;
                  }
                  if (!aDate.isBefore(bDate)) {
                        return 1;
                  }
                  return 0;
            });

            let tasksPositionedToDelete = [];

            tasksArrayToSortWithTime.map((item, index) => {
                  for (let i = 0; i < tasksArrayWithPosition.length; i++) {
                        if (item.time === tasksArrayWithPosition[i].time) {
                              tasksPositionedToDelete.push(index);
                              item.position = i;
                              tasksArrayWithPosition.slice(i, 0, item);
                              tasksArrayWithPosition.map((item, indexB) => {
                                    if (indexB > i) {
                                          item.position = item.position + 1;
                                    }
                              });
                              break; // Break the loop for that item so we can test the next one
                        }
                  }
            });
            tasksPositionedToDelete.map(item => {
                  tasksArrayToSortWithTime.splice(item, 1);
            });
            tasksPositionedToDelete = [];

            tasksArrayToSortWithTime.map((item, index) => {
                  let itemTimeToPositon = moment(item.time, 'h:mma');
                  for (let i = 0; i < tasksArrayWithPosition.length; i++) {
                        let itemTimePositioned = moment(tasksArrayWithPosition[i].time, 'h:mma');
                        if (itemTimeToPositon.isBefore(itemTimePositioned)) {
                              console.log(itemTimeToPositon);
                              console.log('ISBEFORE');
                              console.log(itemTimePositioned);
                              tasksPositionedToDelete.push(index);
                              item.position = i;
                              tasksArrayWithPosition.slice(i, 0, item);
                              tasksArrayWithPosition.map((item, indexB) => {
                                    if (indexB > i) {
                                          item.position = item.position + 1;
                                    }
                              });
                              break; // Break the loop for that item so we can test the next one
                        }
                  }
            });
            tasksPositionedToDelete.map(item => {
                  tasksArrayToSortWithTime.splice(item, 1);
            });
            tasksPositionedToDelete = [];

            tasksArrayToSortWithTime.map((item, index) => {
                  item.position = tasksArrayWithPosition.length + index;
            });

            tasksArrayWithPosition = [...tasksArrayWithPosition, ...tasksArrayToSortWithTime];
      }

      // Check if there the array tasksArrayToSort is not empty before doing everything
      // TODO: Register all position change in the store (With an action)
      // TODO: What if we don't have task unpositioned (sort the array tasksArrayWithPosition and send that)

      return {
            tasks: tasksArrayWithPosition,
            areTasksSorted: areTasksSorted
            // tasks: tasksArray
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

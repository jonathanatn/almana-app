//Before Validating
//TODO:
// Be carefulf every time you change a prop to an item like date or time it should become -1 of the position

import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { getToday } from '../Utils/helpers';

import { connect } from 'react-redux';
import { addTaskAction, receiveTasksAction, editTasksPositionAction } from '../Store/actions/taskAction';

import Task from './Elements/Task';
import BottomMenu from './Elements/BottomMenu';

class AgendaViewSort extends Component {
      state = {
            isBottomMenuOpen: false
      };

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
                        <Text>Sorting test</Text>
                        <TouchableOpacity onPress={this.addTask}>
                              <Text> Add task </Text>
                        </TouchableOpacity>
                        {this.props.tasks.map((item, index) => {
                              return (
                                    <Text key={index} style={{ marginVertical: 5 }}>
                                          {item.name}, index: {item.position}, time: {item.time}{' '}
                                    </Text>
                              );
                        })}
                  </View>
            );
      }
}

function mapStateToProp(state) {
      let tasks = state.tasks ? state.tasks : {};

      let tasksArray = Object.values(tasks);
      let tasksIdArray = Object.keys(tasks);

      // Add an task id field to make objects silpler to manipulate
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
)(AgendaViewSort);

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: 'white',
            marginTop: 50
      }
});

// date: [
//       {
//             name: 'task1',
//             time: '',
//             position: 0
//       },
//       {
//             name: 'task2',
//             time: '09:30 AM',
//             position: 1
//       },
//       {
//             name: 'task2b',
//             time: '11:45 AM',
//             position: 2
//       },
//       {
//             name: 'task3',
//             time: '11:30 AM',
//             position: -1
//       },
//       {
//             name: 'task4',
//             time: '11:15 AM',
//             position: -1
//       },
//       {
//             name: 'task5 should be at beginning',
//             time: '',
//             position: -1
//       },
//       {
//             name: 'task6',
//             time: '08:10 PM',
//             position: -1
//       }
// ]

// addTask = () => {
//       let data = this.state.date;
//       let dataWithPosition = [];
//       let dataWithoutPosition = [];

//       let dataToInsert = [];
//       let dataToInsertWithTimeProp = [];

//       data.map(item => {
//             if (item.position !== -1) {
//                   dataWithPosition.push(item);
//             }
//       });

//       //Check if there is data without a position index
//       //It means it's a data that we moved from an other day
//       data.map(item => {
//             if (item.position === -1) {
//                   dataWithoutPosition.push(item);
//             }
//       });

//       dataWithoutPosition.map(item => {
//             //Check if there is data with a time prop and create an array with them
//             if (item.time !== '') {
//                   dataToInsertWithTimeProp.push(item);
//             } else {
//                   // Create an array with item that don't have time prop
//                   dataToInsert.push(item);
//             }
//       });

//       let newDataArray = [...dataToInsert, ...dataWithPosition, ...dataToInsertWithTimeProp];

//       newDataArray.sort(compareTime);
//       //For item with time prop, we need to compare them to all item with time prop
//       //Get the position of the very first next item and create a new array

//       newDataArray.map((item, index) => {
//             item.position = index;
//       });

//       function convertTo24Hour(time) {
//             var hours = parseInt(time.substr(0, 2));

//             if (time.indexOf('AM') != -1 && hours == 12) {
//                   time = time.replace('12', '0');
//             }
//             if (time.indexOf('PM') != -1 && hours < 12) {
//                   time = time.replace(hours, hours + 12);
//             }

//             return time.replace(/(AM|PM)/, '');
//       }

//       function compareTime(a, b) {
//             //We don't care about the date, just used to make the sort
//             var atime = Date.parse('18/02/1992' + ' ' + convertTo24Hour(a.time));
//             var btime = Date.parse('18/02/1992' + ' ' + convertTo24Hour(b.time));

//             if (atime < btime) {
//                   return -1;
//             }

//             if (atime > btime) {
//                   return 1;
//             }

//             return 0;
//       }
//       this.setState({
//             date: newDataArray
//       });
// };

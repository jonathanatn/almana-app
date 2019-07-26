//Before Validating
//TODO:
// Make it work with redux and store firebase data (review how you create a new day to add category (morning, etc..))
// Make it work when we delete item
// Make it work with category (morning, afternoon, evening)
// Make 3 versions (without drag and drop, with drag and drop, and with native drag and drop)

import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { getToday } from '../Utils/helpers';

import { connect } from 'react-redux';
import { addTask, receiveTasksAction, editTasksPositionAction } from '../Store/actions/taskAction';

class AgendaViewSort extends Component {
      state = {
            // Send a new date to store without index position (setState)
            //make it comeback to the store ( pass through a map )
            //give an index ( sort )
            //My fake store
            dataRedux: [],
            areTasksSorted: false
      };

      componentDidMount() {
            this.props.receiveTasksProp(getToday);

            // this.props.tasks.length > 0 &&
            //       this.props.tasks.map(item => {
            //             this.props.editTaskPositionProp(item.id, getToday, item.position);
            //       });
      }

      // componentDidUpdate(prevProps) {
      //       // prevProps.tasks[0] && console.log(prevProps.tasks[0].position);
      //       this.props.tasks.length > 0 &&
      //             this.props.tasks.map((item, index) => {
      //                   if (prevProps.tasks[index]) {
      //                         if (prevProps.tasks[index].position !== this.props.tasks[index].position) {
      //                               console.log('componentdidupdate');
      //                               this.props.editTaskPositionProp(item.id, getToday, item.position);
      //                         }
      //                   }

      //                   // if (prevProps.tasks[item.id].position !== this.props.tasks[item.id].position) {
      //                   //       // this.props.editTaskPositionProp(item.id, getToday, item.position);
      //                   //       console.log('componentdidupdate');
      //                   // }
      //             });
      // }

      componentDidUpdate() {
            !this.props.areTasksSorted && this.props.editTasksPositionProp(this.props.tasks, getToday);
            // this.props.tasks.map((item, index) => {
            //       console.log(this.props.tasks);
            //       console.log(item);
            //       this.props.editTaskPositionProp(item.id, getToday, item.position);
            // });
      }

      render() {
            return (
                  <View style={styles.container}>
                        <Text>Sorting test</Text>
                        <TouchableOpacity onPress={this.addTask}>
                              <Text> Add task </Text>
                        </TouchableOpacity>
                        {this.props.tasks.map((item, index) => {
                              // !this.props.areTasksSorted &&
                              //       this.props.editTaskPositionProp(item.id, getToday, item.position);
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
      let tasks = state.tasks[getToday] ? state.tasks[getToday] : {};

      let tasksArray = Object.values(tasks);
      let tasksIdArray = Object.keys(tasks);

      // Add an task id field to make objects silpler to manipulate
      tasksArray.map((item, index) => {
            item.id = tasksIdArray[index];
      });

      //Check if tasks are all sorted
      //If one object as a -1 position areTasksSorted is false
      let areTasksSorted;
      tasksArray.map((item, index) => {
            if (item.position === -1) {
                  areTasksSorted = false;
            } else {
                  areTasksSorted = true;
            }
      });

      // console.log('ARETASKSSORTED', areTasksSorted);

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
            addTask: task => dispatch(addTask(task)),
            editTasksPositionProp: (tasks, date) => dispatch(editTasksPositionAction(tasks, date))
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

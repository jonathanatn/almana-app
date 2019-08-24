import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, Keyboard, BackHandler } from 'react-native';

import { connect } from 'react-redux';
import { getToday } from '../Utils/helpers';
import { addTaskAction, receiveTasksAction, editTasksPositionAction } from '../Store/actions/taskAction';
import { Ionicons } from '@expo/vector-icons';
import Task from './Elements/Task';
import ItemMenu from './Elements/ItemMenu';
import ItemList from './ItemList';
import TaskAdder from './Elements/TaskAdder';
import moment from 'moment';

class AgendaView extends Component {
      state = {
            title: '',
            isDateMoverOpen: false,
            isItemAdderOpen: false,
            isItemMenuOpen: false
      };

      componentDidMount() {
            this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
            this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
            this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', this._keyboardWillHide);
            this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
      }

      componentWillUnmount() {
            this.keyboardDidShowListener.remove();
            this.keyboardDidHideListener.remove();
            this.keyboardWillHideListener.remove();
            this.backHandler.remove();
      }

      //       componentDidUpdate(prevProps) {
      //             if (!this.props.areTasksSorted && this.props.tasks.length > 0) {
      //                   this.props.editTasksPositionProp(this.props.tasks);
      //             }
      //       }

      _keyboardDidShow = () => {
            console.log('keyboard show');
      };

      // keyboardWillHide does'nt work on Android
      _keyboardDidHide = () => {
            console.log('keyboard didhide');
            this.setState({
                  isItemAdderOpen: false
            });
      };

      _keyboardWillHide = () => {
            console.log('keyboard hide');
            this.setState({
                  isItemAdderOpen: false
            });
      };

      // componentDidUpdate(prevProps) {
      //       if (this.props.date !== prevProps.date) {
      //             let day, month, year;
      //             day = this.props.date.substring(3, 5);
      //             month = this.props.date.substring(0, 2);
      //             year = this.props.date.substring(6);

      //             let title = moment().set({
      //                   date: day,
      //                   month: month - 1,
      //                   year: year
      //             });

      //             this.setState({
      //                   title: title.format('dddd')
      //             });
      //       }
      // }

      // componentDidMount() {
      //       let day, month, year;
      //       day = this.props.date.substring(3, 5);
      //       month = this.props.date.substring(0, 2);
      //       year = this.props.date.substring(6);

      //       let title = moment().set({
      //             date: day,
      //             month: month - 1,
      //             year: year
      //       });

      //       this.setState({
      //             title: title.format('dddd')
      //       });
      // }

      openItemAdder = () => {
            this.setState({
                  isItemAdderOpen: true
            });
      };

      render() {
            let day, month, year;
            //     day = this.props.date.substring(3, 5);
            //     month = this.props.date.substring(0, 2);
            //     year = this.props.date.substring(6);

            day = getToday.substring(3, 5);
            month = getToday.substring(0, 2);
            year = getToday.substring(6);

            let title = moment().set({
                  date: day,
                  month: month - 1,
                  year: year
            });

            return (
                  <View style={styles.container}>
                        {/* ------------------------------------------ Add Task Button ------------------------------------------ */}
                        <TouchableOpacity style={styles.addButtonContainer} onPress={this.openItemAdder}>
                              <View style={styles.addButton}>
                                    <Ionicons name="ios-add" size={50} color={'white'} />
                              </View>
                        </TouchableOpacity>
                        {/* ------------------------------------------------------------------------------------------------------------- */}

                        {/* TODO: Create a function to get the day title and put in helper */}
                        <Text
                              style={{
                                    fontWeight: '900',
                                    fontSize: 36,
                                    marginBottom: 20,
                                    marginLeft: 12,
                                    marginTop: 70
                              }}
                        >
                              {this.props.dateProps === getToday
                                    ? 'Today'
                                    : title.format('dddd') + ', ' + title.format('D') + ' ' + title.format('MMM')}
                        </Text>
                        <ItemList date={getToday} />

                        {/*-------------------------------------------------- Task Adder -------------------------------------------------- */}
                        {/* The task adder depend of the key board, if the key board close it will be automatically closed */}
                        {this.state.isItemAdderOpen ? <TaskAdder /> : null}
                  </View>
            );
      }
}

function mapStateToProp(state, ownProps) {
      //       //TODO: Create a function to get the sort and put in helper function
      //       let tasks = state.tasks ? state.tasks : {};

      //       let areTasksSorted = false;

      //       let tasksArray = Object.values(tasks);

      //       // Get tasks of the day
      //       tasksArray = tasksArray.filter(item => {
      //             //     return item.date === ownProps.date;
      //             return item.date === getToday;
      //       });

      //       let tasksArrayWithPosition = [];
      //       let tasksArrayToSort = [];

      //       //Make a distinction between tasks positioned and unpositioned
      //       tasksArray.map(item => {
      //             if (item.position === -1) {
      //                   tasksArrayToSort.push(item);
      //             } else {
      //                   tasksArrayWithPosition.push(item);
      //             }
      //       });

      //       if (tasksArrayToSort.length === 0) {
      //             areTasksSorted = true;
      //       }

      //       //SORTING the array with position if it's not empty
      //       // Set the correct position because if we change the date of an item it inside the same day it will create a hole in the array
      //       if (tasksArrayWithPosition.length > 0) {
      //             tasksArrayWithPosition.sort(function(a, b) {
      //                   return a.position - b.position;
      //             });
      //             tasksArrayWithPosition.map((item, index) => {
      //                   item.position = index;
      //             });
      //       }

      //       tasksArrayToSort.map((item, index) => {
      //             let stopMapping = false;
      //             if (item.time === '') {
      //                   item.position = tasksArrayWithPosition.length;
      //                   tasksArrayWithPosition.push(item);
      //                   stopMapping = true;
      //             }
      //             if (item.time !== '' && stopMapping === false) {
      //                   let stopMappingB = false;

      //                   if (stopMappingB === false) {
      //                         let stopMappingC = false;
      //                         tasksArrayWithPosition.map((itemB, indexB) => {
      //                               if (item.time === itemB.time && stopMappingC === false) {
      //                                     item.position = indexB;
      //                                     tasksArrayWithPosition.splice(indexB, 0, item);
      //                                     tasksArrayWithPosition.map((itemC, indexC) => {
      //                                           if (indexC > indexB) {
      //                                                 itemC.position++;
      //                                           }
      //                                     });

      //                                     stopMappingC = true;
      //                                     stopMappingB = true;
      //                               }
      //                         });
      //                   }

      //                   if (stopMappingB === false) {
      //                         let stopMappingC = false;
      //                         tasksArrayWithPosition.map((itemB, indexB) => {
      //                               let timeToSort = moment(item.time, 'h:mma');
      //                               let timeWithPosition = moment(itemB.time, 'h:mma');

      //                               if (timeToSort.isBefore(timeWithPosition) && stopMappingC === false) {
      //                                     item.position = indexB;
      //                                     tasksArrayWithPosition.splice(indexB, 0, item);
      //                                     tasksArrayWithPosition.map((itemC, indexC) => {
      //                                           if (indexC > indexB) {
      //                                                 itemC.position++;
      //                                           }
      //                                     });

      //                                     stopMappingC = true;
      //                                     stopMappingB = true;
      //                               }
      //                         });
      //                   }

      //                   if (stopMappingB === false) {
      //                         item.position = tasksArrayWithPosition.length;
      //                         tasksArrayWithPosition.push(item);
      //                   }

      //                   //FIXME:
      //                   //areTasksSorted = true;
      //             }
      //       });

      return {
            dateProps: getToday
            //     tasks: tasksArrayWithPosition,
            //     areTasksSorted: areTasksSorted
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
)(AgendaView);

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
            zIndex: 10
      },
      addButton: {
            width: 60,
            height: 60,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FF2D55',
            borderRadius: 30
      }
});

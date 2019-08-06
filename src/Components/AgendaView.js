import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView } from 'react-native';

import { connect } from 'react-redux';
import { getToday } from '../Utils/helpers';
import { addTaskAction, receiveTasksAction } from '../Store/actions/taskAction';
import { Ionicons } from '@expo/vector-icons';
import Task from './Elements/Task';
import ItemMenu from './Elements/ItemMenu';
import moment from 'moment';

class AgendaView extends Component {
      state = {
            title: ''
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

      render() {
            let day, month, year;
            day = this.props.date.substring(3, 5);
            month = this.props.date.substring(0, 2);
            year = this.props.date.substring(6);

            let title = moment().set({
                  date: day,
                  month: month - 1,
                  year: year
            });

            return (
                  <View style={styles.container}>
                        {/* ------------------------------------------ Add Task Button ------------------------------------------ */}
                        <TouchableOpacity style={styles.addButtonContainer} onPress={this.props.openItemAdder}>
                              <View style={styles.addButton}>
                                    <Ionicons name="ios-add" size={50} color={'white'} />
                              </View>
                        </TouchableOpacity>
                        {/* ------------------------------------------------------------------------------------------------------------- */}
                        <Text style={{ fontWeight: '900', fontSize: 36, marginBottom: 20, marginLeft: 12 }}>
                              {title.format('dddd') + ', ' + title.format('D') + ' ' + title.format('MMM')}
                        </Text>
                        <ScrollView>
                              {this.props.tasks.map((item, index) => {
                                    return (
                                          <Task
                                                key={index}
                                                {...item}
                                                openItemMenu={() => this.props.openItemMenu(item)}
                                          />
                                    );
                              })}
                        </ScrollView>
                  </View>
            );
      }
}

function mapStateToProp(state, ownProps) {
      let tasks = state.tasks ? Object.values(state.tasks) : [];

      tasks = tasks.filter(item => {
            return item.date === ownProps.date;
      });

      console.log('TASKS', tasks);

      let areTasksSorted = true;

      tasks.map(item => {
            if (item.position === -1) {
                  areTasksSorted = false;
            }
      });

      console.log(areTasksSorted);

      //What if there is only -1 items and no other items

      if (areTasksSorted === false) {
            let tasksWithPosition = tasks.filter(item => {
                  if (item.position !== -1) {
                        return item;
                  }
            });

            let tasksWithoutPosition = tasks.filter(item => {
                  if (item.position === -1) {
                        return item;
                  }
            });

            let newArray = [...tasksWithPosition];

            //What if the unpositioned object have no time

            tasksWithoutPosition.map(item => {
                  if (item.time !== '') {
                        for (let i = 0; i < tasksWithPosition.length; i++) {
                              if (tasksWithPosition[i].time !== '') {
                                    let itemDate = moment(tasksWithPosition[i].time, 'h:mma');
                                    let dateToCompare = moment(item.time, 'h:mma');
                                    //If the new date is earlier we splice the tasksWithPosition
                                    if (dateToCompare.isBefore(itemDate)) {
                                          item.position = i;
                                          newArray.splice(i, 0, item);
                                          break;
                                    }
                                    //If the new date is equal we splice the array
                                    if (dateToCompare === itemDate) {
                                          item.position = i;
                                          newArray.splice(i, 0, item);
                                          break;
                                    }
                                    //If it's the last date it will be push at the end of the array
                                    item.position = i;
                                    newArray.push(item);
                                    break;
                              }
                              // If i === array.length - 1, it means the array only contains items with no time
                              // so we push the item with a date at the end
                              if (tasksWithPosition[i].time === '' && i === tasksWithPosition.length - 1) {
                                    console.log('there is no date');
                                    item.position = i;
                                    newArray.push(item);
                              }
                        }
                  } else {
                        //If the unpositioned item have no time we simply put it at the end
                        item.position = tasksWithPosition.length - 1;
                        newArray.push(item);
                  }
            });
      }

      return {
            dateProps: ownProps.date,
            tasks: tasks
      };
}

function mapDispatchToProps(dispatch) {
      return {
            receiveTasksProp: date => dispatch(receiveTasksAction(date)),
            addTaskProp: task => dispatch(addTaskAction(task))
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
            zIndex: 1
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

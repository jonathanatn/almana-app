// STATIC UI
import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, Keyboard, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Task from './Elements/Task';
import ItemMenu from './Elements/ItemMenu';
import ItemList from './ItemList';
import TaskAdder from './Elements/TaskAdder';
import NavigationView from './NavigationView';
import MonthlyCalendar from './MonthlyCalendar';

// ANIMATED UI
import Animated, { Easing } from 'react-native-reanimated';
import { PanGestureHandler, State, TapGestureHandler } from 'react-native-gesture-handler';
const { cond, eq, add, call, set, Value, event, block, and, Clock, neq, timing, stopClock, interpolate } = Animated;
const { greaterThan, lessThan, diff, or, debug, startClock, lessOrEq, greaterOrEq, Extrapolate } = Animated;

// DATA
import { connect } from 'react-redux';
import { addTaskAction, receiveTasksAction, editTasksPositionAction } from '../Store/actions/taskAction';
import {
      openItemMenuAction,
      closeItemMenuAction,
      openTaskAdderAction,
      openDateMoverAction,
      closeDateMoverAction
} from '../Store/actions/generalAction';
function mapDispatchToProps(dispatch) {
      return {
            receiveTasksProp: date => dispatch(receiveTasksAction(date)),
            addTaskProp: task => dispatch(addTaskAction(task)),
            editTasksPositionProp: tasks => dispatch(editTasksPositionAction(tasks)),
            openDateMoverProp: () => dispatch(openDateMoverAction()),
            closeDateMoverProp: () => dispatch(closeDateMoverAction()),
            closeItemMenuProp: () => dispatch(closeItemMenuAction()),
            openTaskAdderProp: () => dispatch(openTaskAdderAction())
      };
}

// HELPERS
import moment from 'moment';
import { getToday } from '../Utils/helpers';

class MainScreen extends Component {
      constructor(props) {
            super(props);
            // DateMover
            this.clock = new Clock();
            this.transY = new Value(400);
      }

      componentDidMount() {
            this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
      }

      componentWillUnmount() {
            this.backHandler.remove();
      }

      handleBackPress = () => {
            if (this.props.general.isItemMenuOpen === true) {
                  this.props.closeItemMenuProp();
                  return true;
            }

            if (this.state.isDateMoverOpen === true) {
                  this.transY.setValue(400);
            }
      };

      openTaskAdder = () => {
            if (this.props.general.isDateMoverOpen === true) {
                  this.closeDateMover();
            }
            if (this.props.general.isItemMenuOpen === true) {
                  this.props.closeItemMenuProp();
            }
            this.props.openTaskAdderProp();
      };

      // DateMover

      scrollToIndex = () => {
            this.child.scrollToIndex();
      };

      openDateMover = () => {
            this.transY.setValue(0);
            this.props.openDateMoverProp();
      };

      closeDateMover = () => {
            this.transY.setValue(400);
            this.props.closeDateMoverProp();
      };

      render() {
            let day, month, year;
            day = this.props.general.dateSelectedDateMover.substring(3, 5);
            month = this.props.general.dateSelectedDateMover.substring(0, 2);
            year = this.props.general.dateSelectedDateMover.substring(6);

            let title = moment().set({
                  date: day,
                  month: month - 1,
                  year: year
            });

            let formattedMonth = this.props.general.visibleMonth && this.props.general.visibleMonth;

            return (
                  <View style={styles.container}>
                        {/* TODO: Create a function to get the day title and put in helper */}
                        <Text style={styles.mainTitle}>
                              {this.props.general.dateSelectedDateMover === getToday
                                    ? 'Today'
                                    : title.format('dddd') + ', ' + title.format('D') + ' ' + title.format('MMM')}
                        </Text>
                        <ItemList style={{ zIndex: 10 }} closeDateMover={this.closeDateMover} />

                        {/* TODO: Create a component */}
                        {/* ------------------------------------------ Add Task Button ------------------------------------------ */}
                        <TouchableOpacity style={styles.addButtonContainer} onPress={this.openTaskAdder}>
                              <View style={styles.addButton}>
                                    <Ionicons name="ios-add" size={50} color={'white'} />
                              </View>
                        </TouchableOpacity>

                        {/* ------------------------------------------------------------------------------------------------------------- */}

                        {this.props.general.isItemMenuOpen === true && <ItemMenu />}

                        <NavigationView openDateMover={() => this.openDateMover()} />

                        {/*---------------------------------------------------- DateMover ---------------------------------------------------- */}
                        <Animated.View
                              style={[styles.dateMoverContainer, { transform: [{ translateY: this.transY }] }]}
                        >
                              <View
                                    style={{
                                          flexDirection: 'row',
                                          marginTop: 16,
                                          marginHorizontal: 24,
                                          marginBottom: 8
                                    }}
                              >
                                    <Text style={{ fontSize: 18, fontWeight: '500', flex: 1 }}>{formattedMonth}</Text>

                                    <TouchableOpacity onPress={this.scrollToIndex} style={{ alignSelf: 'flex-end' }}>
                                          <Ionicons name="ios-calendar" size={30} />
                                          <View
                                                style={{
                                                      width: 6,
                                                      height: 6,
                                                      backgroundColor: '#FF2D55',
                                                      position: 'relative',
                                                      right: -15,
                                                      bottom: 13,
                                                      borderRadius: 50
                                                }}
                                          />
                                    </TouchableOpacity>
                              </View>

                              <MonthlyCalendar
                                    onRef={ref => (this.child = ref)}
                                    //Get back the selected date to display the right agenda day
                                    getSelectedDate={this.getSelectedDate}
                                    //Get back the visible month to display the right name in the DateMover component
                                    getVisibleMonth={this.getVisibleMonth}
                              />

                              <TouchableOpacity onPress={() => this.closeDateMover()}>
                                    <Animated.View
                                          style={{
                                                width: 60,
                                                height: 60,
                                                marginBottom: 10,
                                                alignSelf: 'center',
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                          }}
                                    >
                                          <Ionicons name="ios-close" size={40} color={'#FF2D55'} />
                                    </Animated.View>
                              </TouchableOpacity>
                        </Animated.View>

                        {/*-------------------------------------------------- Task Adder -------------------------------------------------- */}
                        {/* The task adder depend of the key board, if the key board close it will be automatically closed */}
                        {this.props.general.isTaskAdderOpen ? <TaskAdder /> : null}
                  </View>
            );
      }
}

function mapStateToProp(state, ownProps) {
      return {
            general: state.general
      };
}

export default connect(
      mapStateToProp,
      mapDispatchToProps
)(MainScreen);

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: 'white'
      },
      mainTitle: {
            fontWeight: '900',
            fontSize: 36,
            marginBottom: 20,
            marginLeft: 12,
            marginTop: 70
      },
      addButtonContainer: {
            width: 80,
            height: 80,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: height / 2 - 60,
            right: -30,
            zIndex: 9,
            elevation: 6
      },
      addButton: {
            width: 60,
            height: 60,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FF2D55',
            borderRadius: 30,
            elevation: 5,
            shadowColor: 'black',
            shadowOffset: { width: 0, height: 0.5 * 5 },
            shadowOpacity: 0.3,
            shadowRadius: 0.8 * 5
      },
      dateMoverContainer: {
            flex: 1,
            backgroundColor: 'white',
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
      }
});

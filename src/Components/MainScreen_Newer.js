import React, { Component } from 'react';

// STATIC UI
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, Keyboard, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Task from './Elements/Task';
import ItemMenu from './Elements/ItemMenu';
import ItemList from './ItemList';
import TaskAdder from './Elements/TaskAdder';
import NavigationView from './NavigationView';
import MonthlyCalendar from './MonthlyCalendar';

// ANIMATED UI
import Animated from 'react-native-reanimated';
import { PanGestureHandler, State, TapGestureHandler } from 'react-native-gesture-handler';
const { cond, eq, add, call, set, Value, event, block, and, Clock } = Animated;
const { greaterThan, lessThan, diff, or, debug, startClock, lessOrEq, greaterOrEq } = Animated;

// DATA
import { connect } from 'react-redux';
import { addTaskAction, receiveTasksAction, editTasksPositionAction } from '../Store/actions/taskAction';

// HELPERS
import moment from 'moment';
import { getToday } from '../Utils/helpers';

class MainScreen extends Component {
      constructor(props) {
            super(props);

            // DateMover
            this.onGestureState = new Value(-1);
            this.onGestureState2 = new Value(-1);
            this.onGestureEvent = event([
                  {
                        nativeEvent: {
                              state: this.onGestureState
                        }
                  }
            ]);

            this.onGestureEvent2 = event([
                  {
                        nativeEvent: {
                              state: this.onGestureState2
                        }
                  }
            ]);

            this.transY = new Value(400);
      }

      state = {
            title: '',
            isDateMoverOpen: false,
            isItemAdderOpen: false,
            isItemMenuOpen: false,

            itemMenuProps: '',

            // DateMover
            visibleMonth: 0,
            formattedDate: getToday
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

      handleBackPress = () => {
            if (this.state.isItemMenuOpen === true) {
                  //       this.closeItemMenu();
                  this.setState({
                        isItemMenuOpen: false
                  });
                  return true;
            }

            if (this.state.isDateMoverOpen === true) {
                  //       this.closeDateMover();
                  return true;
            }
      };

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
            console.log('keyboard willhide');
            this.setState({
                  isItemAdderOpen: false
            });
      };

      openItemMenu = item => {
            console.log(item);
            if (this.state.isItemMenuOpen === false) {
                  this.setState({
                        itemMenuProps: item,
                        isItemMenuOpen: true
                  });
            } else {
                  this.setState({
                        isItemMenuOpen: false
                  });
            }
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

      // DateMover

      scrollToIndex = () => {
            this.child.scrollToIndex(); // do stuff
      };

      getSelectedDate = (day, month) => {
            let selectedMonth = moment()
                  .add(month - 12, 'month')
                  .format('L');
            let momentDate = moment().set({
                  date: day,
                  month: parseInt(selectedMonth.substring(0, 2)) - 1,
                  year: selectedMonth.substring(6)
            });

            this.setState({
                  formattedDate: momentDate.format('L')
            });
      };

      getVisibleMonth = month => {
            this.setState({
                  visibleMonth: month
            });
      };

      openDateMover = () => {
            console.log('open date mover');
            this.setState({
                  isDateMoverOpen: true
            });
      };

      closeDateMover = () => {
            console.log('close date mover');
            this.setState({
                  isDateMoverOpen: false
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
                        {/* TODO: Create a function to get the day title and put in helper */}
                        <Text style={styles.mainTitle}>
                              {this.props.dateProps === getToday
                                    ? 'Today'
                                    : title.format('dddd') + ', ' + title.format('D') + ' ' + title.format('MMM')}
                        </Text>
                        <ItemList style={{ zIndex: 10 }} date={getToday} openItemMenu={this.openItemMenu} />

                        {/* TODO: Create a component */}
                        {/* ------------------------------------------ Add Task Button ------------------------------------------ */}
                        <TouchableOpacity style={styles.addButtonContainer} onPress={this.openItemAdder}>
                              <View style={styles.addButton}>
                                    <Ionicons name="ios-add" size={50} color={'white'} />
                              </View>
                        </TouchableOpacity>

                        {/* ------------------------------------------------------------------------------------------------------------- */}

                        {this.state.isItemMenuOpen === true && (
                              <ItemMenu
                                    {...this.state.itemMenuProps}
                                    // closeItemMenu={() => this.closeItemMenu()}
                              />
                        )}

                        {/* TODO: If possible do a this.transY.setValue to open the menu (possible with spring animation) */}
                        <NavigationView openDateMover={() => this.openDateMover()} />

                        {/*---------------------------------------------------- DateMover ---------------------------------------------------- */}

                        {/* TODO: Change name of event, gesture, transY */}
                        <Animated.Code>
                              {() =>
                                    block([
                                          cond(eq(this.onGestureState, State.BEGAN), [
                                                set(this.transY, 400),
                                                call([], this.closeDateMover)
                                          ]),
                                          cond(eq(this.onGestureState2, State.BEGAN), [
                                                set(this.transY, 0),
                                                call([], this.openDateMover)
                                          ])
                                    ])
                              }
                        </Animated.Code>

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
                                    <Text style={{ fontSize: 18, fontWeight: '500', flex: 1 }}>
                                          {this.state.visibleMonth}
                                    </Text>

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

                              <TapGestureHandler onHandlerStateChange={this.onGestureEvent}>
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
                              </TapGestureHandler>
                        </Animated.View>

                        <TapGestureHandler onHandlerStateChange={this.onGestureEvent2}>
                              <Animated.View
                                    style={{
                                          width: 60,
                                          height: 60,
                                          position: 'absolute',
                                          bottom: 20,
                                          alignSelf: 'center',
                                          justifyContent: 'center',
                                          alignItems: 'center',
                                          backgroundColor: 'blue',
                                          zIndex: 3,
                                          elevation: 3
                                    }}
                              ></Animated.View>
                        </TapGestureHandler>

                        {/*-------------------------------------------------- Task Adder -------------------------------------------------- */}
                        {/* The task adder depend of the key board, if the key board close it will be automatically closed */}
                        {this.state.isItemAdderOpen ? <TaskAdder /> : null}
                  </View>
            );
      }
}

function mapDispatchToProps(dispatch) {
      return {
            receiveTasksProp: date => dispatch(receiveTasksAction(date)),
            addTaskProp: task => dispatch(addTaskAction(task)),
            editTasksPositionProp: tasks => dispatch(editTasksPositionAction(tasks))
      };
}

export default connect(
      null,
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

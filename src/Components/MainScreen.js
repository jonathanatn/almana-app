// TODO:
// - Create a special function for the back button, don't use a toggle animation because it involve more than just animated the calendar menu (like going back to home)
// - If the month contains 6weeks make the calendar height bigger
// - When I go to another month and after I go back to my day on scrolling on it, my calendar come back to that date

class MainScreen extends PureComponent {
      state = {
            isDateMoverOpen: false,
            isItemAdderOpen: false,
            isItemMenuOpen: false,
            yValueDateMover: new Animated.Value(-400),
            // yValueItemAdder: new Animated.Value(-calendarMenuHeight -10),
            yValueItemMenu: new Animated.Value(-calendarMenuHeight - 10),

            //Props that will be passed to the task we click on (TodayView/Task) to BottomMenu
            itemMenuProps: {},

            //Props from the DateMover
            //formattedDate is passed to the AgendaView in order to display the correct day
            visibleMonth: 0,
            formattedDate: 0
      };

      componentDidMount() {
            this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
            this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);

            this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
      }

      componentWillUnmount() {
            // this.keyboardDidShowListener.remove();
            this.keyboardDidHideListener.remove();

            this.backHandler.remove();
      }

      handleBackPress = () => {
            if (this.state.isItemMenuOpen === true) {
                  this.closeItemMenu();
                  return true;
            }

            if (this.state.isDateMoverOpen === true) {
                  this.closeDateMover();
                  return true;
            }
      };

      _keyboardDidShow = () => {
            // If the taskadder is not open we can put higher the itemmenu position so the keyboard doesn't overlap
            if (this.state.isItemAdderOpen === false) {
                  Animated.timing(this.state.yValueItemMenu, {
                        toValue: 140,
                        duration: 100
                  }).start();
            }
      };

      _keyboardDidHide = () => {
            //If the item adder is open, closing the keyboard will close it as well
            this.closeItemAdder();
            // If isItemAdderOpen === true, means that we click on the itemAdder
            // If the key board close by clicking send

            if (this.state.isItemMenuOpen === true) {
                  Animated.timing(this.state.yValueItemMenu, {
                        toValue: 0,
                        duration: 100
                  }).start();
            }
      };

      // {/*------------------------------------------------------------------------------------------------------------------------
      // ------------------------------------------------------ ItemAdder ------------------------------------------------------
      // ---------------------------------------------------------------------------------------------------------------------------*/}

      //Closing is managed by _keyboardDidHide()
      openItemAdder = () => {
            if (this.state.isItemMenuOpen === true) {
                  this.closeItemMenu();
            }

            this.setState(
                  {
                        isItemAdderOpen: true
                  },
                  () => {
                        //On the agenda view I don't want to superpose my datemover and itemadder
                        if (this.state.isDateMoverOpen === true) {
                              Animated.timing(this.state.yValueDateMover, {
                                    toValue: -400,
                                    duration: 100
                              }).start();
                        }
                  }
            );
      };

      closeItemAdder = () => {
            if (this.state.isItemAdderOpen === true) {
                  if (this.state.isDateMoverOpen === true) {
                        Animated.timing(this.state.yValueDateMover, {
                              toValue: 0,
                              duration: 100
                        }).start();
                  }
                  this.setState({
                        isItemAdderOpen: false
                  });
            }
      };

      // {/*------------------------------------------------------------------------------------------------------------------------
      // ------------------------------------------------------ DateMover ------------------------------------------------------
      // ---------------------------------------------------------------------------------------------------------------------------*/}

      openDateMover = () => {
            this.setState(
                  {
                        isDateMoverOpen: true
                  },
                  () => {
                        Animated.timing(this.state.yValueDateMover, {
                              toValue: 0,
                              duration: 100
                        }).start();
                  }
            );
      };

      closeDateMover = () => {
            Animated.timing(this.state.yValueDateMover, {
                  toValue: -400,
                  duration: 100
            }).start(() => {
                  this.setState({
                        isDateMoverOpen: false
                  });
            });
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

      scrollToIndex = () => {
            this.child.scrollToIndex(); // do stuff
      };

      // {/*------------------------------------------------------------------------------------------------------------------------
      // ------------------------------------------------------ ItemMenu ------------------------------------------------------
      // ---------------------------------------------------------------------------------------------------------------------------*/}

      openItemMenu = async itemProps => {
            if (this.state.isItemMenuOpen === false) {
                  this.setState(
                        {
                              itemMenuProps: itemProps,
                              isItemMenuOpen: true
                        },
                        () => {
                              //Dismiss the keyboard if never the TaskAdder is open, so the TaskAdder close as well
                              // FIXME: Maybe it's not the best idea to dismiss the keyboard, maybe if the TaskAdder is open the agenda/today view should not be clickable
                              Keyboard.dismiss();
                              Animated.timing(this.state.yValueItemMenu, {
                                    toValue: 0,
                                    duration: 100
                              }).start();

                              //On the agenda view I don't want to superpose my datemover and itemmenu
                              if (this.state.isDateMoverOpen === true) {
                                    Animated.timing(this.state.yValueDateMover, {
                                          toValue: -400,
                                          duration: 100
                                    }).start();
                              }
                        }
                  );
                  //Check if we are not clicking one the same task to avoid useless animation
            } else if (this.state.itemMenuProps !== itemProps) {
                  this.setState(
                        {
                              itemMenuProps: {},
                              isItemMenuOpen: false
                        },
                        () => {
                              this.setState({
                                    itemMenuProps: itemProps,
                                    isItemMenuOpen: true
                              });

                              Animated.sequence([
                                    Animated.timing(this.state.yValueItemMenu, {
                                          toValue: -calendarMenuHeight - 10,
                                          duration: 100
                                    }),
                                    Animated.timing(this.state.yValueItemMenu, {
                                          toValue: 0,
                                          duration: 100
                                    })
                              ]).start();
                        }
                  );
            }
      };

      closeItemMenu = () => {
            this.setState(
                  {
                        itemMenuProps: {},
                        isItemMenuOpen: false
                  },
                  () => {
                        Animated.timing(this.state.yValueItemMenu, {
                              toValue: -calendarMenuHeight - 10,
                              duration: 100
                        }).start();

                        // If I'm in the agenda, I need to show my datemover when I close itemmenu
                        if (this.state.isDateMoverOpen === true) {
                              Animated.timing(this.state.yValueDateMover, {
                                    toValue: 0,
                                    duration: 100
                              }).start();
                        }
                  }
            );
      };

      render() {
            return (
                  <View style={styles.container}>
                        {/*---------------------------------------------------- Views ---------------------------------------------------- */}
                        {this.state.isDateMoverOpen ? (
                              <AgendaView
                                    date={this.state.formattedDate}
                                    openItemMenu={this.openItemMenu}
                                    openItemAdder={() => this.openItemAdder()}
                              />
                        ) : (
                              <TodayView openItemMenu={this.openItemMenu} openItemAdder={() => this.openItemAdder()} />
                        )}

                        {/*-------------------------------------------------- Item Menu -------------------------------------------------- */}
                        <Animated.View
                              style={[
                                    styles.calendarMenu,
                                    { bottom: this.state.yValueItemMenu, width: width, zIndex: 15 }
                              ]}
                        >
                              {this.state.isItemMenuOpen ? (
                                    <ItemMenu
                                          {...this.state.itemMenuProps}
                                          closeItemMenu={() => this.closeItemMenu()}
                                    />
                              ) : null}
                        </Animated.View>

                        {/*-------------------------------------------------- Task Adder -------------------------------------------------- */}
                        {/* The task adder depend of the key board, if the key board close it will be automatically closed */}
                        {this.state.isItemAdderOpen ? <TaskAdder /> : null}

                        {/*---------------------------------------------------- DateMover ---------------------------------------------------- */}
                        {/* Keep the date mover like that for the moment are we will have to pass getSelectedDate and getVisibleMonth through 2 parents */}
                        <Animated.View style={[styles.dateMover, { bottom: this.state.yValueDateMover }]}>
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
                                    {/* TODO: Make the icon change color if we reach the visible month */}
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
                              {/* //FIXME: To increase performance we could load the component at the launch, but first we
                              should try with Reanimated library */}
                              <FlatListCalendar
                                    onRef={ref => (this.child = ref)}
                                    //Get back the selected date to display the right agenda day
                                    getSelectedDate={this.getSelectedDate}
                                    //Get back the visible month to display the right name in the DateMover component
                                    getVisibleMonth={this.getVisibleMonth}
                              />
                              {/* <FlatListCalendar
                                    onRef={ref => (this.child = ref)}
                                    //Get back the selected date to display the right agenda day
                                    getSelectedDate={this.getSelectedDate}
                                    //Get back the visible month to display the right name in the DateMover component
                                    getVisibleMonth={this.getVisibleMonth}
                              /> */}

                              <TouchableOpacity
                                    style={{
                                          width: 60,
                                          height: 60,
                                          marginBottom: 10,
                                          alignSelf: 'center',
                                          justifyContent: 'center',
                                          alignItems: 'center'
                                    }}
                                    onPress={() => this.closeDateMover()}
                              >
                                    <Ionicons name="ios-close" size={40} color={'#FF2D55'} />
                              </TouchableOpacity>
                        </Animated.View>

                        {/*----------------------------------------------- Main Navigation ----------------------------------------------- */}
                        {/* The navigation close if the date mover is open to avoid tap bug */}
                        {!this.state.isDateMoverOpen ? (
                              <NavigationView openDateMover={() => this.openDateMover()} />
                        ) : null}
                  </View>
            );
      }
}

function mapStateToProp(state, ownProps) {
      return {};
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
)(MainScreen);

const calendarMenuHeight = 340;

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: 'white',
            paddingTop: 50
      },
      calendarMenu: {
            width: width,
            height: calendarMenuHeight,
            backgroundColor: 'white',
            position: 'absolute',
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
      dateMover: {
            width: width,
            // height: calendarMenuHeight,
            backgroundColor: 'white',
            position: 'absolute',
            shadowRadius: 2,
            shadowOffset: {
                  width: 0,
                  height: -3
            },
            shadowColor: '#000000',
            elevation: 24,
            shadowOpacity: 1,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30
      },
      button: {
            backgroundColor: 'steelblue',
            height: 25,
            alignSelf: 'center',
            marginTop: 30
      }
});

// Sort by ui, component, element, helpers; etc..

import React, { Component, PureComponent } from 'react';
import {
      View,
      Text,
      StyleSheet,
      Dimensions,
      TouchableOpacity,
      Animated,
      Easing,
      KeyboardAvoidingView,
      Keyboard,
      BackHandler
} from 'react-native';
import { connect } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { addTaskAction, receiveTasksAction, editTasksPositionAction } from '../Store/actions/taskAction';
import moment from 'moment';

import TodayView from './TodayView';
import FlatListCalendar from './FlatListCalendar';
import AgendaView from './AgendaView';
import ItemMenu from './Elements/ItemMenu';
import TaskAdder from './Elements/TaskAdder';
import NavigationView from './NavigationView';

import { TextInput } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

import { getToday } from '../Utils/helpers';

// toggleDateMover = () => {
//       if (this.state.isDateMoverOpen === false) {
//             if (this.state.isItemAdderOpen === false && this.state.isItemMenuOpen === false) {
//                   Animated.timing(this.state.yValueDateMover, {
//                         toValue: 0,
//                         duration: 100
//                   }).start();
//                   this.setState({
//                         isDateMoverOpen: true
//                   });
//             } else {
//                   Animated.sequence([
//                         Animated.timing(this.state.yValueItemAdder, {
//                               toValue: -calendarMenuHeight,
//                               duration: 100
//                         }),
//                         Animated.timing(this.state.yValueItemMenu, {
//                               toValue: -calendarMenuHeight,
//                               duration: 100
//                         }),
//                         Animated.timing(this.state.yValueDateMover, {
//                               toValue: 0,
//                               duration: 100
//                         })
//                   ]).start();

//                   this.setState({
//                         isItemAdderOpen: false,
//                         isItemMenuOpen: false,
//                         isDateMoverOpen: true
//                   });
//             }
//       } else {
//             Animated.timing(this.state.yValueDateMover, {
//                   toValue: -calendarMenuHeight,
//                   duration: 100
//             }).start();
//             this.setState({
//                   isDateMoverOpen: false
//             });
//       }
// };

// toggleItemAdder = () => {
//       if (this.state.isItemAdderOpen === false) {
//             if (this.state.isDateMoverOpen === false && this.state.isItemMenuOpen === false) {
//                   Animated.timing(this.state.yValueItemAdder, {
//                         toValue: 0,
//                         duration: 100
//                   }).start();
//                   this.setState({
//                         isItemAdderOpen: true
//                   });
//             } else {
//                   Animated.sequence([
//                         Animated.timing(this.state.yValueDateMover, {
//                               toValue: -calendarMenuHeight,
//                               duration: 100
//                         }),
//                         Animated.timing(this.state.yValueItemMenu, {
//                               toValue: -calendarMenuHeight,
//                               duration: 100
//                         }),
//                         Animated.timing(this.state.yValueItemAdder, {
//                               toValue: 0,
//                               duration: 100
//                         })
//                   ]).start();

//                   this.setState({
//                         isDateMoverOpen: false,
//                         isItemMenuOpen: false,
//                         isItemAdderOpen: true
//                   });
//             }
//       } else {
//             Animated.timing(this.state.yValueItemAdder, {
//                   toValue: -calendarMenuHeight,
//                   duration: 100
//             }).start();
//             this.setState({
//                   isItemAdderOpen: false
//             });
//       }
// };

// toggleItemMenu = async props => {
//       if (this.state.isItemMenuOpen === false) {
//             await this.setState({
//                   itemMenuProps: props
//             });
//             if (this.state.isDateMoverOpen === false && this.state.isItemAdderOpen === false) {
//                   Animated.timing(this.state.yValueItemMenu, {
//                         toValue: 0,
//                         duration: 100
//                   }).start();
//                   this.setState({
//                         isItemMenuOpen: true
//                   });
//             } else {
//                   Animated.sequence([
//                         Animated.timing(this.state.yValueDateMover, {
//                               toValue: -calendarMenuHeight,
//                               duration: 100
//                         }),
//                         Animated.timing(this.state.yValueItemAdder, {
//                               toValue: -calendarMenuHeight,
//                               duration: 100
//                         }),
//                         Animated.timing(this.state.yValueItemMenu, {
//                               toValue: 0,
//                               duration: 100
//                         })
//                   ]).start();

//                   this.setState({
//                         isDateMoverOpen: false,
//                         isItemAdderOpen: false,
//                         isItemMenuOpen: true
//                   });
//             }
//       } else {
//             // If the ItemMenu was already open
//             // and if we reclick on that open item => close menu
//             // FIXME: If we simply change a prop of the the same item, the app think it's an other item
//             // So or you make the ItemMenu full screen or the only way to close it is to drag it down
//             if (props === this.state.itemMenuProps) {
//                   Animated.timing(this.state.yValueItemMenu, {
//                         toValue: -calendarMenuHeight,
//                         duration: 100
//                   }).start();
//                   this.setState({
//                         isItemMenuOpen: false
//                   });
//                   //If we click on an other item => close that one, reopen the other
//             } else {
//                   await this.setState({
//                         isItemMenuOpen: false,
//                         itemMenuProps: props
//                   });
//                   Animated.sequence([
//                         Animated.timing(this.state.yValueItemMenu, {
//                               toValue: -calendarMenuHeight,
//                               duration: 100
//                         }),
//                         Animated.timing(this.state.yValueItemMenu, {
//                               toValue: 0,
//                               duration: 100
//                         })
//                   ]).start();
//                   this.setState({
//                         isItemMenuOpen: true
//                   });
//             }
//       }
// };

import React, { Component } from 'react';

// STATIC UI
import {
      StyleSheet,
      Text,
      View,
      TouchableOpacity,
      Dimensions,
      ScrollView,
      Keyboard,
      BackHandler,
      Button
} from 'react-native';
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

// TODO: I can simply create 2 button and manage 2 different State
// OR this.transY = this.state.isDateMoverOpen ? set(this.transY, -400) : set(this.transY, 0)

class MainScreen extends Component {
      constructor(props) {
            super(props);

            //DateMover
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

            this.transY = new Value(0);
      }

      state = {
            title: '',
            isDateMoverOpen: false,
            isItemAdderOpen: false,
            isItemMenuOpen: false,

            // DateMover
            visibleMonth: 0,
            formattedDate: getToday
      };

      // DateMover

      scrollToIndex = () => {
            this.child.scrollToIndex(); // do stuff
      };

      render() {
            return (
                  <View style={styles.container}>
                        <Animated.Code>
                              {() =>
                                    block([
                                          cond(eq(this.onGestureState, State.BEGAN), [set(this.transY, 400)]),
                                          cond(eq(this.onGestureState2, State.BEGAN), [set(this.transY, 0)])
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
                                          backgroundColor: 'blue'
                                    }}
                              ></Animated.View>
                        </TapGestureHandler>
                  </View>
            );
      }
}

export default connect(
      null,
      null
)(MainScreen);

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: 'white'
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

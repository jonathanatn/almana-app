// STATIC UI
import React, { Component } from 'react';
import {
      Text,
      TextInput,
      View,
      StyleSheet,
      TouchableOpacity,
      Alert,
      AsyncStorage,
      Dimensions,
      StatusBar,
      NativeModules,
      Platform
} from 'react-native';
import { Notifications } from 'expo';
import { connect } from 'react-redux';
import * as Permissions from 'expo-permissions';
// ANIMATED UI
import Animated, { Easing } from 'react-native-reanimated';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
const { cond, eq, add, call, set, Value, event, block, and, greaterThan, lessThan, stopClock, defined } = Animated;
const {
      diff,
      or,
      debug,
      startClock,
      lessOrEq,
      greaterOrEq,
      Clock,
      clockRunning,
      timing,
      spring,
      interpolate,
      Extrapolate
} = Animated;

// DATA
function mapDispatchToProps(dispatch) {
      return {};
}

// HELPERS
const { width, height } = Dimensions.get('window');
const { StatusBarManager } = NativeModules;

class Playground extends Component {
      constructor(props) {
            super(props);

            this.dragY = new Value(0);
            this.absoluteY = new Value(0);
            this.offsetY = new Value(0);
            this.gestureState = new Value(-1);

            this.onGestureEvent = event([
                  {
                        nativeEvent: {
                              translationY: this.dragY,
                              absoluteY: this.absoluteY,
                              state: this.gestureState
                        }
                  }
            ]);

            this.addY = add(this.dragY, this.offsetY);

            this.transY = new Value(0);

            this.clock = new Clock();
            this.clock2 = new Clock();
            this.clock3 = new Clock();
            this.clock4 = new Clock();

            this.menuStarted = new Value(0);
            this.menuReduced = new Value(1);
            this.menuExpanded = new Value(0);

            this.reduceExpandedMenu = new Value(0);

            this.dragging = new Value(0);

            this.state = {
                  iosStatusBarHeight: 0
            };
      }

      componentDidMount() {
            if (Platform.OS === 'ios') {
                  StatusBarManager.getHeight(statusBarHeight => {
                        this.setState({
                              iosStatusBarHeight: statusBarHeight.height
                        });
                  });
            }
      }

      closeMenu = () => {
            console.log('close');
      };

      render() {
            return (
                  <View style={styles.container}>
                        {/* {animation(this)} */}
                        <Animated.Code>
                              {() =>
                                    block([
                                          cond(eq(this.menuStarted, 0), [
                                                set(
                                                      this.transY,
                                                      cond(
                                                            defined(this.transY),
                                                            runSpring(this.clock, this.transY, 50, -420, 20)
                                                      )
                                                ),
                                                cond(lessThan(this.transY, -419), [
                                                      set(this.offsetY, -420),
                                                      stopClock(this.clock),
                                                      set(this.menuStarted, 1)
                                                ])
                                          ]),

                                          cond(
                                                and(
                                                      eq(this.gestureState, State.ACTIVE),
                                                      greaterOrEq(this.transY, -height),
                                                      eq(this.dragging, 0)
                                                ),
                                                [stopClock(this.clock), set(this.transY, this.addY)]
                                          ),
                                          cond(
                                                and(
                                                      eq(this.gestureState, State.ACTIVE),
                                                      lessOrEq(this.transY, -height),
                                                      eq(this.dragging, 0)
                                                ),
                                                [set(this.transY, -height), set(this.offsetY, -height)]
                                          ),
                                          //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                          ////////////////////////////////////////////////////////// Move Menu ///////////////////////////////////////////////////////////
                                          cond(
                                                and(
                                                      eq(this.gestureState, State.END),
                                                      and(lessThan(this.transY, -370), greaterThan(this.transY, -470)),
                                                      eq(this.menuReduced, 1)
                                                ),
                                                [
                                                      set(
                                                            this.transY,
                                                            cond(
                                                                  defined(this.transY),
                                                                  runSpring(this.clock, this.transY, 50, -420, 7)
                                                            )
                                                      )
                                                ]
                                          ),

                                          //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                          //////////////////////////////////////////////////////// Close Menu /////////////////////////////////////////////////////////
                                          cond(
                                                and(
                                                      eq(this.gestureState, State.END),
                                                      greaterOrEq(this.transY, -370),
                                                      eq(this.menuReduced, 1)
                                                ),
                                                [
                                                      set(
                                                            this.transY,
                                                            cond(
                                                                  defined(this.transY),
                                                                  runSpring(this.clock, this.transY, 50, 0, 20)
                                                            )
                                                      ),
                                                      set(this.dragging, 1),
                                                      cond(greaterThan(this.transY, -1), [
                                                            set(this.offsetY, 0),
                                                            stopClock(this.clock),
                                                            set(this.menuReduced, 0),
                                                            set(this.menuStarted, 0),
                                                            set(this.dragging, 0),
                                                            call([], this.closeMenu)
                                                      ])
                                                ]
                                          ),

                                          //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                          //////////////////////////////////////////////////////// Expand Menu /////////////////////////////////////////////////////////
                                          cond(
                                                and(
                                                      eq(this.gestureState, State.END),
                                                      lessOrEq(this.transY, -470),
                                                      eq(this.menuReduced, 1)
                                                ),
                                                [
                                                      set(
                                                            this.transY,
                                                            cond(
                                                                  defined(this.transY),
                                                                  runSpring(this.clock, this.transY, 50, -height, 20)
                                                            )
                                                      ),
                                                      set(this.dragging, 1),
                                                      cond(lessThan(this.transY, -height + 1), [
                                                            set(this.offsetY, -height),
                                                            stopClock(this.clock),
                                                            set(this.menuReduced, 0),
                                                            set(this.menuExpanded, 1),
                                                            set(this.dragging, 0)
                                                      ])
                                                ]
                                          ),
                                          //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                          //////////////////////////////////////////////////////// Reduce Menu /////////////////////////////////////////////////////////
                                          cond(
                                                and(
                                                      eq(this.gestureState, State.END),
                                                      greaterOrEq(this.transY, -height + 20),
                                                      eq(this.menuExpanded, 1)
                                                ),
                                                [
                                                      set(
                                                            this.transY,
                                                            cond(
                                                                  defined(this.transY),
                                                                  runSpring(this.clock, this.transY, 50, -420, 20)
                                                            )
                                                      ),
                                                      set(this.dragging, 1),
                                                      cond(greaterThan(this.transY, -421), [
                                                            set(this.offsetY, -420),
                                                            stopClock(this.clock),
                                                            set(this.menuExpanded, 0),
                                                            set(this.menuReduced, 1),
                                                            set(this.dragging, 0)
                                                      ])
                                                ]
                                          ),

                                          //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                          //////////////////////////////////////////////////////// Move Expanded Menu /////////////////////////////////////////////////////////
                                          cond(
                                                and(
                                                      eq(this.gestureState, State.END),
                                                      lessThan(this.transY, -height + 20),
                                                      eq(this.menuExpanded, 1)
                                                ),
                                                [
                                                      set(
                                                            this.transY,
                                                            cond(
                                                                  defined(this.transY),
                                                                  runSpring(this.clock, this.transY, 50, -height, 7)
                                                            )
                                                      ),
                                                      set(this.dragging, 1),
                                                      cond(lessOrEq(this.transY, -height + 1), [
                                                            set(this.offsetY, -height),
                                                            stopClock(this.clock),
                                                            set(this.dragging, 0)
                                                      ])
                                                ]
                                          )
                                    ])
                              }
                        </Animated.Code>

                        <TouchableOpacity onPress={this.openMenu} style={{ marginTop: 50 }}>
                              <Text>Open Menu</Text>
                        </TouchableOpacity>

                        <PanGestureHandler
                              maxPointers={1}
                              onGestureEvent={this.onGestureEvent}
                              onHandlerStateChange={this.onGestureEvent}
                              minDist={10}
                        >
                              <Animated.View
                                    style={[
                                          styles.bottomMenu,
                                          {
                                                ...Platform.select({
                                                      ios: {
                                                            bottom: -height - 10 - this.state.iosStatusBarHeight
                                                      },
                                                      android: {
                                                            bottom: -height - 10
                                                      }
                                                }),
                                                transform: [{ translateY: this.transY }]
                                          }
                                    ]}
                              >
                                    <View
                                          style={{
                                                backgroundColor: 'gainsboro',
                                                width: 48,
                                                height: 10,
                                                borderRadius: 200,
                                                alignSelf: 'center',
                                                top: -8
                                          }}
                                    ></View>
                                    <TouchableOpacity>
                                          <Text>Add notification</Text>
                                    </TouchableOpacity>
                              </Animated.View>
                        </PanGestureHandler>
                  </View>
            );
      }
}

function mapStateToProp(state, ownProps) {
      return {};
}

export default connect(
      mapStateToProp,
      mapDispatchToProps
)(Playground);

const styles = StyleSheet.create({
      container: {
            flex: 1
      },
      bottomMenu: {
            padding: 16,
            backgroundColor: 'white',
            width: width,
            height: height + 10,
            position: 'absolute',
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

function runSpring(clock, value, velocity, dest, damping) {
      const state = {
            finished: new Value(0),
            velocity: new Value(0),
            position: new Value(0),
            time: new Value(0)
      };

      const config = {
            damping: damping,
            mass: 1,
            stiffness: 221.6,
            overshootClamping: false,
            restSpeedThreshold: 0.501,
            restDisplacementThreshold: 0.501,
            toValue: new Value(0)
      };

      return [
            cond(clockRunning(clock), 0, [
                  set(state.finished, 0),
                  set(state.velocity, velocity),
                  set(state.position, value),
                  set(config.toValue, dest),
                  startClock(clock)
            ]),
            spring(clock, state, config),
            cond(state.finished, stopClock(clock)),
            state.position
      ];
}

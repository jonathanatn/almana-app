// In this code I can select my selectable item and move forward through an infinite list (limited by screen size, no auto scroll)

import React from 'react';
import { StyleSheet, View, Dimensions, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { PanGestureHandler, State, LongPressGestureHandler, TapGestureHandler } from 'react-native-gesture-handler';
import { database } from 'firebase';
const { width } = Dimensions.get('window');

const { cond, eq, add, call, set, Value, event, block, greaterThan, and, or, lessThan } = Animated;

export default class Example extends React.Component {
      constructor(props) {
            super(props);
            this.dragY = new Value(0);
            this.offsetY = new Value(0);
            this.gestureState = new Value(0);
            this.longPressState = new Value(0);

            this.onLongPressEvent = event([
                  {
                        nativeEvent: {
                              state: this.longPressState
                        }
                  }
            ]);

            this.onGestureEvent = event([
                  {
                        nativeEvent: {
                              translationY: this.dragY,
                              state: this.gestureState
                        }
                  }
            ]);

            this.addY = add(this.dragY, this.offsetY);

            this.transY = new Value(0);
            this.transYB = new Value(0);
            this.transYC = new Value(0);
      }

      state = {
            dragging: false,
            index: 0
      };

      start = () => {
            if (this.state.dragging === false) {
                  console.log('active');
                  this.transY = cond(eq(this.gestureState, State.ACTIVE), this.addY, set(this.offsetY, this.addY));
                  // Cause a re-render and set this.transY I guess
                  this.setState({
                        dragging: true
                  });
            }
      };

      done = () => {
            if (this.state.dragging === true) {
                  console.log('DONE');
                  this.transY = new Value(0);
                  this.setState({
                        dragging: false,
                        index: 0
                  });
            }
      };

      valueDebug = ([y]) => {
            // alert(`You dropped at y: ${y}!`);
            if (this.state.dragging === true) {
                  // Math.trunc((y+20)/70) => index
                  //////////////////////////////////////////////////////////////////////
                  //////////////////////////////////////////////////////////////////////
                  //////////////////////////////////////////////////////////////////////
                  // console.log(y);
                  // if (y > 50 && this.state.index === 0 && this.state !== 1) {
                  if (y > 50) {
                        console.log('STATE = 1');
                        this.setState({
                              index: Math.trunc((y + 20) / 70)
                        });
                  }
                  // if (y > 120 && this.state.index === 1 && this.state !== 2) {
                  // if (y > 120) {
                  //       console.log('STATE = 2');
                  //       this.setState({
                  //             index: 2
                  //       });
                  // }
            }
      };

      // 50 (=0) = 1
      // 60 (=10) = 1

      render() {
            const longPress = React.createRef();
            const panGesture = React.createRef();
            const data = [1, 2, 3, 5, 6, 7];
            return (
                  <View style={styles.container}>
                        {this.state.dragging ? (
                              <Animated.Code>
                                    {() =>
                                          block([
                                                cond(
                                                      and(greaterThan(this.dragY, 50)),
                                                      call([this.dragY], this.valueDebug)
                                                ),
                                                cond(
                                                      and(greaterThan(this.dragY, 50)),
                                                      set(this.transYB, -70),
                                                      set(this.transYB, 0)
                                                )
                                                // cond(
                                                //       and(lessThan(this.dragY, -50)),
                                                //       set(this.transYC, 70),
                                                //       set(this.transYC, 0)
                                                // ),
                                                // Try move with index
                                          ])
                                    }
                              </Animated.Code>
                        ) : null}
                        <Animated.Code>
                              {() =>
                                    block([
                                          cond(eq(this.longPressState, State.ACTIVE), call([], this.start)),
                                          cond(eq(this.gestureState, State.END), [
                                                set(this.transY, 0),
                                                set(this.dragY, 0),
                                                set(this.offsetY, 0),
                                                call([], this.done)
                                          ])
                                          // cond(eq(this.gestureState, State.ACTIVE), call([this.dragY], this.valueDebug))
                                    ])
                              }
                        </Animated.Code>

                        {/* <Animated.View
                              style={[
                                    styles.box,
                                    {
                                          transform: [
                                                {
                                                      translateY: this.transYC
                                                }
                                          ]
                                    }
                              ]}
                        /> */}

                        <LongPressGestureHandler
                              ref={longPress}
                              simultaneousHandlers={panGesture}
                              onHandlerStateChange={this.onLongPressEvent}
                              minDurationMs={400}
                        >
                              <Animated.View
                                    style={[
                                          styles.box,
                                          {
                                                transform: [
                                                      {
                                                            translateY: this.transY
                                                      }
                                                ],
                                                zIndex: 99
                                          }
                                    ]}
                              >
                                    <PanGestureHandler
                                          ref={panGesture}
                                          simultaneousHandlers={longPress}
                                          maxPointers={1}
                                          onGestureEvent={this.onGestureEvent}
                                          onHandlerStateChange={this.onGestureEvent}
                                    >
                                          <Animated.View style={{ backgroundColor: 'blue', flex: 1 }} />
                                    </PanGestureHandler>
                              </Animated.View>
                        </LongPressGestureHandler>
                        {data.map((item, index) => {
                              return (
                                    <Animated.View
                                          key={index}
                                          style={[
                                                styles.box,
                                                this.state.index >= index + 1
                                                      ? {
                                                              transform: [
                                                                    {
                                                                          translateY: this.transYB
                                                                    }
                                                              ]
                                                        }
                                                      : {
                                                              transform: [
                                                                    {
                                                                          translateY: 0
                                                                    }
                                                              ]
                                                        }
                                          ]}
                                    />
                              );
                        })}
                  </View>
            );
      }
}

const CIRCLE_SIZE = 70;

const styles = StyleSheet.create({
      container: {
            paddingTop: 100,
            flex: 1
      },
      box: {
            backgroundColor: 'tomato',
            // position: 'absolute',
            // marginLeft: -(CIRCLE_SIZE / 2),
            // marginTop: -(CIRCLE_SIZE / 2),
            width: width,
            height: 70,
            // marginTop: 100,
            // borderRadius: CIRCLE_SIZE / 2,
            borderColor: 'tomato'
      }
});

{
      /* <Animated.Code>
                              {() =>
                                    cond(
                                          greaterThan(this.transY, 200),
                                          block([set(this.transYB, 130), call([this.transY], this.onDrop)]),
                                          set(this.transYB, 200)
                                    )
                              }
                        </Animated.Code> */
}

{
      /* <Animated.View
                              style={[
                                    styles.box,
                                    {
                                          transform: [
                                                {
                                                      translateY: this.transYB
                                                }
                                          ]
                                    }
                              ]}
                        /> */
}

{
      /* <LongPressGestureHandler
                              // onHandlerStateChange={this.onLongPressEvent}
                              onHandlerStateChange={({ nativeEvent }) => {
                                    nativeEvent.state && console.log(nativeEvent.state);
                              }}
                              minDurationMs={400}
                        >
                              <Animated.View
                                    style={[
                                          styles.box,
                                          {
                                                transform: [
                                                      {
                                                            translateY: this.transY
                                                      }
                                                ]
                                          }
                                    ]}
                              />
                        </LongPressGestureHandler> */
}

// onDrop = ([y]) => {
//       // alert(`You dropped at y: ${y}!`);
//       console.log(y);
// };

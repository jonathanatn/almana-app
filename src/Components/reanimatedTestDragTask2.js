import React from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity, Alert } from 'react-native';
import Animated from 'react-native-reanimated';
import { PanGestureHandler, State, LongPressGestureHandler } from 'react-native-gesture-handler';
const { width } = Dimensions.get('window');

const {
      cond,
      eq,
      add,
      call,
      set,
      Value,
      event,
      block,
      and,
      greaterThan,
      lessThan,
      diff,
      or,
      debug,
      startClock,
      lessOrEq,
      greaterOrEq
} = Animated;

// FIXME: I don't think I need an offsetY variable, It's legacy code (to check)
// FIXME: I a use a second finger I can make the drag and drop bug (maybe use a second variable for the gestureststate, if it's the first time variable isFirstTime = 1 after isFirstTime = 0 // isFirstTime 1 this.onGestureEvent)

export default class Example extends React.Component {
      constructor(props) {
            super(props);
            this.dragY = new Value(0);
            this.offsetY = new Value(0);
            this.gestureState = new Value(-1);
            this.longPressState = new Value(-1);
            //When we movre our object
            this.onGestureEvent = event([
                  {
                        nativeEvent: {
                              translationY: this.dragY,
                              state: this.gestureState
                        }
                  }
            ]);

            //If the state is active we add the new translation to the offset
            this.addY = add(this.dragY, this.offsetY);

            // this.transY = cond(eq(this.gestureState, State.ACTIVE), this.addY, set(this.offsetY, this.addY));
            this.transY = new Value(0);
            this.transYB = new Value(0);
            this.transYC = new Value(0);
      }

      state = {
            dragging: false,
            indexDragged: '',
            indexToSwap: '',
            data: ['keep an eye', 'buy bread', 'meeting with partner', 'birthday', 'clean room']
      };

      handlerLongClick = index => {
            this.setState({
                  dragging: true,
                  indexDragged: index
            });
      };

      reset = () => {
            this.setState({
                  dragging: false,
                  indexDragged: '',
                  indexToSwap: ''
            });
      };

      forwardDragging = ([y]) => {
            if (this.state.dragging === true) {
                  // Check the change in drag position && check if the state changed to avoid useless re-render
                  if (y > 50 && this.state.indexDragged + Math.trunc((y + 20) / 70) !== this.state.indexToSwap) {
                        this.setState({
                              indexToSwap: this.state.indexDragged + Math.trunc((y + 20) / 70)
                        });
                  }
            }
      };

      backwardDragging = ([y]) => {
            if (this.state.dragging === true) {
                  // Check the change in drag position && check if the state changed to avoid useless re-render
                  if (y < -50 && this.state.indexDragged + Math.trunc((y - 20) / 70) !== this.state.indexToSwap) {
                        this.setState({
                              indexToSwap: this.state.indexDragged + Math.trunc((y - 20) / 70)
                        });
                  }
            }
      };

      sort = () => {
            if (this.state.dragging === true) {
                  let sortedData = [...this.state.data];
                  let dataDragged = sortedData[this.state.indexDragged];

                  sortedData.splice(this.state.indexDragged, 1);
                  sortedData.splice(this.state.indexToSwap, 0, dataDragged);

                  this.setState({
                        data: sortedData,
                        dragging: false,
                        indexDragged: '',
                        indexToSwap: ''
                  });
            }
      };

      render() {
            const longPress = React.createRef();
            const panGesture = React.createRef();
            const data = ['keep an eye', 'buy bread', 'meeting with partner', 'birthday', 'clean room'];
            // console.log(this.dragY);
            return (
                  <View style={styles.container}>
                        <Animated.Code>
                              {() =>
                                    block([
                                          cond(eq(this.gestureState, State.BEGAN), [
                                                set(this.transY, 0),
                                                set(this.dragY, 0),
                                                //FIXME: Without that line a weird behaviour happen
                                                // debug('transy', this.transY),
                                                add(this.transY, 0)
                                          ]),
                                          cond(eq(this.gestureState, State.ACTIVE), set(this.transY, this.addY)),
                                          cond(
                                                or(
                                                      // eq(this.gestureState, State.END),
                                                      eq(this.gestureState, State.FAILED),
                                                      eq(this.gestureState, State.CANCELLED)
                                                ),
                                                [
                                                      set(this.transY, 0),
                                                      set(this.transYB, 0),
                                                      set(this.transYC, 0),
                                                      set(this.dragY, 0),
                                                      call([], this.reset)
                                                ]
                                          ),
                                          cond(greaterThan(this.dragY, 50), call([this.dragY], this.forwardDragging)),
                                          cond(
                                                greaterThan(this.dragY, 50),
                                                set(this.transYB, -70),
                                                set(this.transYB, 0)
                                          ),
                                          cond(lessThan(this.dragY, -50), call([this.dragY], this.backwardDragging)),
                                          cond(lessThan(this.dragY, -50), set(this.transYC, 70), set(this.transYC, 0))
                                    ])
                              }
                        </Animated.Code>

                        <Animated.Code>
                              {() =>
                                    block([
                                          cond(
                                                and(
                                                      eq(this.gestureState, State.END),
                                                      or(lessThan(this.dragY, -50), greaterThan(this.dragY, 50))
                                                ),
                                                [call([this.dragY], this.sort)]
                                          ),
                                          // If the drag is to short
                                          cond(
                                                and(
                                                      eq(this.gestureState, State.END),
                                                      and(greaterOrEq(this.dragY, -50), lessOrEq(this.dragY, 50))
                                                ),
                                                [set(this.transY, 0), set(this.dragY, 0), call([], this.reset)]
                                          )
                                    ])
                              }
                        </Animated.Code>

                        {this.state.data.map((item, index) => {
                              return (
                                    <PanGestureHandler
                                          key={index}
                                          maxPointers={1}
                                          onGestureEvent={this.onGestureEvent}
                                          onHandlerStateChange={this.onGestureEvent}
                                    >
                                          <Animated.View
                                                // ref={thisItem => (this[`itemText-${index}`] = thisItem)}
                                                style={[
                                                      styles.box,
                                                      this.state.indexDragged === index
                                                            ? {
                                                                    backgroundColor: 'blue',
                                                                    transform: [
                                                                          {
                                                                                translateY: this.transY
                                                                          }
                                                                    ],
                                                                    //   backgroundColor: 'blue',
                                                                    zIndex: 99
                                                              }
                                                            : this.state.indexToSwap >= index &&
                                                              this.state.indexDragged < index &&
                                                              // This condition is added because (Js 1 > '' = true), so I added it to be sure of not having weird behavior by making the condition true
                                                              this.state.indexToSwap !== ''
                                                            ? {
                                                                    transform: [
                                                                          {
                                                                                translateY: this.transYB
                                                                          }
                                                                    ]
                                                              }
                                                            : index >= this.state.indexToSwap &&
                                                              index < this.state.indexDragged &&
                                                              // This condition is added because (Js 1 > '' = true), so I added it to be sure of not having weird behavior by making the condition true
                                                              this.state.indexToSwap !== ''
                                                            ? {
                                                                    transform: [
                                                                          {
                                                                                translateY: this.transYC
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
                                          >
                                                <TouchableOpacity
                                                      onLongPress={() => this.handlerLongClick(index)}
                                                      onPress={this.handlerClick}
                                                      style={{ flex: 1 }}
                                                >
                                                      <Text>{item}</Text>
                                                </TouchableOpacity>
                                          </Animated.View>
                                    </PanGestureHandler>
                              );
                        })}
                  </View>
            );
      }
}

const CIRCLE_SIZE = 70;

const styles = StyleSheet.create({
      container: {
            flex: 1,
            paddingTop: 100
      },
      box: {
            backgroundColor: 'tomato',
            // marginLeft: -(CIRCLE_SIZE / 2),
            // marginTop: -(CIRCLE_SIZE / 2),
            width: width,
            height: 70,
            // borderRadius: CIRCLE_SIZE / 2,
            borderColor: '#000'
      }
});

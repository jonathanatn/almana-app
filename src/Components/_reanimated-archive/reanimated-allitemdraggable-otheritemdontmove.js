import React from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity, Alert } from 'react-native';
import Animated from 'react-native-reanimated';
import { PanGestureHandler, State, LongPressGestureHandler } from 'react-native-gesture-handler';
const { width } = Dimensions.get('window');

const { cond, eq, add, call, set, Value, event, block } = Animated;

// FIXME: There is a problem with my logic with the drag and drop I don't think I need an offset
// FIXME: I a use a second finger I can make the drag and drop bug (maybe use a second variable for the gestureststate, if it's the first time variable isFirstTime = 1 after isFirstTime = 0 // isFirstTime 1 this.onGestureEvent)

export default class Example extends React.Component {
      constructor(props) {
            super(props);
            this.dragY = new Value(0);
            this.offsetY = new Value(0);
            this.gestureState = new Value(-1);
            this.longPressState = new Value(-1);
            this.dragYY = new Value(0);
            //When we movre our object
            this.onGestureEvent = event([
                  {
                        nativeEvent: {
                              translationY: this.dragY,
                              state: this.gestureState
                        }
                  }
            ]);

            this.onGestureEventEvent = event([
                  {
                        nativeEvent: {
                              translationY: this.dragYY,
                              state: this.longPressState
                        }
                  }
            ]);

            //If the state is active we add the new translation to the offset
            this.addY = add(this.dragY, this.offsetY);

            // this.transY = cond(eq(this.gestureState, State.ACTIVE), this.addY, set(this.offsetY, this.addY));
            this.transY = new Value(0);
      }

      state = {
            dragging: false,
            index: -1
      };

      handlerLongClick = index => {
            console.log('longpress ', index);
            this.setState({
                  dragging: true,
                  index: index
            });
      };

      reset = () => {
            this.setState({
                  index: -1
            });
      };

      // onDrop = ([y]) => {
      //       console.log('longpress');
      //       this.setState({
      //             dragging: true
      //       });
      // };

      render() {
            const longPress = React.createRef();
            const panGesture = React.createRef();
            const data = [1, 2, 3];
            return (
                  <View style={styles.container}>
                        <Animated.Code>
                              {() =>
                                    block([
                                          cond(eq(this.gestureState, State.ACTIVE), set(this.transY, this.addY)),
                                          cond(eq(this.gestureState, State.END), [
                                                set(this.transY, 0),
                                                call([], this.reset)
                                          ])
                                    ])
                              }
                        </Animated.Code>

                        {data.map((item, index) => {
                              return (
                                    <PanGestureHandler
                                          key={index}
                                          maxPointers={1}
                                          onGestureEvent={this.onGestureEvent}
                                          onHandlerStateChange={this.onGestureEvent}
                                    >
                                          <Animated.View
                                                style={[
                                                      styles.box,
                                                      this.state.index === index
                                                            ? {
                                                                    transform: [
                                                                          {
                                                                                translateY: this.transY
                                                                          }
                                                                    ]
                                                              }
                                                            : null
                                                ]}
                                          >
                                                <TouchableOpacity
                                                      onLongPress={() => this.handlerLongClick(index)}
                                                      onPress={this.handlerClick}
                                                      style={{ flex: 1, backgroundColor: 'red' }}
                                                />
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

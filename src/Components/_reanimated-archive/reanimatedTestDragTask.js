import React from 'react';
import {
      StyleSheet,
      View,
      Dimensions,
      Text,
      TouchableOpacity,
      Alert,
      TouchableWithoutFeedback,
      TouchableHighlight
} from 'react-native';
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
      startClock
} = Animated;

// FIXME: I don't think I need an offsetY variable, It's legacy code (to check)
// FIXME: I a use a second finger I can make the drag and drop bug (maybe use a second variable for the gestureststate, if it's the first time variable isFirstTime = 1 after isFirstTime = 0 // isFirstTime 1 this.onGestureEvent)

export default class Example extends React.Component {
      constructor(props) {
            super(props);
            this.gestureState = new Value(0);
            this.offsetY = new Value(0);
            this.transY = new Value(0);
            this.dragY = new Value(0);

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

            // this.transY = cond(eq(this.gestureState, State.ACTIVE), this.addY, set(this.offsetY, this.addY));
      }

      state = {
            data: ['keep an eye', 'buy bread', 'meeting with partner', 'birthday', 'clean room'],
            dragging: false,
            indexItemDragged: '',
            itemToHide: ''
      };

      endDragging = () => {
            if (this.state.indexItemDragged !== '') {
                  this[`item-${this.state.indexItemDragged}`].setNativeProps({
                        opacity: 0
                  });
                  this.setState({
                        dragging: false,
                        indexItemDragged: '',
                        itemToHide: ''
                  });
            }
      };

      startDragging = index => {
            this.setState({
                  dragging: true,
                  indexItemDragged: index
            });
      };

      displayDraggedItem = () => {
            if (this.state.indexItemDragged !== '') {
                  this[`item-${this.state.indexItemDragged}`].setNativeProps({
                        opacity: 1
                  });
                  this.setState({
                        itemToHide: this.state.indexItemDragged
                  });
            }
      };

      sort = () => {
            if (this.state.dragging === true) {
                  let newArray = [...this.state.data];

                  let dataDragged = newArray[3];
                  let dataMoved = newArray[4];

                  newArray.splice(3, 1);

                  newArray.push(dataDragged);

                  this.setState({
                        data: newArray
                  });
            }
      };

      render() {
            return (
                  <View style={styles.container}>
                        <Animated.Code>
                              {() =>
                                    block([
                                          // Reset parameters every time a drag began
                                          cond(eq(this.gestureState, State.BEGAN), [
                                                set(this.transY, 0),
                                                set(this.dragY, 0),
                                                debug('transy', this.transY)
                                          ]),
                                          cond(eq(this.gestureState, State.ACTIVE), [
                                                set(this.transY, this.addY),
                                                // Display the item dragged after it was reseted with State.BEGAN to avoid weird behavior
                                                call([], this.displayDraggedItem)
                                          ]),
                                          cond(
                                                and(eq(this.gestureState, State.ACTIVE), greaterThan(this.dragY, 50)),
                                                set(this.transYB, -70),
                                                set(this.transYB, 0)
                                          ),
                                          cond(and(eq(this.gestureState, State.END), greaterThan(this.dragY, 50)), [
                                                set(this.transY, 70),
                                                call([], this.sort),
                                                call([], this.endDragging)
                                                // set(this.transB, -70),
                                          ])
                                    ])
                              }
                        </Animated.Code>

                        <PanGestureHandler
                              maxPointers={1}
                              onGestureEvent={this.onGestureEvent}
                              onHandlerStateChange={this.onGestureEvent}
                        >
                              <Animated.View>
                                    {this.state.data.map((item, index) => {
                                          return (
                                                <Animated.View key={index}>
                                                      <Animated.View
                                                            style={{
                                                                  zIndex: this.state.dragging ? 2 : 10,
                                                                  opacity:
                                                                        this.state.dragging &&
                                                                        this.state.itemToHide === index
                                                                              ? 0
                                                                              : 1,
                                                                  transform: [
                                                                        {
                                                                              translateY:
                                                                                    this.state.indexItemDragged ===
                                                                                    index - 1
                                                                                          ? this.transYB
                                                                                          : 0
                                                                        }
                                                                  ]
                                                            }}
                                                      >
                                                            <TouchableHighlight
                                                                  onLongPress={() => this.startDragging(index)}
                                                                  onPress={this.handlerClick}
                                                                  style={[
                                                                        styles.box
                                                                        // {
                                                                        //       zIndex: this.state.dragging ? 2 : 10,
                                                                        //       opacity:
                                                                        //             this.state.dragging &&
                                                                        //             this.state.itemToHide === index
                                                                        //                   ? 0
                                                                        //                   : 1
                                                                        // }
                                                                  ]}
                                                            >
                                                                  <Text>{item}</Text>
                                                            </TouchableHighlight>
                                                      </Animated.View>

                                                      <Animated.View
                                                            ref={thisItem => (this[`item-${index}`] = thisItem)}
                                                            style={[
                                                                  styles.box,
                                                                  {
                                                                        // backgroundColor: 'blue',
                                                                        position: 'absolute',
                                                                        opacity:
                                                                              this.state.indexItemDragged === index - 1
                                                                                    ? 0
                                                                                    : 1,
                                                                        zIndex:
                                                                              this.state.dragging &&
                                                                              this.state.indexItemDragged === index
                                                                                    ? 10
                                                                                    : 1,
                                                                        transform: [
                                                                              {
                                                                                    translateY:
                                                                                          this.state
                                                                                                .indexItemDragged ===
                                                                                          index
                                                                                                ? this.transY
                                                                                                : 0
                                                                              }
                                                                        ]
                                                                  }
                                                            ]}
                                                      >
                                                            <Text>{item}</Text>
                                                      </Animated.View>
                                                </Animated.View>
                                          );
                                    })}
                              </Animated.View>
                        </PanGestureHandler>

                        {/* <PanGestureHandler
                              maxPointers={1}
                              onGestureEvent={this.onGestureEvent}
                              onHandlerStateChange={this.onGestureEvent}
                        >
                              <Animated.View>
                                    {this.state.data.map((item, index) => {
                                          return (
                                                <Animated.View key={index}>

                                                      <TouchableOpacity
                                                            onLongPress={() => this.startDragging(index)}
                                                            onPress={this.handlerClick}
                                                            style={[
                                                                  styles.box,
                                                                  {
                                                                        opacity:
                                                                              this.state.indexItemDragged === index
                                                                                    ? 0
                                                                                    : 1
                                                                  }
                                                            ]}
                                                      >
                                                            <Text>{item}</Text>
                                                      </TouchableOpacity>

                                                      {this.state.dragging === true &&
                                                      this.state.indexItemDragged === index ? (
                                                            <Animated.View
                                                                  ref={thisItem => (this[`item-${index}`] = thisItem)}
                                                                  style={[
                                                                        styles.box,
                                                                        {
                                                                              backgroundColor: 'blue',
                                                                              position: 'absolute',
                                                                              opacity: 1,
                                                                              transform: [
                                                                                    {
                                                                                          translateY:
                                                                                                this.state
                                                                                                      .indexItemDragged ===
                                                                                                index
                                                                                                      ? this.transY
                                                                                                      : 0
                                                                                    }
                                                                              ]
                                                                        }
                                                                  ]}
                                                            >
                                                                  <Text>{item}</Text>
                                                            </Animated.View>
                                                      ) : null}
                                                </Animated.View>
                                          );
                                    })}
                              </Animated.View>
                        </PanGestureHandler> */}
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
            backgroundColor: 'white',
            // marginLeft: -(CIRCLE_SIZE / 2),
            // marginTop: -(CIRCLE_SIZE / 2),
            width: width,
            height: 70,
            // borderRadius: CIRCLE_SIZE / 2,
            borderColor: '#000'
      }
});

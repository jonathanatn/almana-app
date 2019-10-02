// STATIC UI
import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, Alert, BackHandler } from 'react-native';
import { Platform, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ANIMATED UI
import Animated from 'react-native-reanimated';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
const { cond, eq, add, call, set, Value, event, block, and, greaterThan, lessThan, clockRunning } = Animated;
const { diff, or, debug, startClock, lessOrEq, greaterOrEq, defined, Clock, stopClock, spring } = Animated;

// DATA
import { connect } from 'react-redux';
function mapDispatchToProps(dispatch) {
      return {};
}

// HELPERS
import moment from 'moment';
import { getToday } from '../Utils/helpers';
const { width, height } = Dimensions.get('window');

const itemHeight = 70;

class MainScreen extends Component {
      constructor(props) {
            super(props);
            this.dragY = new Value(0);
            this.offsetY = new Value(0);
            this.gestureState = new Value(-1);

            this.velocityY = new Value(0);
            this.y = new Value(0);

            //When we movre our object
            this.onGestureEvent = event([
                  {
                        nativeEvent: {
                              translationY: this.dragY,
                              state: this.gestureState,
                              velocityY: this.velocityY,
                              y: this.y
                        }
                  }
            ]);

            this.addY = add(this.dragY, this.offsetY);
            this.transY = new Value(0);

            // this.transYB = new Value(0);
            // this.clock = new Clock();

            this.hideItem = new Value(0);

            this.scrollOffset = 0;
            // Dynamically get the height of the FlatList
            this.listHeight = 0;
            this.listOffset = 0;
            // To know if we reach the end of list while dragging
            this.endOfList = 0;

            // Keeps where we are in the scroll list
            this.scrollListOffset = 0;

            this.previousValueDragging = 0;

            this.state = {
                  data: [
                        { position: 0 },
                        { position: 1 },
                        { position: 2 },
                        { position: 3 },
                        { position: 4 },
                        { position: 5 },
                        { position: 6 },
                        { position: 7 },
                        { position: 8 },
                        { position: 9 }
                  ],
                  dragging: false,
                  indexItemDragged: -1,
                  indexItemToSwap: -1
            };
      }

      handleLongClick = index => {
            this.setState({
                  dragging: true,
                  indexItemDragged: index,
                  itemDragged: this.state.data[index],
                  // To make disappear the item dragged after the long click
                  indexItemToSwap: index
            });
      };

      // State.END doesn't fire normally on iOS if you don't move the PanGesture, this is a hack:
      handlePressOut = e => {
            if (
                  Platform.OS === 'ios' &&
                  e.touchHistory.touchBank[1].currentPageY > e.touchHistory.touchBank[1].startPageY - 10 &&
                  e.touchHistory.touchBank[1].currentPageY < e.touchHistory.touchBank[1].startPageY + 10
            ) {
                  this.gestureState.setValue(5);
            }
      };

      reset = () => {
            this.transY.setValue(0);
            this.setState({
                  dragging: false,
                  indexItemDragged: -1,
                  itemDragged: '',
                  indexItemToSwap: -1
            });
      };

      scrollOnDrag = ([dragY]) => {};

      scrollList = ([dragY, velocityY]) => {
            if (this.state.dragging === false && Platform.OS === 'android') {
                  if (dragY + this.scrollListOffset < 0) {
                        var transY = dragY + this.scrollListOffset;
                  } else {
                        var transY = dragY - dragY;
                  }

                  this.flatListRef.scrollToOffset({ offset: -transY });
            }
      };

      // TODO: Maybe catch the velocity in that function to continue the scroll
      // On Android, the scroll in the FlatList is managed manually because the GestureHandler make the FlatList scroll bug
      scrollListEnd = ([dragY, velocityY]) => {
            if (this.state.dragging === false && Platform.OS === 'android') {
                  // TODO: Use FlatList onScroll method to make these variable dynamic
                  let flatListHeight = 400;
                  let fullContentHeight = this.state.data.length * 70;
                  let offsetContent = fullContentHeight - flatListHeight;

                  if (dragY + this.scrollListOffset > 0) {
                        this.scrollListOffset = 0;
                  } else if (dragY + this.scrollListOffset < -offsetContent) {
                        this.scrollListOffset = -offsetContent;
                  } else {
                        this.scrollListOffset = this.scrollListOffset + dragY;
                  }
            }
      };

      sortItems = async ([transY]) => {
            let y = transY;

            if (
                  this.state.dragging &&
                  // CLAMPING
                  this.state.indexItemDragged + Math.trunc((y - 30) / 70) >= 0 &&
                  this.state.indexItemDragged + Math.trunc((y + 30) / 70) < this.state.data.length
            ) {
                  // FORWARD DRAGGING (= from top to bottom)
                  if (
                        y > 30 &&
                        this.state.indexItemDragged + Math.trunc((y + 30) / 70) !== this.state.indexItemToSwap
                  ) {
                        if (this.state.indexItemDragged + Math.trunc((y + 30) / 70) > this.state.indexItemToSwap) {
                              let data = [...this.state.data];

                              let item = data[this.state.indexItemDragged + Math.trunc((y + 30) / 70) - 1];
                              let itemToSwap = data[this.state.indexItemDragged + Math.trunc((y + 30) / 70)];

                              data.splice(this.state.indexItemDragged + Math.trunc((y + 30) / 70), 1, item);
                              data.splice(this.state.indexItemDragged + Math.trunc((y + 30) / 70) - 1, 1, itemToSwap);

                              await this.setState({
                                    indexItemToSwap: this.state.indexItemDragged + Math.trunc((y + 30) / 70),
                                    data: data
                              });
                        }
                        // Dragging backward from a drag that started forward
                        if (this.state.indexItemDragged + Math.trunc((y + 30) / 70) < this.state.indexItemToSwap) {
                              let data = [...this.state.data];

                              let item = data[this.state.indexItemDragged + Math.trunc((y + 30) / 70) + 1];
                              let itemToSwap = data[this.state.indexItemDragged + Math.trunc((y + 30) / 70)];

                              data.splice(this.state.indexItemDragged + Math.trunc((y + 30) / 70), 1, item);
                              data.splice(this.state.indexItemDragged + Math.trunc((y + 30) / 70) + 1, 1, itemToSwap);

                              await this.setState({
                                    indexItemToSwap: this.state.indexItemDragged + Math.trunc((y + 30) / 70),
                                    data: data
                              });
                        }
                  }

                  // BACKWARD DRAGGING (= from bottom to top)
                  if (
                        y < -30 &&
                        this.state.indexItemDragged + Math.trunc((y - 30) / 70) !== this.state.indexItemToSwap
                  ) {
                        if (this.state.indexItemDragged + Math.trunc((y - 30) / 70) < this.state.indexItemToSwap) {
                              let data = [...this.state.data];

                              let item = data[this.state.indexItemDragged + Math.trunc((y - 30) / 70) + 1];
                              let itemToSwap = data[this.state.indexItemDragged + Math.trunc((y - 30) / 70)];

                              data.splice(this.state.indexItemDragged + Math.trunc((y - 30) / 70), 1, item);
                              data.splice(this.state.indexItemDragged + Math.trunc((y - 30) / 70) + 1, 1, itemToSwap);

                              await this.setState({
                                    indexItemToSwap: this.state.indexItemDragged + Math.trunc((y - 30) / 70),
                                    data: data
                              });
                        }

                        // Dragging forward from a drag that started backward
                        if (this.state.indexItemDragged + Math.trunc((y - 30) / 70) > this.state.indexItemToSwap) {
                              let data = [...this.state.data];

                              let item = data[this.state.indexItemDragged + Math.trunc((y - 30) / 70) - 1];
                              let itemToSwap = data[this.state.indexItemDragged + Math.trunc((y - 30) / 70)];

                              data.splice(this.state.indexItemDragged + Math.trunc((y - 30) / 70), 1, item);
                              data.splice(this.state.indexItemDragged + Math.trunc((y - 30) / 70) - 1, 1, itemToSwap);

                              await this.setState({
                                    indexItemToSwap: this.state.indexItemDragged + Math.trunc((y - 30) / 70),
                                    data: data
                              });
                        }
                  }
            }
      };

      renderItem = ({ item, index }) => {
            return (
                  <View
                        key={index}
                        style={{
                              width: width,
                              height: 70,
                              backgroundColor: 'blue',
                              opacity: this.state.indexItemToSwap === index ? 0 : this.state.nextItem === index ? 0 : 1
                        }}
                  >
                        <TouchableOpacity
                              onLongPress={() => this.handleLongClick(index)}
                              onPressOut={e => this.handlePressOut(e)}
                        >
                              <Text> {item.position}</Text>
                        </TouchableOpacity>
                  </View>
            );
      };

      render() {
            return (
                  <View style={styles.container}>
                        <PanGestureHandler
                              maxPointers={1}
                              onGestureEvent={this.onGestureEvent}
                              onHandlerStateChange={this.onGestureEvent}
                              minDist={10}
                        >
                              <Animated.View style={{ marginTop: 200, zIndex: 1, height: 400 }}>
                                    <FlatList
                                          // keyboardShouldPersistTaps="always"
                                          ref={ref => (this.flatListRef = ref)}
                                          // contentContainerStyle={{ paddingBottom: 300 }}
                                          data={this.state.data}
                                          extraData={this.state.data}
                                          keyExtractor={(item, index) => index.toString()}
                                          renderItem={this.renderItem}
                                          scrollEnabled={
                                                Platform.OS === 'android'
                                                      ? false
                                                      : this.state.dragging === true
                                                      ? false
                                                      : true
                                          }
                                          showsVerticalScrollIndicator={false}
                                          onLayout={event => {
                                                let { y, height } = event.nativeEvent.layout;
                                                this.listHeight = height;
                                          }}
                                          onScroll={e => {
                                                let contentOffset = e.nativeEvent.contentOffset.y;
                                                let contentSize = e.nativeEvent.contentSize.height;
                                                let layoutMeasurement = e.nativeEvent.layoutMeasurement.height;

                                                this.scrollOffset = contentOffset;
                                          }}
                                    />
                              </Animated.View>
                        </PanGestureHandler>

                        <Animated.View
                              style={{
                                    width: width,
                                    height: itemHeight,
                                    backgroundColor: 'red',
                                    position: 'absolute',
                                    top: this.state.dragging
                                          ? this.state.indexItemDragged * 70 + 200 - this.scrollOffset
                                          : 0,
                                    opacity: this.state.dragging ? 1 : 0,
                                    zIndex: this.state.dragging ? 2 : 0,
                                    transform: [{ translateY: this.transY }]
                              }}
                        >
                              <Text>{this.state.dragging && this.state.itemDragged.position}</Text>
                        </Animated.View>

                        <Animated.Code>
                              {() =>
                                    block([
                                          cond(eq(this.gestureState, State.BEGAN), []),
                                          cond(and(eq(this.gestureState, State.ACTIVE)), [
                                                set(this.transY, this.dragY),
                                                call([this.dragY], this.sortItems),
                                                call([this.dragY, this.velocityY], this.scrollList),
                                                call([this.dragY], this.scrollOnDrag)
                                          ]),
                                          cond(
                                                and(
                                                      eq(this.gestureState, State.ACTIVE),
                                                      or(
                                                            greaterThan(this.velocityY, 2000),
                                                            lessThan(this.velocityY, -2000)
                                                      )
                                                ),
                                                [set(this.gestureState, 5)]
                                          ),
                                          cond(eq(this.gestureState, State.END), [
                                                call([this.dragY], this.scrollListEnd),
                                                call([], this.reset)
                                          ]),
                                          cond(eq(this.gestureState, State.FAILED), [call([], this.reset)]),
                                          cond(eq(this.gestureState, State.CANCELLED), [call([], this.reset)])
                                          // // Animate next component
                                          // cond(
                                          //       and(
                                          //             eq(this.gestureState, State.ACTIVE),
                                          //             greaterThan(this.dragY, 30),
                                          //             eq(this.hideItem, 0)
                                          //       ),
                                          //       [set(this.transYB, runSpring(this.clock, this.transYB, 0, -70, 150))],
                                          //       stopClock(this.clock)
                                          // )
                                    ])
                              }
                        </Animated.Code>
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

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: 'white'
      },
      header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            paddingHorizontal: 12,
            marginTop: 70
      },
      addButtonContainer: {
            width: 60,
            height: 60,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: height / 2 - 60,
            right: -20,
            zIndex: 9,
            elevation: 6
      },
      addButton: {
            width: 60,
            height: 60,
            ...Platform.select({
                  ios: {
                        paddingTop: 5
                  }
            }),
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'blue',
            borderRadius: 30,
            elevation: 5,
            shadowColor: 'black',
            shadowOffset: { width: 0, height: 0.5 * 5 },
            shadowOpacity: 0.3,
            shadowRadius: 0.8 * 5
      }
});

// function runSpring(clock, value, velocity, dest, damping) {
//       console.log('runspring');
//       const state = {
//             finished: new Value(0),
//             velocity: new Value(0),
//             position: new Value(0),
//             time: new Value(0)
//       };

//       const config = {
//             damping: damping,
//             mass: 1,
//             stiffness: 221.6,
//             overshootClamping: false,
//             restSpeedThreshold: 0.501,
//             restDisplacementThreshold: 0.501,
//             toValue: new Value(0)
//       };

//       return [
//             cond(clockRunning(clock), 0, [
//                   set(state.finished, 0),
//                   set(state.velocity, velocity),
//                   set(state.position, value),
//                   set(config.toValue, dest),
//                   startClock(clock)
//             ]),
//             spring(clock, state, config),
//             cond(state.finished, stopClock(clock)),
//             state.position
//       ];
// }

// FORWARD DRAGGING (= from top to bottom)
// if (
//       y > 30 &&
//       this.state.indexItemDragged + Math.trunc((y + 30) / 70) > this.state.indexItemToSwap &&
//       this.state.indexItemDragged + Math.trunc((y + 30) / 70) < this.state.data.length &&
//       this.state.indexItemDragged + Math.trunc((y + 30) / 70) !== this.state.indexItemToSwap
// ) {
//       let data = [...this.state.data];

//       // Item dragged
//       let item = data[this.state.indexItemDragged + Math.trunc((y + 30) / 70) - 1];
//       // Next item
//       let itemToSwap = data[this.state.indexItemDragged + Math.trunc((y + 30) / 70)];

//       // Add item
//       await data.splice(this.state.indexItemDragged + Math.trunc((y + 30) / 70), 1, item);
//       // Swipe item
//       await data.splice(this.state.indexItemDragged + Math.trunc((y + 30) / 70) - 1, 1, itemToSwap);

//       await this.setState({
//             indexItemToSwap: this.state.indexItemDragged + Math.trunc((y + 30) / 70),
//             data: data
//       });
// }

// if (
//       y < 0 &&
//       this.state.indexItemDragged + Math.trunc((y - 30) / 70) > this.state.indexItemToSwap &&
//       this.state.indexItemDragged + Math.trunc((y - 30) / 70) !== this.state.indexItemToSwap
// ) {
//       // console.log('Forward from backward dragging');
//       let data = [...this.state.data];

//       let item = data[this.state.indexItemDragged + Math.trunc((y - 30) / 70) - 1];
//       let itemToSwap = data[this.state.indexItemDragged + Math.trunc((y + 30) / 70)];

//       // Add item
//       await data.splice(this.state.indexItemDragged + Math.trunc((y - 30) / 70), 1, item);
//       // Swipe item
//       await data.splice(this.state.indexItemDragged + Math.trunc((y - 30) / 70) - 1, 1, itemToSwap);

//       await this.setState({
//             indexItemToSwap: this.state.indexItemDragged + Math.trunc((y + 30) / 70),
//             data: data
//       });
// }

// BACKWARD DRAGGING (= from bottom to top)
// if (
//       y < -30 &&
//       this.state.indexItemDragged + Math.trunc((y - 30) / 70) < this.state.indexItemToSwap &&
//       this.state.indexItemToSwap > 0 &&
//       this.state.indexItemDragged + Math.trunc((y - 30) / 70) !== this.state.indexItemToSwap
// ) {
//       // console.log(this.state.indexItemToSwap);
//       let data = [...this.state.data];

//       let item = data[this.state.indexItemDragged + Math.trunc((y - 30) / 70) + 1];
//       let itemToSwap = data[this.state.indexItemDragged + Math.trunc((y - 30) / 70)];

//       // Add item
//       await data.splice(this.state.indexItemDragged + Math.trunc((y - 30) / 70), 1, item);
//       // Swipe item
//       await data.splice(this.state.indexItemDragged + Math.trunc((y - 30) / 70) + 1, 1, itemToSwap);

//       await this.setState({
//             indexItemToSwap: this.state.indexItemDragged + Math.trunc((y - 30) / 70),
//             data: data
//       });
// }

// if (
//       y > 0 &&
//       this.state.indexItemDragged + Math.trunc((y + 30) / 70) < this.state.indexItemToSwap &&
//       this.state.indexItemDragged + Math.trunc((y + 30) / 70) !== this.state.indexItemToSwap
// ) {
//       // console.log('backwar');
//       let data = [...this.state.data];

//       let item = data[this.state.indexItemDragged + Math.trunc((y + 30) / 70) + 1];
//       let itemToSwap = data[this.state.indexItemDragged + Math.trunc((y + 30) / 70)];

//       // Add item
//       await data.splice(this.state.indexItemDragged + Math.trunc((y + 30) / 70), 1, item);
//       // // Swipe item
//       await data.splice(this.state.indexItemDragged + Math.trunc((y + 30) / 70) + 1, 1, itemToSwap);

//       await this.setState({
//             indexItemToSwap: this.state.indexItemDragged + Math.trunc((y - 30) / 70),
//             data: data
//       });
// }

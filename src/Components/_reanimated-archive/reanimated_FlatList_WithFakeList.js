import React from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity, Alert, FlatList, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
const { width, height } = Dimensions.get('window');

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

// FIXME: I a use a second finger I can make the drag and drop bug (maybe use a second variable for the gestureststate, if it's the first time variable isFirstTime = 1 after isFirstTime = 0 // isFirstTime 1 this.onGestureEvent)

export default class Example extends React.Component {
      constructor(props) {
            super(props);

            this.dragY = new Value(0);
            this.offsetY = new Value(0);
            this.gestureState = new Value(-1);
            this.rootViewY = new Value(0);

            //When we movre our object
            this.onGestureEvent = event([
                  {
                        nativeEvent: {
                              translationY: this.dragY,
                              state: this.gestureState,
                              absoluteY: this.rootViewY
                        }
                  }
            ]);

            this.addY = add(this.dragY, this.offsetY);

            // this.transY = cond(eq(this.gestureState, State.ACTIVE), this.addY, set(this.offsetY, this.addY));
            this.transY = new Value(0);
            this.transYB = new Value(0);
            this.transYC = new Value(0);

            this.scrollOffset = 0;
            this.scrollOffsetForDrag = 0;
      }

      state = {
            dragging: false,
            indexDragged: '',
            indexToSwap: '',
            displayDraggedItem: false,
            data: [
                  'keep an eye',
                  'buy bread',
                  'meeting with partner',
                  'birthday',
                  'clean room',
                  'keep an eye',
                  'buy bread',
                  'meeting with partner',
                  'birthday',
                  'clean room',
                  'keep an eye',
                  'buy bread',
                  'meeting with partner',
                  'birthday',
                  'clean room'
            ]
      };

      handlerLongClick = index => {
            this.setState({
                  dragging: true,
                  indexDragged: index
                  // displayDraggedItem: true
            });
      };

      reset = () => {
            this.flatListRef.setNativeProps({
                  opacity: 1
            });
            this.flatListRef2.setNativeProps({
                  opacity: 0
            });
            this.setState({
                  dragging: false,
                  indexDragged: '',
                  indexToSwap: '',
                  displayDraggedItem: false
            });
      };

      displayDraggedItem = () => {
            // console.log('dragging', );
            // console.log('dragging', );
            if (this.state.dragging === true && this.state.displayDraggedItem === false) {
                  // console.log('display dragged item');
                  this.setState({
                        displayDraggedItem: true
                  });
            }
      };

      // TODO: OPTIM FORWARD AND BACKWARD BY NOT ACTIVATING NOT IN THE ZONE
      sortCalculation = ([y]) => {
            // console.log(Math.trunc(y));
            if (
                  this.state.dragging === true &&
                  y > 50 &&
                  // Avoiding useless render if indexToSwap is the same
                  this.state.indexDragged + Math.trunc((y + 20) / 70) !== this.state.indexToSwap
            ) {
                  this.setState({
                        indexToSwap: this.state.indexDragged + Math.trunc((y + 20) / 70)
                  });
            }

            if (
                  this.state.dragging === true &&
                  y < -50 &&
                  // Avoiding useless render if indexToSwap is the same
                  this.state.indexDragged + Math.trunc((y - 20) / 70) !== this.state.indexToSwap
            ) {
                  this.setState({
                        indexToSwap: this.state.indexDragged + Math.trunc((y - 20) / 70)
                  });
            }
      };

      // TODO: ONLY SORT WHEN
      sort = () => {
            if (this.state.dragging === true) {
                  let sortedData = [...this.state.data];
                  let dataDragged = sortedData[this.state.indexDragged];

                  sortedData.splice(this.state.indexDragged, 1);
                  sortedData.splice(this.state.indexToSwap, 0, dataDragged);

                  this.setState({
                        displayDraggedItem: false,
                        data: sortedData
                  });

                  this.flatListRef.setNativeProps({
                        opacity: 0
                  });

                  this.flatListRef2.setNativeProps({
                        opacity: 1
                  });
            }
      };

      renderItem2 = ({ item, index }) => {
            return (
                  <Animated.View style={[styles.box]} key={index}>
                        <Text>{item}</Text>
                  </Animated.View>
            );
      };

      renderItem = ({ item, index }) => {
            return (
                  <PanGestureHandler
                        maxPointers={1}
                        onGestureEvent={this.onGestureEvent}
                        onHandlerStateChange={this.onGestureEvent}
                        //FIXME: With a smaller minDist, FlatList scroll doesn't work
                        minDist={20}
                        // enabled={this.state.dragging ? false : true}
                        // style={{ opacity: 0 }}
                  >
                        <Animated.View
                              style={[
                                    styles.box,
                                    this.state.displayDraggedItem && this.state.indexDragged === index
                                          ? {
                                                  opacity: 0
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
                                                  ],
                                                  zIndex: 9
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
                                                  ],
                                                  zIndex: 9
                                            }
                                          : {
                                                  opacity: 1,
                                                  transform: [
                                                        {
                                                              translateY: 0
                                                        }
                                                  ],
                                                  zIndex: 9
                                            }
                              ]}
                              key={index}
                        >
                              <Text>{item}</Text>
                              <TouchableOpacity
                                    onLongPress={() => this.handlerLongClick(index)}
                                    onPress={this.handlerClick}
                                    style={{ flex: 1 }}
                              />
                        </Animated.View>
                  </PanGestureHandler>
            );
      };

      start1 = () => {
            console.log('BEGAN');
      };
      start2 = () => {
            console.log('ACTIVE');
      };
      start3 = () => {
            console.log('END');
      };
      start4 = () => {
            console.log('FAILED');
      };
      start5 = () => {
            console.log('CANCELLED');
      };

      scrollOnDrag = ([absoluteY]) => {
            if (this.state.dragging && absoluteY > height - 50) {
                  // console.log(absoluteY);
                  this.flatListRef.scrollToOffset({
                        offset: this.scrollOffsetForDrag + 30,
                        animated: true
                  });
            }

            if (this.state.dragging && absoluteY < 50) {
                  // console.log(absoluteY);
                  this.flatListRef.scrollToOffset({
                        offset: this.scrollOffsetForDrag - 30,
                        animated: true
                  });
            }
      };

      render() {
            return (
                  <View style={styles.container}>
                        {// https://github.com/kmagiera/react-native-gesture-handler/issues/732
                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                        /////////////// State.BEGAN fire on a simple touche and State.ACTIVE fire when we start to drag on Android  ///////////////
                        /////////////// but on iOS it's different State.BEGAN fire when we start to drag and State.ACTIVE follow.         ///////////////
                        /////////////// It become obvious when you use minDist with a big number on the PanGestureHandler.           ///////////////
                        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                        //TODO: Sort only when..
                        //TODO: Check if reset reset correctly
                        //TODO: Join END CANCELLED AND FAILED (only when over)
                        Platform.OS === 'android' ? (
                              <Animated.Code>
                                    {() =>
                                          block([
                                                cond(eq(this.gestureState, State.BEGAN), [
                                                      call([], this.start1),
                                                      set(this.transY, 0),
                                                      set(this.dragY, 0)
                                                ]),
                                                cond(eq(this.gestureState, State.ACTIVE), [
                                                      // call([], this.start2),
                                                      set(this.transY, this.addY),
                                                      call([], this.displayDraggedItem),
                                                      call([this.dragY], this.sortCalculation)
                                                ]),
                                                cond(eq(this.gestureState, State.END), [
                                                      call([], this.start3),
                                                      //TODO: Sort only when..
                                                      call([], this.sort),
                                                      call([], this.reset)
                                                ]),
                                                cond(eq(this.gestureState, State.FAILED), [
                                                      call([], this.start4),
                                                      call([], this.reset)
                                                ]),
                                                cond(eq(this.gestureState, State.CANCELLED), [
                                                      call([], this.start5),
                                                      call([], this.reset)
                                                ]),
                                                // TODO: Change on iOS
                                                cond(
                                                      greaterThan(this.dragY, 50),
                                                      [
                                                            set(this.transYB, -70),
                                                            call([this.rootViewY], this.scrollOnDrag)
                                                      ],
                                                      set(this.transYB, 0)
                                                ),
                                                cond(
                                                      lessThan(this.dragY, -50),
                                                      [
                                                            set(this.transYC, 70),
                                                            call([this.rootViewY], this.scrollOnDrag)
                                                      ],
                                                      set(this.transYC, 0)
                                                )
                                          ])
                                    }
                              </Animated.Code>
                        ) : (
                              <Animated.Code>
                                    {() =>
                                          block([
                                                cond(eq(this.gestureState, State.BEGAN), [
                                                      call([], this.start1),
                                                      call([], this.displayDraggedItem),
                                                      set(this.transY, 0),
                                                      set(this.dragY, 0)
                                                ]),
                                                cond(eq(this.gestureState, State.ACTIVE), [
                                                      // call([], this.start2),
                                                      call([this.dragY], this.sortCalculation),
                                                      set(this.transY, this.addY)
                                                ]),
                                                cond(eq(this.gestureState, State.END), [
                                                      call([], this.start3),
                                                      //TODO: Sort only when..
                                                      call([], this.sort),
                                                      call([], this.reset)
                                                ]),
                                                cond(eq(this.gestureState, State.FAILED), [
                                                      call([], this.start4),
                                                      call([], this.reset)
                                                ]),
                                                cond(eq(this.gestureState, State.CANCELLED), [
                                                      call([], this.start5),
                                                      call([], this.reset)
                                                ]),
                                                cond(
                                                      greaterThan(this.dragY, 50),
                                                      set(this.transYB, -70),
                                                      set(this.transYB, 0)
                                                ),
                                                cond(
                                                      lessThan(this.dragY, -50),
                                                      set(this.transYC, 70),
                                                      set(this.transYC, 0)
                                                )
                                          ])
                                    }
                              </Animated.Code>
                        )}

                        <Animated.View
                              ref={ref => (this.myRef = ref)}
                              style={[
                                    styles.box,
                                    {
                                          backgroundColor: 'blue',
                                          position: 'absolute',
                                          top: this.state.indexDragged * 70 + 100 - this.scrollOffset,
                                          transform: [{ translateY: this.transY }],
                                          zIndex: this.state.dragging ? 1 : -1,
                                          // Necessary hack for iOS
                                          opacity: this.state.displayDraggedItem ? 1 : 0
                                    }
                              ]}
                        >
                              <Text>{this.state.data[this.state.indexDragged]}</Text>
                        </Animated.View>

                        <View style={{ zIndex: 0, opacity: 1, height: height }}>
                              <FlatList
                                    ref={ref => (this.flatListRef = ref)}
                                    contentContainerStyle={{ paddingBottom: 200 }}
                                    data={this.state.data}
                                    extraData={this.state}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={this.renderItem}
                                    scrollEnabled={this.state.dragging ? false : true}
                                    // contentOffset.y === distance in the list
                                    // layoutMeasurement.height === height of the layout
                                    // contentSize.height === Length of the list (1249 = distance (506) + layout (743))
                                    onScroll={e => {
                                          // console.log(e.nativeEvent);
                                          if (this.scrollOffset !== Math.trunc(e.nativeEvent.contentOffset.y)) {
                                                this.scrollOffset = Math.trunc(e.nativeEvent.contentOffset.y);
                                                this.scrollOffsetForDrag = Math.trunc(e.nativeEvent.contentOffset.y);
                                                // Scroll on the fake FlatList to follow the real FlatList
                                                this.flatListRef3.scrollToOffset({
                                                      offset: this.scrollOffset,
                                                      animated: false
                                                });
                                          }
                                    }}
                              />
                        </View>

                        {/* It's important to keep an height on both FlatList to keep them synced and to not add paddingtop on them */}
                        <View
                              ref={ref => (this.flatListRef2 = ref)}
                              style={{
                                    zIndex: -1,
                                    position: 'absolute',
                                    top: 100,
                                    opacity: 0,
                                    height: height
                              }}
                        >
                              <FlatList
                                    ref={ref => (this.flatListRef3 = ref)}
                                    contentContainerStyle={{ paddingBottom: 200 }}
                                    data={this.state.data}
                                    extraData={this.state}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={this.renderItem2}
                                    scrollEnabled={false}
                              />
                        </View>
                  </View>
            );
      }
}

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

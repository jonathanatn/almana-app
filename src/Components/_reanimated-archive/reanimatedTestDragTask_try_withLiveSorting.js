import React from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity, Alert, FlatList, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
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

// FIXME: I a use a second finger I can make the drag and drop bug (maybe use a second variable for the gestureststate, if it's the first time variable isFirstTime = 1 after isFirstTime = 0 // isFirstTime 1 this.onGestureEvent)

export default class Example extends React.Component {
      constructor(props) {
            super(props);

            this.dragY = new Value(0);
            this.offsetY = new Value(0);
            this.gestureState = new Value(-1);

            //When we movre our object
            this.onGestureEvent = event([
                  {
                        nativeEvent: {
                              translationY: this.dragY,
                              state: this.gestureState
                        }
                  }
            ]);

            this.addY = add(this.dragY, this.offsetY);

            // this.transY = cond(eq(this.gestureState, State.ACTIVE), this.addY, set(this.offsetY, this.addY));
            this.transY = new Value(0);
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

      componentDidMount() {
            console.log(this.state.data[0]);
      }

      handlerLongClick = index => {
            this.setState({
                  dragging: true,
                  indexDragged: index
                  // displayDraggedItem: true
            });
      };

      reset = () => {
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

      sort = () => {
            if (this.state.dragging === true) {
                  let sortedData = [...this.state.data];
                  let dataDragged = sortedData[this.state.indexDragged];

                  sortedData.splice(this.state.indexDragged, 1);
                  sortedData.splice(this.state.indexToSwap, 0, dataDragged);

                  this.setState({
                        data: sortedData
                  });
            }
      };

      // TODO: OPTIM FORWARD AND BACKWARD
      sortCalculation = ([y]) => {
            // console.log(Math.trunc(y));
            if (
                  this.state.dragging === true &&
                  y > 50 &&
                  // Avoiding useless render if indexToSwap is the same
                  this.state.indexDragged + Math.trunc((y + 20) / 70) !== this.state.indexToSwap
            ) {
                  // console.log('DRAGY: ', Math.trunc(y));
                  // console.log('INDEXDRAGGED', this.state.indexDragged + Math.trunc((y + 20) / 70));

                  let sortedData = [...this.state.data];
                  let dataDragged = sortedData[this.state.indexDragged];

                  sortedData.splice(this.state.indexDragged, 1);
                  sortedData.splice(this.state.indexDragged + Math.trunc((y + 20) / 70), 0, dataDragged);

                  this.setState({
                        indexToSwap: this.state.indexDragged + Math.trunc((y + 20) / 70),
                        data: sortedData
                  });
            }

            if (
                  this.state.dragging === true &&
                  y < -50 &&
                  // Avoiding useless render if indexToSwap is the same
                  this.state.indexDragged + Math.trunc((y - 20) / 70) !== this.state.indexToSwap
            ) {
                  // console.log('DRAGY: ', Math.trunc(y));
                  // console.log('INDEXDRAGGED', this.state.indexDragged + Math.trunc((y - 20) / 70));
                  this.setState({
                        indexToSwap: this.state.indexDragged + Math.trunc((y - 20) / 70)
                  });
            }
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
                                    {
                                          opacity:
                                                this.state.displayDraggedItem && this.state.indexDragged === index
                                                      ? 0
                                                      : 1
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
                                                      // call([], this.sort),
                                                      call([], this.reset)
                                                ]),
                                                cond(eq(this.gestureState, State.FAILED), [
                                                      call([], this.start4),
                                                      call([], this.reset)
                                                ]),
                                                cond(eq(this.gestureState, State.CANCELLED), [
                                                      call([], this.start5),
                                                      call([], this.reset)
                                                ])
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
                                                ])
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
                                          top: this.state.indexDragged * 70 + 100,
                                          transform: [{ translateY: this.transY }],
                                          zIndex: this.state.dragging ? 1 : -1,
                                          // Necessary hack for iOS
                                          opacity: this.state.displayDraggedItem ? 1 : 0
                                    }
                              ]}
                        >
                              <Text>{this.state.data[this.state.indexDragged]}</Text>
                        </Animated.View>

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
                              // onScroll={e => {
                              //       console.log(e.nativeEvent);
                              // }}
                        />
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

// STATIC UI
import React from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Platform, TouchableHighlight, TouchableNativeFeedback } from 'react-native';
import Task from './Elements/Task';

// ANIMATED UI
import Animated from 'react-native-reanimated';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
const { cond, eq, add, call, set, Value, event, block, and, greaterThan, lessThan } = Animated;
const { diff, or, debug, startClock, lessOrEq, greaterOrEq } = Animated;

// DATA
import { firestoreConnect } from 'react-redux-firebase';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { addTaskAction, receiveTasksAction, editTasksPositionAction } from '../Store/actions/taskAction';
import {
      setSelectedItemAction,
      openItemMenuAction,
      closeItemMenuAction,
      closeDateMoverAction
} from '../Store/actions/generalAction';
function mapDispatchToProps(dispatch) {
      return {
            receiveTasksProp: date => dispatch(receiveTasksAction(date)),
            addTaskProp: task => dispatch(addTaskAction(task)),
            editTasksPositionProp: tasks => dispatch(editTasksPositionAction(tasks)),
            setSelectedItemProp: item => dispatch(setSelectedItemAction(item)),
            openItemMenuProp: () => dispatch(openItemMenuAction()),
            closeItemMenuProp: () => dispatch(closeItemMenuAction())
      };
}

// HELPERS
import { getToday } from '../Utils/helpers';
import moment from 'moment';
const { width, height } = Dimensions.get('window');

class ItemList extends React.Component {
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
            displayDraggedItem: false
      };

      componentDidUpdate(prevProps) {
            if (!this.props.areTasksSorted && this.props.tasks.length > 0) {
                  this.props.editTasksPositionProp(this.props.tasks);
            }
      }

      handleItemClick = async item => {
            this.props.setSelectedItemProp(item);

            if (this.props.general.isDateMoverOpen === true) {
                  this.props.closeDateMoverParentProp();
            }

            // ItemMenu is rendered in MainScreen.js
            if (this.props.general.isItemMenuOpen === true) {
                  await this.props.closeItemMenuProp();
                  this.props.openItemMenuProp();
            } else {
                  this.props.openItemMenuProp();
            }
      };

      handlerLongClick = index => {
            // console.log(index);
            this.setState({
                  dragging: true,
                  indexDragged: index
                  // displayDraggedItem: true
            });

            // After a ling a press we give a feedback to the user so he knows that he is dragging
            // But it would make but iOS to do it that way so instead we make a conditional style in the _renderITem function for iOS
            Platform.OS === 'android' &&
                  this.setState({
                        displayDraggedItem: true
                  });
      };

      reset = () => {
            this.setState({
                  dragging: false,
                  indexDragged: '',
                  indexToSwap: '',
                  displayDraggedItem: false
            });
            this.flatListRef2.setNativeProps({
                  opacity: 0
            });
            this.flatListRef.setNativeProps({
                  opacity: 1
            });
      };

      displayDraggedItem = () => {
            if (this.state.dragging === true && this.state.displayDraggedItem === false && Platform.OS === 'ios') {
                  this.setState({
                        displayDraggedItem: true
                  });
            }
      };

      sortCalculation = ([y]) => {
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

      sort = () => {
            // Hide the dragged item just before the sort to avoid render bug
            this.draggedItemRef.setNativeProps({
                  opacity: 0
            });
            if (this.state.dragging === true) {
                  if (this.props.tasks.length > 1) {
                        let tasksCopy = [...this.props.tasks];
                        let tasksToEditPosition = [];

                        tasksToEditPosition.push(tasksCopy[this.state.indexDragged]);
                        tasksToEditPosition[0].position = this.state.indexToSwap;

                        if (this.state.indexDragged < this.state.indexToSwap) {
                              tasksCopy.map((item, index) => {
                                    if (index <= this.state.indexToSwap && index > this.state.indexDragged) {
                                          item.position--;
                                          tasksToEditPosition.push(item);
                                    }
                              });
                        }

                        if (this.state.indexDragged > this.state.indexToSwap) {
                              tasksCopy.map((item, index) => {
                                    if (index >= this.state.indexToSwap && index < this.state.indexDragged) {
                                          item.position++;
                                          tasksToEditPosition.push(item);
                                    }
                              });
                        }

                        this.props.editTasksPositionProp(tasksToEditPosition);
                  }

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
                        <Task {...item} />
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
                        // enabled={this.state.dragging ? true : false}
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
                              <TouchableOpacity
                                    onLongPress={() => this.handlerLongClick(index)}
                                    onPress={() => this.handleItemClick(item)}
                                    activeOpacity={0.5}
                                    // style={{ flex: 1 }}

                                    // We give feedback to the user on iOS so he knows he is dragging
                                    // Doesn't work on Android so instead we display the dragged item earlier in the handleLongPress function
                                    style={
                                          this.state.indexDragged === index && Platform.OS === 'ios'
                                                ? {
                                                        flex: 1,
                                                        elevation: 5,
                                                        shadowColor: 'black',
                                                        shadowOffset: { width: 0, height: 0.5 * 5 },
                                                        shadowOpacity: 0.3,
                                                        shadowRadius: 0.8 * 5
                                                  }
                                                : { flex: 1 }
                                    }
                              >
                                    <Task {...item} />
                              </TouchableOpacity>
                        </Animated.View>
                  </PanGestureHandler>
            );
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
            // console.log(this.props.tasks);
            return (
                  <View style={styles.container}>
                        {// https://github.com/kmagiera/react-native-gesture-handler/issues/732
                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                        /////////////// State.BEGAN fire on a simple touche and State.ACTIVE fire when we start to drag on Android  ///////////////
                        /////////////// but on iOS it's different State.BEGAN fire when we start to drag and State.ACTIVE follow.         ///////////////
                        /////////////// It become obvious when you use minDist with a big number on the PanGestureHandler.           ///////////////
                        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                        Platform.OS === 'android' ? (
                              <Animated.Code>
                                    {() =>
                                          block([
                                                cond(eq(this.gestureState, State.BEGAN), [
                                                      set(this.transY, 0),
                                                      set(this.dragY, 0)
                                                ]),
                                                cond(eq(this.gestureState, State.ACTIVE), [
                                                      set(this.transY, this.addY),
                                                      call([], this.displayDraggedItem),
                                                      call([this.dragY], this.sortCalculation)
                                                ]),
                                                cond(
                                                      and(
                                                            eq(this.gestureState, State.END),
                                                            or(greaterThan(this.dragY, 50), lessThan(this.dragY, -50))
                                                      ),
                                                      [call([], this.sort), call([], this.reset)]
                                                ),
                                                cond(eq(this.gestureState, State.END), [call([], this.reset)]),
                                                cond(eq(this.gestureState, State.FAILED), [call([], this.reset)]),
                                                cond(eq(this.gestureState, State.CANCELLED), [call([], this.reset)]),
                                                // TODO: Make scroll when drag in the bottom or end
                                                cond(
                                                      greaterThan(this.dragY, 50),
                                                      [
                                                            set(this.transYB, -70)
                                                            // call([this.rootViewY], this.scrollOnDrag)
                                                      ],
                                                      set(this.transYB, 0)
                                                ),
                                                cond(
                                                      lessThan(this.dragY, -50),
                                                      [
                                                            set(this.transYC, 70)
                                                            // call([this.rootViewY], this.scrollOnDrag)
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
                                                      call([], this.displayDraggedItem),
                                                      set(this.transY, 0),
                                                      set(this.dragY, 0)
                                                ]),
                                                cond(eq(this.gestureState, State.ACTIVE), [
                                                      call([this.dragY], this.sortCalculation),
                                                      set(this.transY, this.addY)
                                                ]),
                                                cond(
                                                      and(
                                                            eq(this.gestureState, State.END),
                                                            or(greaterThan(this.dragY, 50), lessThan(this.dragY, -50))
                                                      ),
                                                      [call([], this.sort), call([], this.reset)]
                                                ),
                                                cond(eq(this.gestureState, State.END), [call([], this.reset)]),
                                                cond(eq(this.gestureState, State.FAILED), [call([], this.reset)]),
                                                cond(eq(this.gestureState, State.CANCELLED), [call([], this.reset)]),
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
                              ref={ref => (this.draggedItemRef = ref)}
                              style={[
                                    styles.box,
                                    {
                                          position: 'absolute',

                                          top: this.state.indexDragged * 70 + 0 - this.scrollOffset,
                                          // top: this.state.indexDragged * 70 + 100 - this.scrollOffset,
                                          transform: [{ translateY: this.transY }],
                                          zIndex: this.state.dragging ? 1 : -1,
                                          // Necessary hack for iOS
                                          opacity: this.state.displayDraggedItem ? 1 : 0,
                                          elevation: 5,
                                          shadowColor: 'black',
                                          shadowOffset: { width: 0, height: 0.5 * 5 },
                                          shadowOpacity: 0.3,
                                          shadowRadius: 0.8 * 5
                                    }
                              ]}
                        >
                              {this.state.indexDragged !== '' && (
                                    <Task {...this.props.tasks[this.state.indexDragged]} />
                              )}
                        </Animated.View>

                        <View style={{ zIndex: 0, opacity: 1, height: height }}>
                              <FlatList
                                    ref={ref => (this.flatListRef = ref)}
                                    contentContainerStyle={{ paddingBottom: 200 }}
                                    data={this.props.tasks}
                                    extraData={this.props}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={this.renderItem}
                                    // scrollEnabled={this.state.dragging ? false : true}
                                    scrollEnabled={this.state.dragging ? false : true}
                                    showsVerticalScrollIndicator={false}
                                    onScroll={e => {
                                          if (this.scrollOffset !== Math.trunc(e.nativeEvent.contentOffset.y)) {
                                                // contentOffset.y === distance in the list
                                                // layoutMeasurement.height === height of the layout
                                                // contentSize.height === Length of the list (1249 = distance (506) + layout (743))
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
                                    // top: 100,
                                    opacity: 0,
                                    height: height
                              }}
                        >
                              <FlatList
                                    ref={ref => (this.flatListRef3 = ref)}
                                    contentContainerStyle={{ paddingBottom: 200 }}
                                    data={this.props.tasks}
                                    extraData={this.props}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={this.renderItem2}
                                    scrollEnabled={false}
                                    showsVerticalScrollIndicator={false}
                              />
                        </View>
                  </View>
            );
      }
}

function mapStateToProp(state, ownProps) {
      // console.log(state.tasks);
      let tasks = state.tasks ? state.tasks : {};

      let areTasksSorted = false;

      let tasksArray = Object.values(tasks);

      // Get tasks of the day
      tasksArray = tasksArray.filter(item => {
            //     return item.date === ownProps.date;
            return item.date === state.general.dateSelectedDateMover && item.uid === state.auth.uid;
      });

      let tasksArrayWithPosition = [];
      let tasksArrayToSort = [];

      //Make a distinction between tasks positioned and unpositioned
      tasksArray.map(item => {
            if (item.position === -1) {
                  tasksArrayToSort.push(item);
            } else {
                  tasksArrayWithPosition.push(item);
            }
      });

      if (tasksArrayToSort.length === 0) {
            areTasksSorted = true;
      }

      //SORTING the array with position if it's not empty
      // Set the correct position because if we change the date of an item it inside the same day it will create a hole in the array
      if (tasksArrayWithPosition.length > 0) {
            tasksArrayWithPosition.sort(function(a, b) {
                  return a.position - b.position;
            });
            tasksArrayWithPosition.map((item, index) => {
                  item.position = index;
            });
      }

      tasksArrayToSort.map((item, index) => {
            let stopMapping = false;
            if (item.time === '') {
                  item.position = tasksArrayWithPosition.length;
                  tasksArrayWithPosition.push(item);
                  stopMapping = true;
            }
            if (item.time !== '' && stopMapping === false) {
                  let stopMappingB = false;

                  if (stopMappingB === false) {
                        let stopMappingC = false;
                        tasksArrayWithPosition.map((itemB, indexB) => {
                              if (item.time === itemB.time && stopMappingC === false) {
                                    item.position = indexB;
                                    tasksArrayWithPosition.splice(indexB, 0, item);
                                    tasksArrayWithPosition.map((itemC, indexC) => {
                                          if (indexC > indexB) {
                                                itemC.position++;
                                          }
                                    });

                                    stopMappingC = true;
                                    stopMappingB = true;
                              }
                        });
                  }

                  if (stopMappingB === false) {
                        let stopMappingC = false;
                        tasksArrayWithPosition.map((itemB, indexB) => {
                              let timeToSort = moment(item.time, 'h:mma');
                              let timeWithPosition = moment(itemB.time, 'h:mma');

                              if (timeToSort.isBefore(timeWithPosition) && stopMappingC === false) {
                                    item.position = indexB;
                                    tasksArrayWithPosition.splice(indexB, 0, item);
                                    tasksArrayWithPosition.map((itemC, indexC) => {
                                          if (indexC > indexB) {
                                                itemC.position++;
                                          }
                                    });

                                    stopMappingC = true;
                                    stopMappingB = true;
                              }
                        });
                  }

                  if (stopMappingB === false) {
                        item.position = tasksArrayWithPosition.length;
                        tasksArrayWithPosition.push(item);
                  }

                  //FIXME:
                  //areTasksSorted = true;
            }
      });

      return {
            date: getToday,
            tasks: tasksArrayWithPosition,
            areTasksSorted: areTasksSorted,
            general: state.general,
            closeDateMoverParentProp: ownProps.closeDateMover
      };
}

export default compose(
      connect(
            mapStateToProp,
            mapDispatchToProps
      )
      // firestoreConnect([{ collection: 'tasks' }])
)(ItemList);

const styles = StyleSheet.create({
      container: {
            flex: 1
      },
      box: {
            width: width,
            height: 70,
            borderColor: '#000'
      }
});

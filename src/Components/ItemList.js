// STATIC UI
import React from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Platform, TouchableHighlight, TouchableNativeFeedback } from 'react-native';
import Task from './Elements/Task';
import Event from './Elements/Event';

// ANIMATED UI
import Animated from 'react-native-reanimated';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
const { cond, eq, add, call, set, Value, event, block, and, greaterThan, lessThan } = Animated;
const { diff, or, debug, startClock, lessOrEq, greaterOrEq } = Animated;

// DATA
import { firestoreConnect } from 'react-redux-firebase';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { receiveTasksAction, editTasksPositionAction, editTaskPeriodAction } from '../Store/actions/taskAction';
import { editEventsPositionAction } from '../Store/actions/eventAction';
import { setSelectedItemAction, openTaskMenuAction, openEventMenuAction } from '../Store/actions/generalAction';
import {
      closeTaskMenuAction,
      closeDateMoverAction,
      closeEventMenuAction,
      closeTaskAdderAction
} from '../Store/actions/generalAction';
function mapDispatchToProps(dispatch) {
      return {
            // TASKS
            // receiveTasksProp: date => dispatch(receiveTasksAction(date)),
            editTasksPositionProp: tasks => dispatch(editTasksPositionAction(tasks)),
            editTaskPeriodProp: (period, id) => dispatch(editTaskPeriodAction(period, id)),

            // EVENTS
            editEventsPositionProp: events => dispatch(editEventsPositionAction(events)),

            // GENERAL
            setSelectedItemProp: item => dispatch(setSelectedItemAction(item)),
            openTaskMenuProp: () => dispatch(openTaskMenuAction()),
            closeTaskMenuProp: () => dispatch(closeTaskMenuAction()),
            openEventMenuProp: () => dispatch(openEventMenuAction()),
            closeEventMenuProp: () => dispatch(closeEventMenuAction()),
            closeTaskAdderProp: () => dispatch(closeTaskAdderAction())
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
            if (!this.props.areTasksSorted && this.props.tasks.length > 3) {
                  let tasksArray = [];
                  let eventsArray = [];

                  this.props.tasks.map(item => {
                        if (item.type === 'event') {
                              eventsArray.push(item);
                        } else if (item.type === 'task') {
                              tasksArray.push(item);
                        }
                  });

                  if (tasksArray.length > 0) {
                        this.props.editTasksPositionProp(tasksArray);
                  }
                  if (eventsArray.length > 0) {
                        this.props.editEventsPositionProp(eventsArray);
                  }
            }
      }

      handleItemClick = async item => {
            if (item.type === 'periodCategory') {
                  return;
            }
            this.props.setSelectedItemProp(item);

            if (this.props.general.isDateMoverOpen === true) {
                  this.props.closeDateMoverParentProp();
            }
            if (this.props.general.isTaskAdderOpen === true) {
                  this.props.closeTaskAdderProp();
            }

            // TaskMenu & EventMenu are rendered in MainScreen.js
            if (this.props.general.isTaskMenuOpen === true || this.props.general.isEventMenuOpen === true) {
                  // If one of the item menu is open, we close it
                  await this.props.closeTaskMenuProp();
                  await this.props.closeEventMenuProp();
                  // After we open the right menu depending the item, to make the animation
                  if (!item.event) {
                        this.props.openTaskMenuProp();
                  } else {
                        this.props.openEventMenuProp();
                  }
                  // Else menu are close so we open the good one
            } else {
                  if (!item.event) {
                        this.props.openTaskMenuProp();
                  } else {
                        this.props.openEventMenuProp();
                  }
            }
      };

      handlerLongClick = (index, item) => {
            if (item.time !== '' && (item.type === 'event' || item.type === 'task')) {
                  Alert.alert(
                        '',
                        'Sorry, only tasks without scheduled hours can be moved.',
                        [
                              {
                                    text: 'OK'
                              }
                        ],
                        { cancelable: false }
                  );
                  return;
            }
            if (item.type === 'periodCategory') {
                  return;
            }

            this.setState({
                  dragging: true,
                  indexDragged: index
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
                  // Superior to 3 for the day period category
                  if (this.props.tasks.length > 0) {
                        let tasksCopy = [...this.props.tasks];
                        let tasksToEditPosition = [];
                        let eventsToEditPosition = [];

                        // Means it's forward dragging
                        if (this.state.indexDragged < this.state.indexToSwap) {
                              // Push the dragged item
                              tasksToEditPosition.push(tasksCopy[this.state.indexDragged]);

                              // If we drag more than we have item, we give the item the last position
                              if (this.state.indexToSwap >= tasksCopy.length) {
                                    tasksToEditPosition[0].position = tasksCopy[tasksCopy.length - 1].position;
                                    tasksToEditPosition[0].period = tasksCopy[tasksCopy.length - 1].period;
                              } else {
                                    tasksToEditPosition[0].position = this.state.indexToSwap;
                                    tasksToEditPosition[0].period = tasksCopy[this.state.indexToSwap].period;
                              }

                              tasksCopy.map((item, index) => {
                                    if (index <= this.state.indexToSwap && index > this.state.indexDragged) {
                                          if (item.type === 'event') {
                                                item.position--;
                                                eventsToEditPosition.push(item);
                                          } else if (item.type === 'task') {
                                                item.position--;
                                                tasksToEditPosition.push(item);
                                          }
                                    }
                              });
                        }

                        if (this.state.indexDragged > this.state.indexToSwap && this.state.indexToSwap > 0) {
                              tasksToEditPosition.push(tasksCopy[this.state.indexDragged]);
                              tasksToEditPosition[0].position = this.state.indexToSwap;
                              tasksToEditPosition[0].period = tasksCopy[this.state.indexToSwap - 1].period;

                              tasksCopy.map((item, index) => {
                                    if (index >= this.state.indexToSwap && index < this.state.indexDragged) {
                                          if (item.type === 'event') {
                                                item.position++;
                                                eventsToEditPosition.push(item);
                                          } else if (item.type === 'task') {
                                                item.position++;
                                                tasksToEditPosition.push(item);
                                          }
                                    }
                              });
                        }

                        this.props.editTasksPositionProp(tasksToEditPosition);
                        this.props.editEventsPositionProp(eventsToEditPosition);
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
                        {item.type === 'event' && <Event {...item} />}
                        {item.type === 'periodCategory' && (
                              <Text
                                    style={{
                                          fontWeight: 'bold',
                                          color: '#FF2D55',
                                          paddingTop: 40,
                                          marginLeft: 16
                                    }}
                              >
                                    {item.name}
                              </Text>
                        )}
                        {item.type === 'task' && <Task {...item} />}
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
                                    onLongPress={() => this.handlerLongClick(index, item)}
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
                                    {item.type === 'event' && <Event {...item} />}
                                    {item.type === 'periodCategory' && (
                                          <Text
                                                style={{
                                                      fontWeight: 'bold',
                                                      color: '#FF2D55',
                                                      paddingTop: 40,
                                                      marginLeft: 16
                                                }}
                                          >
                                                {item.name}
                                          </Text>
                                    )}
                                    {item.type === 'task' && <Task {...item} />}
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
                                          // -30 are for the negative marginTop on the FlatList
                                          top: this.state.indexDragged * 70 + 0 - this.scrollOffset - 30,
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
                                    keyboardShouldPersistTaps="always"
                                    ref={ref => (this.flatListRef = ref)}
                                    contentContainerStyle={{ paddingBottom: 300, marginTop: -30 }}
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
                                    keyboardShouldPersistTaps="always"
                                    ref={ref => (this.flatListRef3 = ref)}
                                    contentContainerStyle={{ paddingBottom: 300, marginTop: -30 }}
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
      // 1 - Receive today tasks and events
      let tasks = state.tasks ? state.tasks : {};
      let events = state.events ? state.events : {};

      let allItems = [...Object.values(tasks), ...Object.values(events)];
      let itemsArray = [];

      for (let i = 0, len = allItems.length; i < len; i++) {
            if (allItems[i].date === state.general.dateSelectedDateMover && allItems[i].uid === state.auth.uid) {
                  itemsArray.push(allItems[i]);
            }
      }

      let morningCategory = [{ type: 'periodCategory', name: 'Morning ', position: 0, period: 'Morning' }];
      let afternoonCategory = [{ type: 'periodCategory', name: 'Afternoon ', position: 0, period: 'Afternoon' }];
      let eveningCategory = [{ type: 'periodCategory', name: 'Evening ', position: 0, period: 'Evening' }];
      let itemsToSort = [];

      itemsArray.map((item, index) => {
            if (item.position === -1) {
                  itemsToSort.push(item);
            } else {
                  if (item.period === 'Morning') {
                        morningCategory.push(item);
                  } else if (item.period === 'Afternoon') {
                        afternoonCategory.push(item);
                  } else {
                        eveningCategory.push(item);
                  }
            }
      });

      // 3 - If my local arrays are not empty, sort them by position to be sure there is no hole cause by a date moved item
      // Make sure we will do the rest of operation on an healthy base
      if (morningCategory.length > 1) {
            morningCategory.sort(function(a, b) {
                  return a.position - b.position;
            });
      }
      if (afternoonCategory.length > 1) {
            afternoonCategory.sort(function(a, b) {
                  return a.position - b.position;
            });
      }
      if (eveningCategory.length > 1) {
            eveningCategory.sort(function(a, b) {
                  return a.position - b.position;
            });
      }

      // Check if there is no items to sort, to avoid component update
      let areTasksSorted = false;
      if (itemsToSort.length === 0) {
            areTasksSorted = true;
      }

      itemsToSort.map(item => {
            // First check task with no time property
            // We simply push it at the end of the period he is in
            if (item.time === '') {
                  if (item.period === 'Morning') {
                        morningCategory.push(item);
                  } else if (item.period === 'Afternoon') {
                        afternoonCategory.push(item);
                  } else {
                        eveningCategory.push(item);
                  }
                  // Else the item have a time property
            } else {
                  if (item.period === 'Morning') {
                        let isItemSorted = false;
                        let time = moment(item.time, 'h:mma');

                        // Check if there is an item with a time prop superior, so we splice it before
                        morningCategory.map((itemToCompare, index) => {
                              // That condition is to stop mapping once we have found the first item with a superior time prop
                              if (isItemSorted === false) {
                                    let time2 = moment(itemToCompare.time, 'h:mma');
                                    if (time.isBefore(time2)) {
                                          morningCategory.splice(index, 0, item);
                                          isItemSorted = true;
                                    }
                              }
                        });
                        // If we didn't find an item with a time prop superior, we simply push the item at the end
                        if (isItemSorted === false) {
                              morningCategory.push(item);
                        }
                  } else if (item.period === 'Afternoon') {
                        let isItemSorted = false;
                        let time = moment(item.time, 'h:mma');

                        // Check if there is an item with a time prop superior, so we splice it before
                        afternoonCategory.map((itemToCompare, index) => {
                              // That condition is to stop mapping once we have found the first item with a superior time prop
                              if (isItemSorted === false) {
                                    let time2 = moment(itemToCompare.time, 'h:mma');
                                    if (time.isBefore(time2)) {
                                          afternoonCategory.splice(index, 0, item);
                                          isItemSorted = true;
                                    }
                              }
                        });
                        // If we didn't find an item with a time prop superior, we simply push the item at the end
                        if (isItemSorted === false) {
                              afternoonCategory.push(item);
                        }
                  } else {
                        let isItemSorted = false;
                        let time = moment(item.time, 'h:mma');

                        // Check if there is an item with a time prop superior, so we splice it before
                        eveningCategory.map((itemToCompare, index) => {
                              // That condition is to stop mapping once we have found the first item with a superior time prop
                              if (isItemSorted === false) {
                                    let time2 = moment(itemToCompare.time, 'h:mma');
                                    if (time.isBefore(time2)) {
                                          eveningCategory.splice(index, 0, item);
                                          isItemSorted = true;
                                    }
                              }
                        });
                        // If we didn't find an item with a time prop superior, we simply push the item at the end
                        if (isItemSorted === false) {
                              eveningCategory.push(item);
                        }
                  }
            }
      });

      let sortedItemsComplete = [...morningCategory, ...afternoonCategory, ...eveningCategory];

      sortedItemsComplete.map((item, index) => {
            item.position = index;
      });

      return {
            date: getToday,
            tasks: sortedItemsComplete,
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

// STATIC UI
import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, Alert, BackHandler } from 'react-native';
import { Platform, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Task from './Elements/Task';
import Event from './Elements/Event';

// ANIMATED UI
import Animated from 'react-native-reanimated';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
const { cond, eq, add, call, set, Value, event, block, and, greaterThan, lessThan, clockRunning } = Animated;
const { diff, or, debug, startClock, lessOrEq, greaterOrEq, defined, Clock, stopClock, spring } = Animated;

// DATA
import { withNavigationFocus, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { editTasksPositionAction } from '../Store/actions/taskAction';
import { editEventsPositionAction } from '../Store/actions/eventAction';
import { setSelectedItemAction, openTaskMenuAction, openEventMenuAction } from '../Store/actions/generalAction';
import { closeTaskMenuAction, closeDateMoverAction, closeEventMenuAction } from '../Store/actions/generalAction';
import { closeTaskAdderAction } from '../Store/actions/generalAction';
function mapDispatchToProps(dispatch) {
      return {
            // TASKS
            editTasksPositionProp: (id, position) => dispatch(editTasksPositionAction(id, position)),

            // EVENTS
            editEventsPositionProp: (id, position) => dispatch(editEventsPositionAction(id, position)),

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
import moment from 'moment';
import { getToday, isRepeatedItemsValid } from '../Utils/helpers';
const { width, height } = Dimensions.get('window');

const itemHeight = 65;

class ItemList extends Component {
      constructor(props) {
            super(props);
            this.dragY = new Value(0);
            this.gestureState = new Value(-1);
            this.velocityY = new Value(0);

            //When we movre our object
            this.onGestureEvent = event([
                  {
                        nativeEvent: {
                              translationY: this.dragY,
                              state: this.gestureState,
                              velocityY: this.velocityY
                        }
                  }
            ]);

            // DRAGGING ITEM
            this.offsetY = new Value(0);
            this.addY = add(this.dragY, this.offsetY);
            this.transY = new Value(0);

            this.scrollOffset = 0;
            // Dynamically get the height of the FlatList
            this.listHeight = 0;
            this.listOffset = 0;

            // SCROLL LIST
            // Keeps where we are in the scroll list
            this.scrollListOffset = 0;

            this.state = {
                  data: [],
                  itemToDispatch: [{}],
                  dragging: false,
                  indexItemDragged: -1,
                  indexItemToSwap: -1,
                  dispatchSort: false,
                  previousItem: -1
            };
      }

      componentDidMount() {
            this.willFocusListener = this.props.navigation.addListener('willFocus', () => {
                  this.setState({
                        data: this.props.items
                  });
            });
      }

      componentWillUnmount() {
            this.willFocusListener.remove();
      }

      componentDidUpdate(prevProps) {
            let isFocused = this.props.navigation.isFocused();
            if (this.props.items !== prevProps.items && isFocused) {
                  this.setState({
                        data: this.props.items
                  });

                  let tasksArray = [];
                  let eventsArray = [];

                  this.props.itemsToDispatch.map(item => {
                        if (
                              item.type === 'event'
                              // !isRepeatedItemsValid(this.props.general.dateSelectedDateMover, item)
                        ) {
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

      handleSimpleTap = item => {
            if (item.type === 'periodCategory') {
                  return;
            }
            if (
                  item.id === this.props.general.selectedItem.id &&
                  (this.props.general.isEventMenuOpen === true || this.props.general.isTaskMenuOpen === true)
            ) {
                  this.props.closeTaskMenuProp();
                  this.props.closeEventMenuProp();
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
            if (this.props.general.isEventMenuOpen === true || this.props.general.isTaskMenuOpen === true) {
                  // If one of the item menu is open, we close it
                  this.props.closeTaskMenuProp();
                  this.props.closeEventMenuProp();

                  if (item.type === 'event') {
                        setTimeout(() => {
                              this.props.openEventMenuProp();
                        }, 100);
                  } else if (item.type === 'task') {
                        setTimeout(() => {
                              this.props.openTaskMenuProp();
                        }, 100);
                  }
            } else {
                  if (item.type === 'task') {
                        this.props.openTaskMenuProp();
                  } else if (item.type === 'event') {
                        this.props.openEventMenuProp();
                  }
            }
      };

      handleLongPress = (item, index) => {
            if (item.time !== '' && (item.type === 'event' || item.type === 'task')) {
                  Alert.alert(
                        '',
                        'Sorry, only tasks without a scheduled hour can be moved.',
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
                  // console.log('pressout');
                  this.gestureState.setValue(5);
            }
            if (
                  Platform.OS === 'android' &&
                  e.touchHistory.touchBank[0].currentPageY > e.touchHistory.touchBank[0].startPageY - 10 &&
                  e.touchHistory.touchBank[0].currentPageY < e.touchHistory.touchBank[0].startPageY + 10
            ) {
                  // console.log('pressout');
                  this.gestureState.setValue(5);
            }
      };

      reset = () => {
            // console.log('reset');
            this.transY.setValue(0);
            if (this.state.dispatchSort) {
                  this.dispatchSort();
            }
            this.setState({
                  dragging: false,
                  indexItemDragged: -1,
                  itemDragged: '',
                  indexItemToSwap: -1,
                  dispatchSort: false
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
                  let fullContentHeight = this.state.data.length * itemHeight;
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

      dispatchSort = () => {
            let itemDragged = this.state.data[this.state.indexItemToSwap];
            let previousItem = this.state.data[this.state.indexItemToSwap - 1];

            let itemsToDispatch = [];

            // console.log('itemdragged: ', itemDragged);
            // console.log('previousitem: ', previousItem);

            let previousItemHour = previousItem.position.substring(0, 2);
            let previousItemMinute = previousItem.position.substring(3, 5);
            let previousItemSecond = previousItem.position.substring(6);
            let previousItemDate = new Date(
                  '1992',
                  '02',
                  '18',
                  previousItemHour,
                  previousItemMinute,
                  previousItemSecond
            );
            previousItemDate.setSeconds(previousItemDate.getSeconds() + 1);
            let formattedDate = moment(previousItemDate).format('HH:mm:ss');
            itemHour = formattedDate.substring(0, 2);
            itemMinute = formattedDate.substring(3, 5);
            itemSecond = formattedDate.substring(6);

            itemDragged.position = itemHour + ':' + itemMinute + ':' + itemSecond;

            itemsToDispatch.push(itemDragged);

            if (this.state.indexItemToSwap + 1 < this.state.data.length) {
                  let nextItem = this.state.data[this.state.indexItemToSwap + 1];

                  if (itemDragged.position === nextItem.position && nextItem.time === '') {
                        let nextItemHour = nextItem.position.substring(0, 2);
                        let nextItemMinute = nextItem.position.substring(3, 5);
                        let nextItemSecond = nextItem.position.substring(6);
                        let nextItemDate = new Date('1992', '02', '18', nextItemHour, nextItemMinute, nextItemSecond);
                        nextItemDate.setSeconds(nextItemDate.getSeconds() + 1);
                        let formattedDate = moment(nextItemDate).format('HH:mm:ss');
                        itemHour = formattedDate.substring(0, 2);
                        itemMinute = formattedDate.substring(3, 5);
                        itemSecond = formattedDate.substring(6);

                        nextItem.position = itemHour + ':' + itemMinute + ':' + itemSecond;

                        itemsToDispatch.push(nextItem);

                        for (let i = this.state.indexItemToSwap + 1; i < this.state.data.length; i++) {
                              if (
                                    this.state.data[i + 1] &&
                                    // this.state.data[i + 1].id !== this.state.data[indexDragged].id &&
                                    this.state.data[i].position === this.state.data[i + 1].position &&
                                    this.state.data[i + 1].time === ''
                              ) {
                                    let itemHour = this.state.data[i + 1].position.substring(0, 2);
                                    let itemMinute = this.state.data[i + 1].position.substring(3, 5);
                                    let itemSecond = this.state.data[i + 1].position.substring(6);
                                    let itemDate = new Date('1992', '02', '18', itemHour, itemMinute, itemSecond);
                                    itemDate.setSeconds(itemDate.getSeconds() + 1);
                                    let formattedDate = moment(itemDate).format('HH:mm:ss');
                                    itemHour = formattedDate.substring(0, 2);
                                    itemMinute = formattedDate.substring(3, 5);
                                    itemSecond = formattedDate.substring(6);
                                    let item = this.state.data[i + 1];
                                    item.position = itemHour + ':' + itemMinute + ':' + itemSecond;
                                    itemsToDispatch.push(item);
                              }
                        }
                  }
            }

            this.props.editTasksPositionProp(itemsToDispatch);
      };

      sortItems = async ([y]) => {
            if (
                  this.state.dragging &&
                  // CLAMPING
                  this.state.indexItemDragged + Math.trunc((y - 30) / itemHeight) >= 1 &&
                  this.state.indexItemDragged + Math.trunc((y + 30) / itemHeight) < this.state.data.length
            ) {
                  // FORWARD DRAGGING (= from top to bottom)
                  if (
                        y > 30 &&
                        this.state.indexItemDragged + Math.trunc((y + 30) / itemHeight) !== this.state.indexItemToSwap
                  ) {
                        if (
                              this.state.indexItemDragged + Math.trunc((y + 30) / itemHeight) >
                              this.state.indexItemToSwap
                        ) {
                              let data = [...this.state.data];

                              let item = data[this.state.indexItemDragged + Math.trunc((y + 30) / itemHeight) - 1];
                              let itemToSwap = data[this.state.indexItemDragged + Math.trunc((y + 30) / itemHeight)];

                              data.splice(this.state.indexItemDragged + Math.trunc((y + 30) / itemHeight), 1, item);
                              data.splice(
                                    this.state.indexItemDragged + Math.trunc((y + 30) / itemHeight) - 1,
                                    1,
                                    itemToSwap
                              );

                              await this.setState({
                                    indexItemToSwap: this.state.indexItemDragged + Math.trunc((y + 30) / itemHeight),
                                    data: data,
                                    dispatchSort: true
                              });
                        }
                        // Dragging backward from a drag that started forward
                        if (
                              this.state.indexItemDragged + Math.trunc((y + 30) / itemHeight) <
                              this.state.indexItemToSwap
                        ) {
                              let data = [...this.state.data];

                              let item = data[this.state.indexItemDragged + Math.trunc((y + 30) / itemHeight) + 1];
                              let itemToSwap = data[this.state.indexItemDragged + Math.trunc((y + 30) / itemHeight)];

                              data.splice(this.state.indexItemDragged + Math.trunc((y + 30) / itemHeight), 1, item);
                              data.splice(
                                    this.state.indexItemDragged + Math.trunc((y + 30) / itemHeight) + 1,
                                    1,
                                    itemToSwap
                              );

                              await this.setState({
                                    indexItemToSwap: this.state.indexItemDragged + Math.trunc((y + 30) / itemHeight),
                                    data: data,
                                    dispatchSort: true
                              });
                        }
                  }

                  // BACKWARD DRAGGING (= from bottom to top)
                  if (
                        y < -30 &&
                        this.state.indexItemDragged + Math.trunc((y - 30) / itemHeight) !== this.state.indexItemToSwap
                  ) {
                        if (
                              this.state.indexItemDragged + Math.trunc((y - 30) / itemHeight) <
                              this.state.indexItemToSwap
                        ) {
                              let data = [...this.state.data];

                              let item = data[this.state.indexItemDragged + Math.trunc((y - 30) / itemHeight) + 1];
                              let itemToSwap = data[this.state.indexItemDragged + Math.trunc((y - 30) / itemHeight)];

                              data.splice(this.state.indexItemDragged + Math.trunc((y - 30) / itemHeight), 1, item);
                              data.splice(
                                    this.state.indexItemDragged + Math.trunc((y - 30) / itemHeight) + 1,
                                    1,
                                    itemToSwap
                              );

                              await this.setState({
                                    indexItemToSwap: this.state.indexItemDragged + Math.trunc((y - 30) / itemHeight),
                                    data: data,
                                    dispatchSort: true
                              });
                        }

                        // Dragging forward from a drag that started backward
                        if (
                              this.state.indexItemDragged + Math.trunc((y - 30) / itemHeight) >
                              this.state.indexItemToSwap
                        ) {
                              let data = [...this.state.data];

                              let item = data[this.state.indexItemDragged + Math.trunc((y - 30) / itemHeight) - 1];
                              let itemToSwap = data[this.state.indexItemDragged + Math.trunc((y - 30) / itemHeight)];

                              data.splice(this.state.indexItemDragged + Math.trunc((y - 30) / itemHeight), 1, item);
                              data.splice(
                                    this.state.indexItemDragged + Math.trunc((y - 30) / itemHeight) - 1,
                                    1,
                                    itemToSwap
                              );

                              await this.setState({
                                    indexItemToSwap: this.state.indexItemDragged + Math.trunc((y - 30) / itemHeight),
                                    data: data,
                                    dispatchSort: true
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
                              height: itemHeight,
                              opacity: this.state.indexItemToSwap === index ? 0 : this.state.nextItem === index ? 0 : 1
                        }}
                  >
                        <TouchableOpacity
                              onLongPress={() => this.handleLongPress(item, index)}
                              onPress={() => this.handleSimpleTap(item)}
                              onPressOut={e => this.handlePressOut(e)}
                              style={{ flex: 1 }}
                        >
                              {item.type === 'periodCategory' && <Text style={styles.periodCategory}>{item.name}</Text>}
                              {item.type === 'task' && <Task {...item} />}
                              {item.type === 'event' && <Event {...item} />}
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
                              minDist={20}
                        >
                              <Animated.View style={{ zIndex: 1 }}>
                                    <FlatList
                                          // keyboardShouldPersistTaps="always"
                                          ref={ref => (this.flatListRef = ref)}
                                          contentContainerStyle={{
                                                paddingBottom: 300,
                                                marginTop: -30
                                          }}
                                          data={this.state.data}
                                          extraData={this.state.data}
                                          keyExtractor={(item, index) => index.toString()}
                                          renderItem={this.renderItem}
                                          // FIXME:
                                          scrollEnabled={this.state.dragging ? false : true}
                                          // scrollEnabled={
                                          //       Platform.OS === 'android'
                                          //             ? false
                                          //             : this.state.dragging === true
                                          //             ? false
                                          //             : true
                                          // }
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

                        {/* Dagged item */}
                        {/* <PanGestureHandler
                              maxPointers={1}
                              onGestureEvent={this.onGestureEvent}
                              onHandlerStateChange={this.onGestureEvent}
                              minDist={0}
                              // FIXME:
                              enabled={true}
                        > */}
                        <Animated.View
                              style={{
                                    width: width,
                                    height: itemHeight,
                                    backgroundColor: 'white',
                                    position: 'absolute',
                                    top: this.state.dragging
                                          ? this.state.indexItemDragged * itemHeight - this.scrollOffset - 30
                                          : 0,
                                    opacity: this.state.dragging ? 1 : 0,
                                    zIndex: this.state.dragging ? 2 : 0,
                                    transform: [{ translateY: this.transY }],
                                    elevation: 5,
                                    shadowColor: 'black',
                                    shadowOffset: { width: 0, height: 0.5 * 5 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 0.8 * 5
                              }}
                        >
                              {/* <Text>{this.state.dragging && this.state.itemDragged.position}</Text> */}
                              {this.state.dragging && <Task {...this.state.itemDragged} />}
                        </Animated.View>
                        {/* </PanGestureHandler> */}

                        <Animated.Code>
                              {() =>
                                    block([
                                          cond(eq(this.gestureState, State.BEGAN), []),
                                          cond(and(eq(this.gestureState, State.ACTIVE)), [
                                                set(this.transY, this.dragY),
                                                call([this.dragY], this.sortItems),
                                                // call([this.dragY, this.velocityY], this.scrollList),
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
                                    ])
                              }
                        </Animated.Code>
                  </View>
            );
      }
}

function mapStateToProp(state, ownProps) {
      // 1 - Receive today tasks and events
      let tasks = state.tasks ? state.tasks : {};
      let events = state.events ? state.events : {};

      let allItems = [...Object.values(tasks), ...Object.values(events)];

      let morningCategory = { type: 'periodCategory', name: 'Morning ', position: '00:00:00' };
      let afternoonCategory = { type: 'periodCategory', name: 'Afternoon ', position: '12:00:00' };
      let eveningCategory = { type: 'periodCategory', name: 'Evening ', position: '17:00:00' };

      let itemsSelected = [morningCategory, afternoonCategory, eveningCategory];

      let dateSelected = state.general.dateSelectedDateMover;

      // Filter and select all the items needed for that day
      for (let i = 0, len = allItems.length; i < len; i++) {
            if (allItems[i].uid === state.auth.uid) {
                  // Check if the date are similar
                  if (allItems[i].date === dateSelected) {
                        itemsSelected.push(allItems[i]);
                  } else if (allItems[i].repeat !== 'never' && allItems[i].repeat) {
                        // If there are repeated items we need to check if (the day selected is a superior and valid day) of repeated items
                        if (isRepeatedItemsValid(dateSelected, allItems[i])) {
                              // allItems[i].position = -1;
                              // allItems[i].notToUpdate = true;
                              itemsSelected.push(allItems[i]);
                        }
                  }
            }
      }

      itemsSelected.map(item => {
            //  item.position === -1  For backward compatibility with items of previous version
            if (item.position === '' || item.position === -1) {
                  item.position = '23:59:59';
            }
      });

      // Sort by time
      itemsSelected.sort(function(a, b) {
            // FIXME: For backward compatibility
            if (a.position.length > 0 && b.position.length > 0) {
                  let aHour = a.position.substring(0, 2);
                  let aMinute = a.position.substring(3, 5);
                  let aSecond = a.position.substring(6);

                  let bHour = b.position.substring(0, 2);
                  let bMinute = b.position.substring(3, 5);
                  let bSecond = b.position.substring(6);
                  return (
                        new Date('1992', '02', '18', aHour, aMinute, aSecond) -
                        new Date('1992', '02', '18', bHour, bMinute, bSecond)
                  );
            }
      });

      let itemsToDispatch = [];
      let previousItemDate;

      // For every items that don't have time property (tasks)
      // Sort and reset time position to be sure to not create hole
      itemsSelected.map((item, index) => {
            // FIXME: For backward compatibility
            if (item.position.length > 0) {
                  // Get the time of the previous item
                  if (index === 0) {
                        let hour = item.position.substring(0, 2);
                        let minute = item.position.substring(3, 5);
                        let second = item.position.substring(6);
                        previousItemDate = new Date('1992', '02', '18', hour, minute, second);
                  }

                  // If the item as an empty time, it means it's a task without time prop
                  //FIXME: That algorithm can be improved (like by using a timestamp instead of substring decomposition && without moment)
                  if (item.time === '') {
                        let itemHour = item.position.substring(0, 2);
                        let itemMinute = item.position.substring(3, 5);
                        let itemSecond = item.position.substring(6);
                        let itemDate = new Date('1992', '02', '18', itemHour, itemMinute, itemSecond);

                        previousItemDate.setSeconds(previousItemDate.getSeconds() + 1);
                        // If previous item + 1 doesn't equal that item, we increment that item of 1 second
                        if (itemDate.getTime() != previousItemDate.getTime()) {
                              let formattedDate = moment(previousItemDate).format('HH:mm:ss');
                              itemHour = formattedDate.substring(0, 2);
                              itemMinute = formattedDate.substring(3, 5);
                              itemSecond = formattedDate.substring(6);

                              item.position = itemHour + ':' + itemMinute + ':' + itemSecond;

                              itemsToDispatch.push(item);
                        }
                  }

                  if (index !== 0) {
                        let hour = item.position.substring(0, 2);
                        let minute = item.position.substring(3, 5);
                        let second = item.position.substring(6);
                        previousItemDate = new Date('1992', '02', '18', hour, minute, second);
                  }
            }
      });

      // TODO: Modify that code
      // Check if there is no items to sort, to avoid component update
      let areTasksSorted = false;
      if (itemsToDispatch.length === 0) {
            areTasksSorted = true;
      }

      return {
            date: getToday,
            items: itemsSelected,
            itemsToDispatch: itemsToDispatch,
            areTasksSorted: areTasksSorted,
            general: state.general,
            closeDateMoverParentProp: ownProps.closeDateMover
      };
}

export default connect(
      mapStateToProp,
      mapDispatchToProps
)(ItemList);
// export default connect(
//       mapStateToProp,
//       mapDispatchToProps
// )(withNavigationFocus(ItemList));

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: 'white'
      },
      periodCategory: {
            fontWeight: 'bold',
            color: '#FF2D55',
            paddingTop: 40,
            marginLeft: 16
      }
});

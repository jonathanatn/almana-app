// STATIC UI
import React from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Platform, TouchableNativeFeedback, Keyboard } from 'react-native';
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
import { getToday, isRepeatedItemsValid } from '../Utils/helpers';
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
            if (!this.props.areTasksSorted && this.props.itemsToDispatch.length > 0) {
                  // if (!this.props.areTasksSorted) {
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

                  // eventsArray = eventsArray.filter(function(obj) {
                  //       return !obj.notToUpdate;
                  // });

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
            if (
                  item.id === this.props.general.selectedItem.id &&
                  (this.props.general.isEventMenuOpen === true || this.props.general.isTaskMenuOpen === true)
            ) {
                  // if (item.type === 'task') {
                  this.props.closeTaskMenuProp();
                  // } else if (item.type === 'event') {
                  this.props.closeEventMenuProp();
                  // }
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
                              // TODO: import
                              this.props.openTaskMenuProp();
                        }, 100);
                  }

                  // After we open the right menu depending the item, to make the animation
                  // if (item.type !== 'event') {
                  //       this.props.openTaskMenuProp();
                  // } else {
                  //       this.props.openEventMenuProp();
                  // }
                  // Else menu are close so we open the good one
            } else {
                  if (item.type === 'task') {
                        this.props.openTaskMenuProp();
                  } else if (item.type === 'event') {
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
            // Forward dragging (From top to bottom)
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

            // Backward dragging
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
                  let allItems = [...this.props.items];
                  let indexDragged = this.state.indexDragged;
                  let indexToSwap = this.state.indexToSwap;
                  let itemsToDispatch = [];

                  // Means it's forward dragging (Drag from top to bottom)
                  if (this.state.indexDragged < this.state.indexToSwap) {
                        // TODO: If it work, create a helper function
                        // Get the time position of the item to swap with the item dragged
                        let itemToSwapeHour = allItems[indexToSwap].position.substring(0, 2);
                        let itemToSwapeMinute = allItems[indexToSwap].position.substring(3, 5);
                        let itemToSwapeSecond = allItems[indexToSwap].position.substring(6);
                        let itemToSwapeDate = new Date(
                              '1992',
                              '02',
                              '18',
                              itemToSwapeHour,
                              itemToSwapeMinute,
                              itemToSwapeSecond
                        );
                        // Add 1 second
                        itemToSwapeDate.setSeconds(itemToSwapeDate.getSeconds() + 1);
                        // Format the time
                        let formattedDate = moment(itemToSwapeDate).format('HH:mm:ss');
                        itemHour = formattedDate.substring(0, 2);
                        itemMinute = formattedDate.substring(3, 5);
                        itemSecond = formattedDate.substring(6);
                        // Set new position
                        allItems[indexDragged].position = itemHour + ':' + itemMinute + ':' + itemSecond;
                        // Add to item to dispatch
                        itemsToDispatch.push(allItems[indexDragged]);

                        // Check for conflict position with next items
                        if (
                              allItems[indexToSwap + 1] &&
                              allItems[indexDragged].position === allItems[indexToSwap + 1].position &&
                              allItems[indexToSwap + 1].time === ''
                        ) {
                              let itemHour = allItems[indexToSwap + 1].position.substring(0, 2);
                              let itemMinute = allItems[indexToSwap + 1].position.substring(3, 5);
                              let itemSecond = allItems[indexToSwap + 1].position.substring(6);
                              let itemDate = new Date('1992', '02', '18', itemHour, itemMinute, itemSecond);
                              itemDate.setSeconds(itemDate.getSeconds() + 1);
                              let formattedDate = moment(itemDate).format('HH:mm:ss');
                              itemHour = formattedDate.substring(0, 2);
                              itemMinute = formattedDate.substring(3, 5);
                              itemSecond = formattedDate.substring(6);
                              allItems[indexToSwap + 1].position = itemHour + ':' + itemMinute + ':' + itemSecond;
                              // Add to item to dispatch
                              itemsToDispatch.push(allItems[indexToSwap + 1]);

                              for (let i = indexToSwap + 1; i < allItems.length; i++) {
                                    if (
                                          allItems[i + 1] &&
                                          allItems[i].position === allItems[i + 1].position &&
                                          allItems[i + 1].time === ''
                                    ) {
                                          let itemHour = allItems[i + 1].position.substring(0, 2);
                                          let itemMinute = allItems[i + 1].position.substring(3, 5);
                                          let itemSecond = allItems[i + 1].position.substring(6);
                                          let itemDate = new Date('1992', '02', '18', itemHour, itemMinute, itemSecond);
                                          itemDate.setSeconds(itemDate.getSeconds() + 1);
                                          let formattedDate = moment(itemDate).format('HH:mm:ss');
                                          itemHour = formattedDate.substring(0, 2);
                                          itemMinute = formattedDate.substring(3, 5);
                                          itemSecond = formattedDate.substring(6);
                                          allItems[i + 1].position = itemHour + ':' + itemMinute + ':' + itemSecond;
                                          // Add to item to dispatch
                                          itemsToDispatch.push(i + 1);
                                    }
                              }
                        }
                  }
                  // End of forward dragging

                  // Backward dragging sort
                  if (this.state.indexDragged > this.state.indexToSwap && this.state.indexToSwap > 0) {
                        // TODO: If it work, create a helper function
                        // Get the time position of the item to swap with the item dragged
                        let itemToSwapeHour = allItems[indexToSwap - 1].position.substring(0, 2);
                        let itemToSwapeMinute = allItems[indexToSwap - 1].position.substring(3, 5);
                        let itemToSwapeSecond = allItems[indexToSwap - 1].position.substring(6);
                        let itemToSwapeDate = new Date(
                              '1992',
                              '02',
                              '18',
                              itemToSwapeHour,
                              itemToSwapeMinute,
                              itemToSwapeSecond
                        );
                        // Add 1 second
                        itemToSwapeDate.setSeconds(itemToSwapeDate.getSeconds() + 1);
                        // Format the time
                        let formattedDate = moment(itemToSwapeDate).format('HH:mm:ss');
                        itemHour = formattedDate.substring(0, 2);
                        itemMinute = formattedDate.substring(3, 5);
                        itemSecond = formattedDate.substring(6);
                        // Set new position
                        allItems[indexDragged].position = itemHour + ':' + itemMinute + ':' + itemSecond;
                        // Add to item to dispatch
                        itemsToDispatch.push(allItems[indexDragged]);

                        // Check for conflict position with next items
                        if (
                              allItems[indexDragged].position === allItems[indexToSwap].position &&
                              allItems[indexToSwap].time === ''
                        ) {
                              let itemHour = allItems[indexToSwap].position.substring(0, 2);
                              let itemMinute = allItems[indexToSwap].position.substring(3, 5);
                              let itemSecond = allItems[indexToSwap].position.substring(6);
                              let itemDate = new Date('1992', '02', '18', itemHour, itemMinute, itemSecond);
                              itemDate.setSeconds(itemDate.getSeconds() + 1);
                              let formattedDate = moment(itemDate).format('HH:mm:ss');
                              itemHour = formattedDate.substring(0, 2);
                              itemMinute = formattedDate.substring(3, 5);
                              itemSecond = formattedDate.substring(6);
                              allItems[indexToSwap].position = itemHour + ':' + itemMinute + ':' + itemSecond;
                              // Add to item to dispatch
                              itemsToDispatch.push(allItems[indexToSwap]);

                              for (let i = indexToSwap; i < allItems.length; i++) {
                                    if (
                                          allItems[i + 1] &&
                                          allItems[i + 1].id !== allItems[indexDragged].id &&
                                          allItems[i].position === allItems[i + 1].position &&
                                          allItems[i + 1].time === ''
                                    ) {
                                          let itemHour = allItems[i + 1].position.substring(0, 2);
                                          let itemMinute = allItems[i + 1].position.substring(3, 5);
                                          let itemSecond = allItems[i + 1].position.substring(6);
                                          let itemDate = new Date('1992', '02', '18', itemHour, itemMinute, itemSecond);
                                          itemDate.setSeconds(itemDate.getSeconds() + 1);
                                          let formattedDate = moment(itemDate).format('HH:mm:ss');
                                          itemHour = formattedDate.substring(0, 2);
                                          itemMinute = formattedDate.substring(3, 5);
                                          itemSecond = formattedDate.substring(6);
                                          allItems[i + 1].position = itemHour + ':' + itemMinute + ':' + itemSecond;
                                          // Add to item to dispatch
                                          itemsToDispatch.push(i + 1);
                                    }
                              }
                        }
                  }
                  // End of backward dragging

                  this.props.editTasksPositionProp(itemsToDispatch);
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
                                    <Task {...this.props.items[this.state.indexDragged]} />
                              )}
                        </Animated.View>

                        <View style={{ zIndex: 0, opacity: 1, height: height }}>
                              <FlatList
                                    keyboardShouldPersistTaps="always"
                                    ref={ref => (this.flatListRef = ref)}
                                    contentContainerStyle={{ paddingBottom: 300, marginTop: -30 }}
                                    data={this.props.items}
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
                                    data={this.props.items}
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

      let morningCategory = { type: 'periodCategory', name: 'Morning ', position: '00:00:00' };
      let afternoonCategory = { type: 'periodCategory', name: 'Afternoon ', position: '12:00:00' };
      let eveningCategory = { type: 'periodCategory', name: 'Evening ', position: '17:00:00' };

      let itemsSelected = [
            morningCategory,
            afternoonCategory,
            eveningCategory
            // { type: 'periodCategory', name: 'position empty ', position: '17:00:04', time: '' },
            // { type: 'periodCategory', name: 'a Test morning ', position: '00:00:01', time: '' },
            // { type: 'periodCategory', name: 'position -1 ', position: '17:00:03', time: '' },
            // { type: 'periodCategory', name: 'b Test afternoon', position: '12:00:01', time: '' },
            // { type: 'periodCategory', name: 'c Test evening ', position: '17:00:01', time: '' },
            // { type: 'periodCategory', name: 'position -1 B', position: '17:00:02', time: '' }
      ];

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

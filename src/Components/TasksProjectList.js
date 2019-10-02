// STATIC UI
import React from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity, FlatList } from 'react-native';
import { Platform, TouchableNativeFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MoreMenu from './Elements/Items/MoreMenu';
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
import { editPositionTasksCategoryAction } from '../Store/actions/projectAction';
import { editProjectPositionTasksAction } from '../Store/actions/taskAction';
import { setSelectedItemAction, openTaskMenuAction, closeTaskMenuAction } from '../Store/actions/generalAction';
import { closeTaskAdderAction } from '../Store/actions/generalAction';
function mapDispatchToProps(dispatch) {
      return {
            // TASKS
            editProjectPositionTasksProp: tasks => dispatch(editProjectPositionTasksAction(tasks)),
            // PROJECTS
            editPositionTasksCategoryProp: tasks => dispatch(editPositionTasksCategoryAction(tasks)),

            // GENERAL
            openTaskMenuProp: () => dispatch(openTaskMenuAction()),
            closeTaskMenuProp: () => dispatch(closeTaskMenuAction()),
            closeTaskAdderProp: () => dispatch(closeTaskAdderAction()),
            setSelectedItemProp: item => dispatch(setSelectedItemAction(item))
      };
}

// HELPERS
const { width, height } = Dimensions.get('window');

class TasksProjectList extends React.Component {
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

            this.isItemHidden = new Value(0);

            this.scrollOffset = 0;
            this.scrollOffsetForDrag = 0;
      }

      state = {
            dragging: false,
            indexDragged: '',
            indexToSwap: '',
            displayDraggedItem: false
      };

      componentDidUpdate() {
            let tasksToEdit = [];
            let tasksCategoryToEdit = [];

            if (this.props.itemsToEditProjectPosition.length !== 0) {
                  this.props.itemsToEditProjectPosition.map(item => {
                        if (item.type === 'task') {
                              tasksToEdit.push(item);
                        } else if (item.type === 'tasksCategory') {
                              tasksCategoryToEdit.push(item);
                        }
                  });

                  if (tasksToEdit.length > 0) {
                        this.props.editProjectPositionTasksProp(tasksToEdit);
                  }
                  if (tasksCategoryToEdit.length > 0) {
                        this.props.editPositionTasksCategoryProp(tasksCategoryToEdit);
                  }
            }
      }

      handleItemClick = async item => {
            if (item.type !== 'task') {
                  return;
            }
            if (item.id === this.props.general.selectedItem.id && this.props.general.isTaskMenuOpen === true) {
                  this.props.closeTaskMenuProp();
                  return;
            }
            this.props.setSelectedItemProp(item);

            if (this.props.general.isTaskAdderOpen === true) {
                  this.props.closeTaskAdderProp();
            }

            if (this.props.general.isTaskMenuOpen === true) {
                  // If one of the item menu is open, we close it
                  this.props.closeTaskMenuProp();
                  setTimeout(() => {
                        this.props.openTaskMenuProp();
                  }, 100);
            } else {
                  this.props.openTaskMenuProp();
            }
      };

      handlerLongClick = (index, item) => {
            this.setState({
                  dragging: true,
                  indexDragged: index,
                  displayDraggedItem: true
            });
      };

      // State.END doesn't fire normally on iOS if you don't move the PanGesture, this is a hack:
      handlePressOut = e => {
            if (
                  Platform.OS === 'ios' &&
                  e.touchHistory.touchBank[1].currentPageY > e.touchHistory.touchBank[1].startPageY - 10 &&
                  e.touchHistory.touchBank[1].currentPageY < e.touchHistory.touchBank[1].startPageY + 10
            ) {
                  this.gestureState.setValue(3);
            }
      };

      reset = () => {
            this.setState({
                  dragging: false,
                  indexDragged: '',
                  indexToSwap: '',
                  displayDraggedItem: false
            });
            setTimeout(() => {
                  this.flatListRef.setNativeProps({
                        opacity: 1
                  });
                  this.flatListRef2.setNativeProps({
                        opacity: 0
                  });
            }, 300);
            this.transY.setValue(0);
            this.dragY.setValue(0);
            this.gestureState.setValue(0);
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
            this.draggedItemRef.setNativeProps({
                  opacity: 0
            });
            let itemsToEditPosition = [];
            if (this.state.dragging === true && this.props.items.length > 1) {
                  let items = [...this.props.items];

                  // Forward dragging (From top to bottom)
                  if (this.state.indexDragged < this.state.indexToSwap) {
                        // If we drag more than we have item, we give the item the last position
                        if (this.state.indexToSwap >= items.length) {
                              itemsToEditPosition.push(items[this.state.indexDragged]);
                              itemsToEditPosition[0].project.position = items[items.length - 1].project.position;
                        } else {
                              itemsToEditPosition.push(items[this.state.indexDragged]);
                              itemsToEditPosition[0].project.position = this.state.indexToSwap;
                        }

                        items.map((item, index) => {
                              if (index <= this.state.indexToSwap && index > this.state.indexDragged) {
                                    item.project.position--;
                                    itemsToEditPosition.push(item);
                              }
                        });
                  }

                  // Backward dragging
                  if (this.state.indexDragged > this.state.indexToSwap && this.state.indexToSwap >= 0) {
                        itemsToEditPosition.push(items[this.state.indexDragged]);
                        itemsToEditPosition[0].project.position = this.state.indexToSwap;

                        items.map((item, index) => {
                              if (index >= this.state.indexToSwap && index < this.state.indexDragged) {
                                    item.project.position++;
                                    itemsToEditPosition.push(item);
                              }
                        });
                  }
            }

            let tasksToEdit = [];
            let tasksCategoryToEdit = [];

            if (itemsToEditPosition.length > 0) {
                  itemsToEditPosition.map(item => {
                        if (item.type === 'task') {
                              tasksToEdit.push(item);
                        } else if (item.type === 'tasksCategory') {
                              tasksCategoryToEdit.push(item);
                        }
                  });
            }

            if (tasksToEdit.length > 0) {
                  this.props.editProjectPositionTasksProp(tasksToEdit);
            }
            if (tasksCategoryToEdit.length > 0) {
                  this.props.editPositionTasksCategoryProp(tasksToEdit);
            }
            this.flatListRef.setNativeProps({
                  opacity: 0
            });
            this.flatListRef2.setNativeProps({
                  opacity: 1
            });
      };

      renderItem2 = ({ item, index }) => {
            return (
                  <Animated.View style={[styles.box]} key={index}>
                        {item.type === 'tasksCategory' && (
                              <View style={{ flexDirection: 'row', paddingTop: 40, paddingLeft: 16, paddingRight: 36 }}>
                                    <Text
                                          style={{
                                                flex: 1,
                                                fontWeight: 'bold',
                                                color: 'blue'
                                          }}
                                    >
                                          {item.name}
                                    </Text>
                                    <Ionicons name="ios-more" size={24} color={'black'} />
                              </View>
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
                        minDist={10}
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
                                    onPressOut={e => this.handlePressOut(e)}
                                    activeOpacity={0.5}
                                    style={{ flex: 1 }}
                              >
                                    {item.type === 'tasksCategory' && (
                                          <View
                                                style={{
                                                      flexDirection: 'row',
                                                      paddingTop: 40,
                                                      paddingLeft: 16,
                                                      paddingRight: 36
                                                }}
                                          >
                                                <Text
                                                      style={{
                                                            flex: 1,
                                                            fontWeight: 'bold',
                                                            color: 'blue'
                                                      }}
                                                >
                                                      {item.name}
                                                </Text>
                                                <MoreMenu item={item} />
                                          </View>
                                    )}
                                    {item.type === 'task' && <Task {...item} />}
                              </TouchableOpacity>
                        </Animated.View>
                  </PanGestureHandler>
            );
      };

      scrollOnDrag = ([absoluteY]) => {
            if (this.state.dragging && absoluteY > height - 50) {
                  this.flatListRef.scrollToOffset({
                        offset: this.scrollOffsetForDrag + 30,
                        animated: true
                  });
            }

            if (this.state.dragging && absoluteY < 50) {
                  this.flatListRef.scrollToOffset({
                        offset: this.scrollOffsetForDrag - 30,
                        animated: true
                  });
            }
      };

      render() {
            return (
                  <View style={styles.container}>
                        {/* // https://github.com/kmagiera/react-native-gesture-handler/issues/732
                        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                        /////////////// State.BEGAN fire on a simple touche and State.ACTIVE fire when we start to drag on Android  ///////////////
                        /////////////// but on iOS it's different State.BEGAN fire when we start to drag and State.ACTIVE follow.         ///////////////
                        /////////////// It become obvious when you use minDist with a big number on the PanGestureHandler.           ///////////////
                        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

                        <Animated.Code>
                              {() =>
                                    block([
                                          cond(eq(this.gestureState, State.BEGAN), []),
                                          cond(eq(this.gestureState, State.ACTIVE), [
                                                // set(this.isItemHidden, 0),
                                                call([this.dragY], this.sortCalculation),
                                                set(this.transY, this.addY)
                                          ]),
                                          cond(
                                                and(
                                                      eq(this.gestureState, State.END),
                                                      or(greaterThan(this.dragY, 50), lessThan(this.dragY, -50))
                                                ),
                                                [
                                                      call([], this.sort),
                                                      call([], this.reset)
                                                      // set(this.isItemHidden, 1)
                                                ]
                                          ),
                                          // Managed handlePressOut on iOS due to a PanGesture bug
                                          cond(eq(this.gestureState, State.END), [call([], this.reset)]),
                                          cond(eq(this.gestureState, State.FAILED), [call([], this.reset)]),
                                          cond(eq(this.gestureState, State.CANCELLED), [call([], this.reset)]),
                                          cond(
                                                greaterThan(this.dragY, 50),
                                                set(this.transYB, -70),
                                                set(this.transYB, 0)
                                          ),
                                          cond(lessThan(this.dragY, -50), set(this.transYC, 70), set(this.transYC, 0))
                                    ])
                              }
                        </Animated.Code>
                        <Animated.View
                              ref={ref => (this.draggedItemRef = ref)}
                              style={[
                                    styles.box,
                                    {
                                          position: 'absolute',
                                          top: this.state.indexDragged * 70 + 0 - this.scrollOffset,
                                          transform: [{ translateY: this.transY }],
                                          zIndex: this.state.dragging ? 1 : -1,
                                          // Necessary hack for iOS
                                          opacity: this.state.displayDraggedItem ? 1 : 0
                                          // elevation: 5,
                                          // shadowColor: 'black',
                                          // shadowOffset: { width: 0, height: 0.5 * 5 },
                                          // shadowOpacity: 0.3,
                                          // shadowRadius: 0.8 * 5
                                          // backgroundColor: 'blue'
                                    }
                              ]}
                        >
                              {this.state.indexDragged !== '' &&
                              this.props.items[this.state.indexDragged].type === 'tasksCategory' ? (
                                    <View
                                          style={{
                                                flexDirection: 'row',
                                                paddingTop: 40,
                                                paddingLeft: 16,
                                                paddingRight: 36
                                          }}
                                    >
                                          <Text
                                                style={{
                                                      flex: 1,
                                                      fontWeight: 'bold',
                                                      color: 'blue'
                                                }}
                                          >
                                                {this.props.items[this.state.indexDragged].name}
                                          </Text>
                                          <Ionicons name="ios-more" size={24} color={'black'} />
                                    </View>
                              ) : null}
                              {this.state.indexDragged !== '' &&
                              this.props.items[this.state.indexDragged].type === 'task' ? (
                                    <Task {...this.props.items[this.state.indexDragged]} />
                              ) : null}
                        </Animated.View>

                        <View style={{ zIndex: 0, opacity: 1, height: height }}>
                              <FlatList
                                    keyboardShouldPersistTaps="always"
                                    ref={ref => (this.flatListRef = ref)}
                                    contentContainerStyle={{ paddingBottom: 300 }}
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
                                    contentContainerStyle={{ paddingBottom: 300 }}
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
      let projectHeadline = state.projects ? state.projects : {};

      let projectId = ownProps.navigation.state.params.id;

      let allItems = [...Object.values(tasks), ...Object.values(projectHeadline)];
      let userItems = [];

      for (let i = 0, len = allItems.length; i < len; i++) {
            if (
                  (allItems[i].uid === state.auth.uid &&
                        (allItems[i].project && allItems[i].project.id === projectId)) ||
                  (allItems[i].type &&
                        allItems[i].project &&
                        allItems[i].type === 'tasksCategory' &&
                        allItems[i].project.id === projectId)
            ) {
                  userItems.push(allItems[i]);
            }
      }

      userItems = [...userItems];

      let itemsToEditProjectPosition = [];

      if (userItems.length > 0) {
            userItems.sort(function(a, b) {
                  return a.project.position - b.project.position;
            });

            userItems.map((item, index) => {
                  if (item.project.position !== index) {
                        item.project.position = index;
                        itemsToEditProjectPosition.push(item);
                  }
            });
      }

      let areItemsSorted = false;
      if (itemsToEditProjectPosition.length === 0) {
            areItemsSorted = true;
      }

      return {
            items: userItems,
            itemsToEditProjectPosition: itemsToEditProjectPosition,
            areItemsSorted: areItemsSorted,
            general: state.general
      };
}

export default compose(
      connect(
            mapStateToProp,
            mapDispatchToProps
      )
      // firestoreConnect([{ collection: 'tasks' }])
)(TasksProjectList);

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

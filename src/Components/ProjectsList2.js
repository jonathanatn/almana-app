// STATIC UI
import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, Alert, BackHandler } from 'react-native';
import { Platform, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MoreMenu from './Elements/Items/MoreMenu';

// ANIMATED UI
import Animated from 'react-native-reanimated';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
const { cond, eq, add, call, set, Value, event, block, and, greaterThan, lessThan, clockRunning } = Animated;
const { diff, or, debug, startClock, lessOrEq, greaterOrEq, defined, Clock, stopClock, spring } = Animated;

// DATA
import { connect } from 'react-redux';
import { editPositionProjectsAction } from '../Store/actions/projectAction';
function mapDispatchToProps(dispatch) {
      return {
            editPositionProjectsProp: projects => dispatch(editPositionProjectsAction(projects))
      };
}

// HELPERS
const { width, height } = Dimensions.get('window');

const itemHeight = 65;

class TasksProjectList extends Component {
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

      // shouldComponentUpdate(nextProps, nextState) {
      //       return nextProps.items != nextState.data;
      // }

      componentDidMount() {
            this.setState({
                  data: this.props.items
            });

            let itemsToDispatch = [];

            this.state.data.map((item, index) => {
                  if (item.position !== index) {
                        item.position = index;
                        itemsToDispatch.push(item);
                  }
            });

            if (itemsToDispatch.length > 0) {
                  this.props.editPositionProjectsProp(itemsToDispatch);
            }
      }

      componentDidUpdate(prevProps) {
            if (this.props.items !== prevProps.items) {
                  this.setState({
                        data: this.props.items
                  });

                  let itemsToDispatch = [];

                  this.state.data.map((item, index) => {
                        if (item.position !== index) {
                              item.position = index;
                              itemsToDispatch.push(item);
                        }
                  });

                  if (itemsToDispatch.length > 0) {
                        this.props.editPositionProjectsProp(itemsToDispatch);
                  }
            }
      }

      handleSimpleTap = item => {
            if (item.type === 'projectsCategory') {
                  return;
            }
            if (item.type === 'project') {
                  this.props.navigation.navigate('TasksProjectScreen', item);
            }
            // if (item.id === this.props.general.selectedItem.id && this.props.general.isTaskMenuOpen === true) {
            //       this.props.closeTaskMenuProp();
            //       return;
            // }
            // this.props.setSelectedItemProp(item);

            // if (this.props.general.isTaskAdderOpen === true) {
            //       this.props.closeTaskAdderProp();
            // }

            // if (this.props.general.isTaskMenuOpen === true) {
            //       // If one of the item menu is open, we close it
            //       this.props.closeTaskMenuProp();
            //       setTimeout(() => {
            //             this.props.openTaskMenuProp();
            //       }, 100);
            // } else {
            //       this.props.openTaskMenuProp();
            // }
      };

      handleLongPress = (item, index) => {
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
            if (
                  Platform.OS === 'android' &&
                  e.touchHistory.touchBank[0].currentPageY > e.touchHistory.touchBank[0].startPageY - 10 &&
                  e.touchHistory.touchBank[0].currentPageY < e.touchHistory.touchBank[0].startPageY + 10
            ) {
                  this.gestureState.setValue(5);
            }
      };

      reset = () => {
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
            let itemsToDispatch = [];

            this.state.data.map((item, index) => {
                  if (item.position !== index) {
                        item.position = index;
                        itemsToDispatch.push(item);
                  }
            });

            if (itemsToDispatch.length > 0) {
                  this.props.editPositionProjectsProp(itemsToDispatch);
            }
      };

      sortItems = async ([y]) => {
            if (
                  this.state.dragging &&
                  // CLAMPING
                  this.state.indexItemDragged + Math.trunc((y - 30) / itemHeight) >= 0 &&
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
                              {item.type === 'projectsCategory' && (
                                    <View style={styles.projectsCategory}>
                                          <Text style={styles.projectsCategoryText}>{item.name}</Text>
                                          <MoreMenu item={item} />
                                    </View>
                              )}
                              {item.type === 'project' && (
                                    <View style={styles.project}>
                                          <Text style={styles.projectText}>{item.name}</Text>
                                    </View>
                              )}
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
                                    {this.state.data.length === 0 && (
                                          <Text
                                                style={{
                                                      textAlign: 'center',
                                                      alignSelf: 'center',
                                                      position: 'absolute',
                                                      top: height / 2 - 140
                                                }}
                                          >
                                                Tap on the '+' button to add your first project.
                                          </Text>
                                    )}
                                    <FlatList
                                          // keyboardShouldPersistTaps="always"
                                          ref={ref => (this.flatListRef = ref)}
                                          contentContainerStyle={{
                                                paddingBottom: 300
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

                        <Animated.View
                              style={{
                                    width: width,
                                    height: itemHeight,
                                    position: 'absolute',
                                    top: this.state.dragging
                                          ? this.state.indexItemDragged * itemHeight - this.scrollOffset
                                          : 0,
                                    opacity: this.state.dragging ? 1 : 0,
                                    zIndex: this.state.dragging ? 2 : 0,
                                    transform: [{ translateY: this.transY }]
                              }}
                        >
                              {this.state.dragging && this.state.itemDragged.type === 'projectsCategory' ? (
                                    <View style={styles.projectsCategory}>
                                          <Text
                                                style={[
                                                      styles.projectsCategoryText,
                                                      {
                                                            textShadowColor: 'grey',
                                                            textShadowOffset: { width: 1, height: 1 },
                                                            textShadowRadius: 2
                                                      }
                                                ]}
                                          >
                                                {this.state.itemDragged.name}
                                          </Text>
                                    </View>
                              ) : null}
                              {this.state.dragging && this.state.itemDragged.type === 'project' ? (
                                    <View style={styles.project}>
                                          <Text style={styles.projectText}>{this.state.itemDragged.name}</Text>
                                    </View>
                              ) : null}
                        </Animated.View>

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
      let projects = state.projects ? state.projects : {};

      let allItems = [...Object.values(projects)];
      let userItems = [];

      for (let i = 0, len = allItems.length; i < len; i++) {
            if (
                  allItems[i].uid === state.auth.uid &&
                  (allItems[i].type === 'projectsCategory' || allItems[i].type === 'project')
            ) {
                  userItems.push(allItems[i]);
            }
      }

      userItems = [...userItems];

      let itemsToEditPosition = [];

      userItems.map(item => {
            if (item.position === -1) {
                  item.position = userItems.length;
            }
      });

      if (userItems.length > 0) {
            userItems.sort(function(a, b) {
                  return a.position - b.position;
            });

            userItems.map((item, index) => {
                  if (item.position !== index) {
                        item.position = index;
                        itemsToEditPosition.push(item);
                  }
            });
      }

      let areItemsSorted = false;
      if (itemsToEditPosition.length === 0) {
            areItemsSorted = true;
      }

      return {
            items: userItems,
            itemsToDispatch: itemsToEditPosition,
            areItemsSorted: areItemsSorted,
            general: state.general
      };
}

export default connect(
      mapStateToProp,
      mapDispatchToProps
)(TasksProjectList);

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: 'white'
      },
      projectsCategory: {
            height: 65,
            flexDirection: 'row',
            paddingTop: 40,
            paddingLeft: 16,
            paddingRight: 36
      },
      projectsCategoryText: {
            flex: 1,
            fontWeight: 'bold',
            color: 'blue'
      },
      project: {
            height: 60,
            marginHorizontal: 8,
            paddingHorizontal: 16,
            paddingTop: 16,
            backgroundColor: 'rgba(245, 245, 245, 1.0)',
            borderRadius: 8
      },
      projectText: {
            fontSize: 17
      }
});

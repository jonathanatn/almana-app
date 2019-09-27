// STATIC UI
import React from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity, FlatList } from 'react-native';
import { Platform, TouchableNativeFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MoreMenu from './Elements/Items/MoreMenu';

// ANIMATED UI
import Animated from 'react-native-reanimated';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
const { cond, eq, add, call, set, Value, event, block, and, greaterThan, lessThan } = Animated;
const { diff, or, debug, startClock, lessOrEq, greaterOrEq } = Animated;

// DATA
import { firestoreConnect } from 'react-redux-firebase';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { editPositionProjectsAction } from '../Store/actions/projectAction';
function mapDispatchToProps(dispatch) {
      return {
            editPositionProjectsProp: projects => dispatch(editPositionProjectsAction(projects))
      };
}

// HELPERS
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
            // console.log('items: ', this.props.itemsToEditPosition);
            if (this.props.itemsToEditPosition.length !== 0) {
                  this.props.editPositionProjectsProp(this.props.itemsToEditPosition);
            }
      }

      handleItemClick = async item => {
            if (item.type === 'project') {
                  this.props.navigation.navigate('TasksProjectScreen', item);
                  // this.props.navigation.navigate('TasksProjectScreen');
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
            this.transY.setValue(0);
            this.dragY.setValue(0);
            this.gestureState.setValue(0);
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
            let itemsToEditPosition = [];
            if (this.state.dragging === true && this.props.items.length > 1) {
                  let items = [...this.props.items];

                  // Forward dragging (From top to bottom)
                  if (this.state.indexDragged < this.state.indexToSwap) {
                        // If we drag more than we have item, we give the item the last position
                        if (this.state.indexToSwap >= items.length) {
                              itemsToEditPosition.push(items[this.state.indexDragged]);
                              itemsToEditPosition[0].position = items[items.length - 1].position;
                        } else {
                              itemsToEditPosition.push(items[this.state.indexDragged]);
                              itemsToEditPosition[0].position = this.state.indexToSwap;
                        }

                        items.map((item, index) => {
                              if (index <= this.state.indexToSwap && index > this.state.indexDragged) {
                                    item.position--;
                                    itemsToEditPosition.push(item);
                              }
                        });
                  }

                  // Backward dragging
                  if (this.state.indexDragged > this.state.indexToSwap && this.state.indexToSwap >= 0) {
                        itemsToEditPosition.push(items[this.state.indexDragged]);
                        itemsToEditPosition[0].position = this.state.indexToSwap;

                        items.map((item, index) => {
                              if (index >= this.state.indexToSwap && index < this.state.indexDragged) {
                                    item.position++;
                                    itemsToEditPosition.push(item);
                              }
                        });
                  }
            }

            if (itemsToEditPosition.length > 0) {
                  this.props.editPositionProjectsProp(itemsToEditPosition);
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
                        {item.type === 'projectsCategory' && (
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
                        {item.type === 'project' && (
                              <View
                                    style={{
                                          height: 65,
                                          marginHorizontal: 8,
                                          paddingHorizontal: 16,
                                          paddingTop: 16,
                                          backgroundColor: 'rgba(245, 245, 245, 1.0)',
                                          borderRadius: 8
                                    }}
                              >
                                    <Text
                                          style={{
                                                fontSize: 17
                                          }}
                                    >
                                          {item.name}
                                    </Text>
                              </View>
                        )}
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
                        // enabled={false}
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
                                    {item.type === 'projectsCategory' && (
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
                                    {item.type === 'project' && (
                                          <View
                                                style={{
                                                      height: 65,
                                                      marginHorizontal: 8,
                                                      paddingHorizontal: 16,
                                                      paddingTop: 16,
                                                      backgroundColor: 'rgba(245, 245, 245, 1.0)',
                                                      borderRadius: 8
                                                }}
                                          >
                                                <Text
                                                      style={{
                                                            fontSize: 17
                                                      }}
                                                >
                                                      {item.name}
                                                </Text>
                                          </View>
                                    )}
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
                              this.props.items[this.state.indexDragged].type === 'projectsCategory' ? (
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
                              this.props.items[this.state.indexDragged].type === 'project' ? (
                                    <View
                                          style={{
                                                height: 65,
                                                marginHorizontal: 8,
                                                paddingHorizontal: 16,
                                                paddingTop: 16,
                                                backgroundColor: 'rgba(245, 245, 245, 1.0)',
                                                borderRadius: 8,
                                                elevation: 5,
                                                shadowColor: 'black',
                                                shadowOffset: { width: 0, height: 0.5 * 5 },
                                                shadowOpacity: 0.3,
                                                shadowRadius: 0.8 * 5
                                          }}
                                    >
                                          <Text
                                                style={{
                                                      fontSize: 17
                                                }}
                                          >
                                                {this.props.items[this.state.indexDragged].name}
                                          </Text>
                                    </View>
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

      // console.log(userItems);

      return {
            items: userItems,
            itemsToEditPosition: itemsToEditPosition,
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

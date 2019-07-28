// TODO:
// - Create a special function for the back button, don't use a toggle animation because it involve more than just animated the calendar menu (like going back to home)
// - If the month contains 6weeks make the calendar height bigger
// - When I go to another month and after I go back to my day on scrolling on it, my calendar come back to that date

import React, { Component, PureComponent } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';

const { width, height } = Dimensions.get('window');

export default class ViewToTestMenuOpening extends PureComponent {
      state = {
            isDateMoverOpen: false,
            isItemAdderOpen: false,
            isItemMenuOpen: false,
            isOnType: '',
            yValueDateMover: new Animated.Value(-calendarMenuHeight),
            yValueItemAdder: new Animated.Value(-calendarMenuHeight),
            yValueItemMenu: new Animated.Value(-calendarMenuHeight),
            // selectedDay: 0,
            // selectedMonth: 0,
            visibleMonth: 0,
            formattedDate: 0
      };
      //
      toggleDateMover = () => {
            console.log(this.state.isDateMoverOpen);
            if (this.state.isDateMoverOpen === false) {
                  if (this.state.isItemAdderOpen === false && this.state.isItemMenuOpen === false) {
                        Animated.timing(this.state.yValueDateMover, {
                              toValue: 0,
                              duration: 100
                        }).start();
                        this.setState({
                              isDateMoverOpen: true
                        });
                  } else {
                        Animated.sequence([
                              Animated.timing(this.state.yValueItemAdder, {
                                    toValue: -calendarMenuHeight,
                                    duration: 100
                              }),
                              Animated.timing(this.state.yValueItemMenu, {
                                    toValue: -calendarMenuHeight,
                                    duration: 100
                              }),
                              Animated.timing(this.state.yValueDateMover, {
                                    toValue: 0,
                                    duration: 100
                              })
                        ]).start();

                        this.setState({
                              isItemAdderOpen: false,
                              isItemMenuOpen: false,
                              isDateMoverOpen: true
                        });
                  }
            } else {
                  Animated.timing(this.state.yValueDateMover, {
                        toValue: -calendarMenuHeight,
                        duration: 100
                  }).start();
                  this.setState({
                        isDateMoverOpen: false
                  });
            }
      };

      toggleItemAdder = () => {
            if (this.state.isItemAdderOpen === false) {
                  if (this.state.isDateMoverOpen === false && this.state.isItemMenuOpen === false) {
                        Animated.timing(this.state.yValueItemAdder, {
                              toValue: 0,
                              duration: 100
                        }).start();
                        this.setState({
                              isItemAdderOpen: true
                        });
                  } else {
                        Animated.sequence([
                              Animated.timing(this.state.yValueDateMover, {
                                    toValue: -calendarMenuHeight,
                                    duration: 100
                              }),
                              Animated.timing(this.state.yValueItemMenu, {
                                    toValue: -calendarMenuHeight,
                                    duration: 100
                              }),
                              Animated.timing(this.state.yValueItemAdder, {
                                    toValue: 0,
                                    duration: 100
                              })
                        ]).start();

                        this.setState({
                              isDateMoverOpen: false,
                              isItemMenuOpen: false,
                              isItemAdderOpen: true
                        });
                  }
            } else {
                  Animated.timing(this.state.yValueItemAdder, {
                        toValue: -calendarMenuHeight,
                        duration: 100
                  }).start();
                  this.setState({
                        isItemAdderOpen: false
                  });
            }
      };

      toggleItemMenu = () => {
            if (this.state.isItemMenuOpen === false) {
                  if (this.state.isDateMoverOpen === false && this.state.isItemAdderOpen === false) {
                        Animated.timing(this.state.yValueItemMenu, {
                              toValue: 0,
                              duration: 100
                        }).start();
                        this.setState({
                              isItemMenuOpen: true
                        });
                  } else {
                        Animated.sequence([
                              Animated.timing(this.state.yValueDateMover, {
                                    toValue: -calendarMenuHeight,
                                    duration: 100
                              }),
                              Animated.timing(this.state.yValueItemAdder, {
                                    toValue: -calendarMenuHeight,
                                    duration: 100
                              }),
                              Animated.timing(this.state.yValueItemMenu, {
                                    toValue: 0,
                                    duration: 100
                              })
                        ]).start();

                        this.setState({
                              isDateMoverOpen: false,
                              isItemAdderOpen: false,
                              isItemMenuOpen: true
                        });
                  }
            } else {
                  Animated.timing(this.state.yValueItemMenu, {
                        toValue: -calendarMenuHeight,
                        duration: 100
                  }).start();
                  this.setState({
                        isItemMenuOpen: false
                  });
            }
      };

      render() {
            return (
                  <View style={styles.container}>
                        <TouchableOpacity style={styles.button} onPress={this.toggleDateMover}>
                              <Text>Date Mover</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.button} onPress={this.toggleItemAdder}>
                              <Text>Add Task</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.button} onPress={this.toggleItemMenu}>
                              <Text>Open Task</Text>
                        </TouchableOpacity>

                        <Animated.View style={[styles.calendarMenu, { bottom: this.state.yValueDateMover }]}>
                              <View
                                    style={{
                                          flexDirection: 'row',
                                          height: 20,
                                          width: width,
                                          marginTop: 10,
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          paddingHorizontal: 16
                                    }}
                              >
                                    <TouchableOpacity>
                                          <Text>Back</Text>
                                    </TouchableOpacity>
                                    <Text>{this.state.visibleMonth} Month</Text>
                                    <TouchableOpacity>
                                          <Text>Today</Text>
                                    </TouchableOpacity>
                              </View>
                        </Animated.View>
                        <Animated.View style={[styles.calendarMenu, { bottom: this.state.yValueItemAdder }]}>
                              <Text>Item Adder</Text>
                        </Animated.View>
                        <Animated.View style={[styles.calendarMenu, { bottom: this.state.yValueItemMenu }]}>
                              <Text>Item Menu</Text>
                        </Animated.View>
                  </View>
            );
      }
}

const calendarMenuHeight = 340;

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: 'grey'
      },
      calendarMenu: {
            width: width,
            height: calendarMenuHeight,
            backgroundColor: 'white',
            position: 'absolute',
            shadowRadius: 2,
            shadowOffset: {
                  width: 0,
                  height: -3
            },
            shadowColor: '#000000',
            elevation: 24,
            shadowOpacity: 1,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20
      },
      calendarElement: {
            justifyContent: 'flex-end'
      },
      button: {
            backgroundColor: 'steelblue',
            height: 45,
            alignSelf: 'center',
            marginTop: 20
      }
});

import React, { Component, useRef, useState, useEffect } from 'react';

// STATIC UI
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, Keyboard, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Task from '../Elements/Task';
import ItemMenu from '../Elements/ItemMenu';
import ItemList from '../ItemList';
import TaskAdder from '../Elements/TaskAdder';
import NavigationView from '../NavigationView';
import MonthlyCalendar from '../MonthlyCalendar';

// ANIMATED UI
import Animated, { Easing, Transitioning, Transition } from 'react-native-reanimated';
import { PanGestureHandler, State, TapGestureHandler } from 'react-native-gesture-handler';
const { cond, eq, add, call, set, Value, event, block, and, Clock, interpolate, extrapolate, diffClamp } = Animated;
const { greaterThan, lessThan, diff, or, debug, startClock, lessOrEq, greaterOrEq } = Animated;

// DATA
import { connect } from 'react-redux';
import { addTaskAction, receiveTasksAction, editTasksPositionAction } from '../../Store/actions/taskAction';

// HELPERS
import moment from 'moment';
import { getToday } from '../../Utils/helpers';

const withOffset = (value, state, offset) => {
      // const offset = new Value(0);
      return block([cond(eq(state, State.END), [set(offset, add(offset, value)), offset], add(offset, value))]);
};

export default () => {
      const state = new Value(State.UNDETERMINED);
      const translationX = new Value(0);
      const translationY = new Value(0);
      const offsetX = new Value((width - 250) / 2);
      const offsetY = new Value((height - 180) / 2);
      const onGestureEvent = event([
            {
                  nativeEvent: {
                        state,
                        translationX,
                        translationY
                  }
            }
      ]);
      const translateX = diffClamp(withOffset(translationX, state, offsetX), 0, width - 250);
      const translateY = diffClamp(withOffset(translationY, state, offsetY), 0, height - 180);
      return (
            <View style={styles.container}>
                  <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onGestureEvent}>
                        <Animated.View style={{ transform: [{ translateX }, { translateY }] }}>
                              <View style={{ width: 250, height: 180, backgroundColor: 'blue' }}></View>
                        </Animated.View>
                  </PanGestureHandler>
            </View>
      );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: 'white'
      }
});

import React, { Component } from 'react';

// STATIC UI
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import MonthlyCalendar from '../MonthlyCalendar';
import { Ionicons } from '@expo/vector-icons';

// ANIMATED UI
import Animated from 'react-native-reanimated';
import { State, TapGestureHandler } from 'react-native-gesture-handler';
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

// DATA
import { connect } from 'react-redux';

//HELPERS
import moment from 'moment';
import { getToday } from '../../Utils/helpers';

class DateMover extends Component {
      constructor(props) {
            super(props);
            this.tapState = new Value(-1);
            this.onTapEvent = event([
                  {
                        nativeEvent: {
                              state: this.tapState
                        }
                  }
            ]);
            this.transY = new Value(0);
      }

      state = {
            visibleMonth: 0,
            formattedDate: getToday
      };

      scrollToIndex = () => {
            this.child.scrollToIndex(); // do stuff
      };

      getSelectedDate = (day, month) => {
            let selectedMonth = moment()
                  .add(month - 12, 'month')
                  .format('L');
            let momentDate = moment().set({
                  date: day,
                  month: parseInt(selectedMonth.substring(0, 2)) - 1,
                  year: selectedMonth.substring(6)
            });

            this.setState({
                  formattedDate: momentDate.format('L')
            });
      };

      getVisibleMonth = month => {
            this.setState({
                  visibleMonth: month
            });
      };

      start1 = () => {
            console.log('tap');
      };

      start2 = () => {
            console.log('active');
      };

      start3 = () => {
            console.log('end');
      };

      render() {
            return (
                  <Animated.View style={[styles.container, { transform: [{ translateY: this.transY }] }]}>
                        <Animated.Code>
                              {() =>
                                    block([
                                          cond(eq(this.tapState, State.BEGAN), [
                                                call([], this.start1),
                                                set(this.transY, 400)
                                          ]),
                                          cond(eq(this.tapState, State.ACTIVE), [call([], this.start2)]),
                                          cond(eq(this.tapState, State.END), [call([], this.start3)])
                                    ])
                              }
                        </Animated.Code>
                        <View
                              style={{
                                    flexDirection: 'row',
                                    marginTop: 16,
                                    marginHorizontal: 24,
                                    marginBottom: 8
                              }}
                        >
                              <Text style={{ fontSize: 18, fontWeight: '500', flex: 1 }}>
                                    {this.state.visibleMonth + ' '}
                              </Text>
                              {/* TODO: Make the icon change color if we reach the visible month */}
                              <TouchableOpacity onPress={this.scrollToIndex} style={{ alignSelf: 'flex-end' }}>
                                    <Ionicons name="ios-calendar" size={30} />
                                    <View
                                          style={{
                                                width: 6,
                                                height: 6,
                                                backgroundColor: '#FF2D55',
                                                position: 'relative',
                                                right: -15,
                                                bottom: 13,
                                                borderRadius: 50
                                          }}
                                    />
                              </TouchableOpacity>
                        </View>

                        <MonthlyCalendar
                              onRef={ref => (this.child = ref)}
                              //Get back the selected date to display the right agenda day
                              getSelectedDate={this.getSelectedDate}
                              //Get back the visible month to display the right name in the DateMover component
                              getVisibleMonth={this.getVisibleMonth}
                        />
                  </Animated.View>
            );
      }
}

export default connect(
      null,
      null
      // mapDispatchToProps
)(DateMover);

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: 'white',
            position: 'absolute',
            bottom: 0,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            elevation: 15,
            zIndex: 99,
            shadowColor: 'black',
            shadowOffset: { width: 0, height: 0.5 * 5 },
            shadowOpacity: 0.3,
            shadowRadius: 0.8 * 8
      }
});

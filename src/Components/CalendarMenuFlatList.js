// TODO:
// - Create a special function for the back button, don't use a toggle animation because it involve more than just animated the calendar menu (like going back to home)
// - If the month contains 6weeks make the calendar height bigger
// - When I go to another month and after I go back to my day on scrolling on it, my calendar come back to that date

import React, { Component, PureComponent } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import moment from 'moment';

import ParentComp from './FlatListTraining';
import AgendaView from './AgendaView';

const { width, height } = Dimensions.get('window');

export default class CalendarMenu extends PureComponent {
      state = {
            isOn: true,
            yValue: new Animated.Value(-calendarMenuHeight),
            // selectedDay: 0,
            // selectedMonth: 0,
            visibleMonth: 0,
            formattedDate: 0
      };

      // backToday = () => {

      // }

      getSelectedDate = async (day, month) => {
            // await this.setState({
            //       selectedDay: day,
            //       selectedMonth: month
            // });

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

      toggleCalendarMenu = () => {
            this.setState(
                  {
                        isOn: !this.state.isOn
                  },
                  () => {
                        Animated.timing(this.state.yValue, {
                              toValue: this.state.isOn ? -calendarMenuHeight : 0,
                              duration: 100
                        }).start();
                  }
            );
      };

      render() {
            return (
                  <View style={styles.container}>
                        <TouchableOpacity style={styles.button} onPress={this.toggleCalendarMenu}>
                              <Text>Show calendar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.button} onPress={this.getFormattedDate}>
                              <Text>format date</Text>
                        </TouchableOpacity>

                        <AgendaView date={this.state.formattedDate} />
                        <Animated.View style={[styles.calendarMenu, { bottom: this.state.yValue }]}>
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
                                    <TouchableOpacity onPress={this.toggleCalendarMenu}>
                                          <Text>Back</Text>
                                    </TouchableOpacity>
                                    <Text>{this.state.visibleMonth} Month</Text>
                                    <TouchableOpacity>
                                          <Text>Today</Text>
                                    </TouchableOpacity>
                              </View>

                              <ParentComp
                                    getSelectedDate={this.getSelectedDate}
                                    getVisibleMonth={this.getVisibleMonth}
                              />
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

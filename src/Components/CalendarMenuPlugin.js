// TODO
// Create a special function for the back button, don't use a toggle animation because it involve more than just animated the calendar menu (like going back to home)
//If the month contains 6weeks make the calendar height bigger

import React, { Component, PureComponent } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import { CalendarList } from 'react-native-calendars';

import AgendaView from './AgendaView';

const { width, height } = Dimensions.get('window');

export default class CalendarMenu extends PureComponent {
      state = {
            isOn: true,
            yValue: new Animated.Value(-calendarMenuHeight),
            selectedDay: 0,
            month: 0
      };

      componentDidMount() {
            console.log(this.state.yValue);
      }

      refCalendarList = ref => (this.calendarList = ref);

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

      changeDate = day => {
            this.setState({
                  selectedDay: day
            });
      };

      changeMonth = month => {
            this.setState({
                  month: month
            });
      };

      render() {
            return (
                  <View style={styles.container}>
                        <TouchableOpacity style={styles.button} onPress={this.toggleCalendarMenu}>
                              <Text>Show calendar</Text>
                        </TouchableOpacity>
                        <AgendaView day={this.state.selectedDay} />
                        <Animated.View style={[styles.calendarMenu, { bottom: this.state.yValue }]}>
                              <View
                                    style={{
                                          flexDirection: 'row',
                                          height: 50,
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
                                    <Text>{this.state.month} Month</Text>
                                    <TouchableOpacity
                                          onPress={() => {
                                                this.calendarList.scrollToDay('2019-01-01');
                                          }}
                                    >
                                          <Text>Today</Text>
                                    </TouchableOpacity>
                              </View>

                              <View style={styles.calendarElement}>
                                    <CalendarList
                                          ref={this.refCalendarList}
                                          // Enable horizontal scrolling, default = false
                                          horizontal={true}
                                          // Enable paging on horizontal, default = false
                                          pagingEnabled={true}
                                          hideExtraDays={false}
                                          onDayPress={day => {
                                                this.changeDate(day.dateString);
                                          }}
                                          // Collection of dates that have to be marked. Default = {}
                                          markedDates={{
                                                [this.state.selectedDay]: {
                                                      selected: true,
                                                      selectedColor: 'blue'
                                                }
                                          }}
                                          firstDay={1}
                                          onVisibleMonthsChange={month => {
                                                this.changeMonth(month[0].month);
                                          }}
                                          pastScrollRange={12}
                                          // Max amount of months allowed to scroll to the future. Default = 50
                                          futureScrollRange={12}
                                          // Set custom calendarWidth.

                                          calendarWidth={Dimensions.get('window').width}
                                          theme={{
                                                'stylesheet.calendar.header': {
                                                      header: {
                                                            height: 0
                                                      }
                                                      // week: {
                                                      //       height: 0
                                                      // }
                                                }
                                          }}
                                    />
                              </View>
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
            //     alignItems: 'center',
            //     justifyContent: 'center'
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

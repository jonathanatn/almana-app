// TODO: On back to today, update the calendar day selected
import React, { Component, PureComponent } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default class ParentComp extends PureComponent {
      constructor(props) {
            super(props);
            this.state = {
                  month: 0
                  // render: true
            };
            let date = new Date();
            let day = date.getDate();

            this.dayBefore = null;

            //Start with the day of today and the index 12 (because it's the month in the middle)
            //Keep the selected day persistent because the FlatList cause re-render
            this.dayNumber = day;
            this.monthNumber = 12;
      }

      onDayPress = (day, dayNumber, monthNumber) => {
            // this.props.getSelectedDay(dayNumber);
            // this.props.getSelectedMonth(monthNumber);
            this.props.getSelectedDate(dayNumber, monthNumber);
            // this.props

            //Keeping track on last date selected because on the re-render of the child component (because of too much swiper on the FlatList)
            // We will loose the selected day so we save it in the parent component
            this.dayNumber = dayNumber;
            this.monthNumber = monthNumber;

            if (this.dayBefore !== null) {
                  this.dayBefore.setNativeProps({
                        backgroundColor: 'white'
                  });
            }

            this.dayBefore = day;

            day.setNativeProps({
                  backgroundColor: 'blue'
            });
      };

      onViewableItemsChanged = async ({ viewableItems, changed }) => {
            // console.log('Visible items are', viewableItems);
            // console.log('Changed items are', changed);

            // FIXME: Scroll to index bug if we call it more than 2 screen than the index
            (await viewableItems[0].index) && this.props.getVisibleMonth(viewableItems[0].index);
      };

      // FIXME:
      // Can't use the state anymore but it's maybe better to continue with setNativeProps
      // shouldComponentUpdate(nextProps, nextState) {
      //       return this.state.value != nextState.value;
      // }
      scrollToIndex = () => {
            /// FIXME: Scroll to index bug if we call it more than 2 screen than the index
            // TODO: Only scroll when are not too far and for the rest remoun the component
            this.flatListRef.scrollToIndex({ animated: true, index: 12 });
            // this.setState({
            //       render: !this.state.render
            // });
      };

      render() {
            const { width } = Dimensions.get('window');
            let data = [];
            //If you edit the currentMonthIndex don't forget to change this.monthNumber in the constructor
            let currentMonthIndex = 12;
            for (let i = 1; i <= 25; i++) {
                  data.push(i);
            }
            return (
                  <View style={[styles.container, { flexDirection: 'column' }]}>
                        <TouchableOpacity onPress={this.scrollToIndex}>
                              <Text>Test backToday</Text>
                        </TouchableOpacity>
                        {/* <Text>test {this.state.month}</Text> */}
                        <FlatList
                              ref={ref => (this.flatListRef = ref)}
                              data={data}
                              keyExtractor={index => index.toString()}
                              renderItem={item => (
                                    <Playground
                                          index={item.index}
                                          currentMonthIndex={currentMonthIndex}
                                          onDayPress={this.onDayPress}
                                          // Keep the day and month selected to avoid re-render in the component after too much swip in the FlatList
                                          dayNumber={this.dayNumber}
                                          monthNumber={this.monthNumber}
                                    />
                              )}
                              onViewableItemsChanged={this.onViewableItemsChanged}
                              viewabilityConfig={{
                                    itemVisiblePercentThreshold: 50
                              }}
                              //Layout settings
                              horizontal
                              pagingEnabled
                              directionalLockEnabled
                              overScrollMode="never"
                              showsVerticalScrollIndicator={false}
                              showsHorizontalScrollIndicator={false}
                              initialScrollIndex={12}
                              //Performance settings
                              getItemLayout={(data, index) => ({
                                    length: width,
                                    offset: width * index,
                                    index
                              })}
                              initialNumToRender={1}
                              windowSize={5}
                              maxToRenderPerBatch={1}
                        />
                  </View>
            );
      }
}

class Playground extends PureComponent {
      componentDidMount() {
            //If the index of the month === the current month index (the middle of month available) we select the current day
            if (this.props.index === this.props.currentMonthIndex) {
                  let date = new Date();
                  let day = date.getDate();
                  // this.props.onDayPress(this[`item-${day - 1}`], day, this.props.index);

                  // We keep a color on the current day to find it more easily
                  this[`itemText-${day - 1}`].setNativeProps({
                        style: { color: 'red' }
                  });
            }

            //When we scroll too much on the FlatList it cause component to render and we loose the selected day
            //This unsure to keep back the selected day on a re-render
            if (this.props.index === this.props.monthNumber) {
                  this.props.onDayPress(
                        this[`item-${this.props.dayNumber - 1}`],
                        this.props.dayNumber,
                        this.props.index
                  );
            }
      }

      render() {
            //Return a month object with the month and year that we can use to build the right month component
            let monthObject = monthIndex(this.props.index);

            let numberOfDays = daysInMonth(monthObject.month, monthObject.year);

            let days = [];

            for (let i = 0; i < numberOfDays; i++) {
                  days.push(i);
            }

            let firstDayWeek = dayOfWeekMonthStarts(monthObject.month, monthObject.year);
            let lastDayWeek = dayOfWeekMonthEnds(monthObject.month, monthObject.year);

            let daysPreviousMonth = [];
            let daysNextMonth = [];

            //If the month don't start a monday we want to display the days of the previous month
            if (firstDayWeek > 1) {
                  let previousMonthObject = monthIndex(this.props.index - 1);
                  let numberOfDaysPreviousMonth = daysInMonth(previousMonthObject.month, previousMonthObject.year);

                  // 'i' is the days in reverse 31, 30, 29, ..
                  // 'j' is the number of days to show
                  //Strange behavior without the 'numberOfDaysPreviousMonth - 1'
                  for (let i = numberOfDaysPreviousMonth - 1, j = 1; j < firstDayWeek; i--, j++) {
                        daysPreviousMonth.unshift(i);
                  }
            }

            //If the last day of the month is not a sunday
            //Push the difference of the week minus the last day of the month
            if (lastDayWeek < 7) {
                  for (let i = 0; i <= 6 - lastDayWeek; i++) {
                        daysNextMonth.push(i);
                  }
            }

            return (
                  <View style={styles.container}>
                        {daysPreviousMonth.map(i => {
                              return (
                                    <View key={i} style={styles.dayContainer}>
                                          <TouchableOpacity
                                                style={styles.day}
                                                key={i}
                                                ref={thisItem => (this[`itemb-${i}`] = thisItem)}
                                                onPress={() =>
                                                      this.props.onDayPress(
                                                            this[`itemb-${i}`],
                                                            i + 1,
                                                            this.props.index - 1
                                                      )
                                                }
                                          >
                                                <Text style={{ color: 'grey', opacity: 0.6 }}>{i + 1}</Text>
                                          </TouchableOpacity>
                                    </View>
                              );
                        })}
                        {days.map(i => {
                              return (
                                    <View key={i} style={styles.dayContainer}>
                                          <TouchableOpacity
                                                style={styles.day}
                                                key={i}
                                                ref={thisItem => (this[`item-${i}`] = thisItem)}
                                                onPress={() =>
                                                      this.props.onDayPress(this[`item-${i}`], i + 1, this.props.index)
                                                }
                                          >
                                                <Text ref={thisItemText => (this[`itemText-${i}`] = thisItemText)}>
                                                      {i + 1}
                                                </Text>
                                          </TouchableOpacity>
                                    </View>
                              );
                        })}
                        {daysNextMonth.map(i => {
                              return (
                                    <View key={i} style={styles.dayContainer}>
                                          <TouchableOpacity
                                                style={styles.day}
                                                key={i}
                                                ref={thisItem => (this[`itemc-${i}`] = thisItem)}
                                                onPress={() =>
                                                      this.props.onDayPress(
                                                            this[`itemc-${i}`],
                                                            i + 1,
                                                            this.props.index + 1
                                                      )
                                                }
                                          >
                                                <Text style={{ color: 'grey', opacity: 0.6 }}>{i + 1}</Text>
                                          </TouchableOpacity>
                                    </View>
                              );
                        })}
                  </View>
            );
      }
}

const styles = StyleSheet.create({
      container: {
            flex: 1,
            flexDirection: 'row',
            flexWrap: 'wrap',
            width: width,
            paddingTop: 50,
            backgroundColor: '#fff'
      },
      dayContainer: {
            width: width / 7,
            justifyContent: 'center',
            alignItems: 'center'
      },
      day: {
            width: 32,
            height: 32,
            backgroundColor: 'white',
            borderRadius: 50,
            justifyContent: 'center',
            alignItems: 'center'
      }
});

function monthIndex(index) {
      let date = new Date();
      //We go back 12 month until 12 month
      date.setMonth(date.getMonth() - 12 + index);
      //We get the month, the first is a year before, the 12th the current month, the 25th a year after
      let month = date.getMonth();
      //We get the year of that month
      let year = date.getFullYear();

      return {
            month,
            year
      };
}

function daysInMonth(month, year) {
      let date = new Date(year, month + 1, 0);
      let numberOfDays = date.getDate();
      return numberOfDays;
}

function dayOfWeekMonthStarts(month, year) {
      month = month + 1;
      month = month.toString();
      year = year.toString();

      if (month.length === 1) {
            month = '0' + month;
      }
      let day = new Date(year + '-' + month + '-01').getDay();

      // Sunday will return 0, so we make it return 7 instead for more clarity
      day = day === 0 ? 7 : day;

      return day;
}

function dayOfWeekMonthEnds(month, year) {
      let numberOfDays = daysInMonth(month, year);

      month = month + 1;
      month = month.toString();
      year = year.toString();

      // numberOfDays = numberOfDays + 1;

      if (month.length === 1) {
            month = '0' + month;
      }
      let day = new Date(year + '-' + month + '-' + numberOfDays.toString()).getDay();

      // Sunday will return 0, so we make it return 7 instead for more clarity
      day = day === 0 ? 7 : day;

      return day;
}

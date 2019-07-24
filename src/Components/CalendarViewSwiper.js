import React, { Component, PureComponent } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import Swiper from 'react-native-custom-swiper';

class CalendarView extends PureComponent {
      // state = {
      //       display: true
      // };

      state = {
            display: true,
            daySelected: null
      };

      handleDisplay = () => {
            this.setState({
                  display: !this.state.display
            });
      };

      clear = (day, i) => {
            if (this.state.daySelected !== null) {
                  this.state.daySelected.setNativeProps({
                        backgroundColor: 'white'
                  });
            }

            this.setState({
                  daySelected: day
            });

            day.setNativeProps({
                  backgroundColor: 'blue'
            });

            console.log('DAY: ', day.props.children.props.children, i);
      };

      _renderItem = ({ item, index }) => {
            let date = new Date();

            // 12 months before the current month (+1 serve to get 1 for January instead of 0)
            date.setMonth(date.getMonth() + 1 - 12 + index);

            return <Month month={date.getMonth()} year={date.getFullYear()} clear={this.clear} />;
      };

      onViewableItemsChanged = ({ viewableItems, changed }) => {
            console.log('Visible items are', viewableItems);
            console.log('Changed items are', changed);
      };

      render() {
            //       if(this.state.display){}
            const { width } = Dimensions.get('window');
            // const data = [1, 2, 3, 4, 5];
            let data = [];
            for (let i = 1; i <= 25; i++) {
                  data.push(i.toString());
            }

            // let date = new Date();
            // for (let i = 1; i <= 25; i++) {
            //       date.setMonth(date.getMonth() + 1 - 12 + i);
            //       data.push(<Month month={date.getMonth()} year={date.getFullYear()} />);
            // }

            return (
                  <View style={{ paddingTop: 50 }}>
                        <TouchableOpacity onPress={() => this.handleDisplay()}>
                              <Text>Activate Months</Text>
                        </TouchableOpacity>
                        {this.state.display ? (
                              <View style={styles.componentContainer}>
                                    <FlatList
                                          onViewableItemsChanged={this.onViewableItemsChanged}
                                          viewabilityConfig={{
                                                itemVisiblePercentThreshold: 50
                                          }}
                                          data={data}
                                          keyExtractor={index => index}
                                          renderItem={this._renderItem}
                                          // renderItem={() => <Month month={12} year={2019} clear={this.clear} />}
                                          getItemLayout={(data, index) => ({
                                                length: width,
                                                offset: width * index,
                                                index
                                          })}
                                          horizontal
                                          directionalLockEnabled
                                          pagingEnabled
                                          overScrollMode="never"
                                          initialNumToRender={1}
                                          maxToRenderPerBatch={1}
                                          initialScrollIndex={12}
                                    />
                              </View>
                        ) : null}
                  </View>
            );
      }
}

export default CalendarView;

// TODO: Create a helpers for the months
// const Month = props => {
class Month extends PureComponent {
      state = {
            selectedDay: null
      };

      componentDidMount() {
            // for (let i = 0; i < 40; i++) {
            //       if (this[`item-${i}`]) {
            //             this[`item-${i}`].setNativeProps({ backgroundColor: 'white' });
            //       }
            // }
            // if (this.state.selectedDay !== null) {
            //       this.state.selectedDay.setNativeProps({ backgroundColor: 'blue' });
            // }
      }

      selectDay = (day, days) => {
            for (let i = 0; i <= 42; i++) {
                  if (this[`item-${i}`]) {
                        this[`item-${i}`].setNativeProps({ backgroundColor: 'white' });
                  }
            }

            day.setNativeProps({ backgroundColor: 'blue' });

            this.setState({
                  selectDay: day
            });
      };

      render() {
            //Know how many days are in a month
            // int 1 = January
            const daysInMonth = (month, year) => {
                  return new Date(year, month, 0).getDate();
            };

            //Know the day of the week of the first day of the month
            // string '01' = January
            const dayOfWeekMonthStarts = (_month, _year) => {
                  let year = _year.toString();
                  let month = _month.toString();
                  if (month.length === 1) {
                        month = '0' + month;
                  }
                  let day = new Date(year + '-' + month + '-01').getDay();

                  // Sunday will return 0, so we make it return 7 instead for more clarity
                  day = day === 0 ? 7 : day;

                  return day;
            };

            buildCalendar = () => {
                  let firstDay = dayOfWeekMonthStarts(this.props.month, this.props.year);

                  let numberOfDays = daysInMonth(this.props.month, this.props.year);

                  let days = [];

                  //Fill the array with 0 if the month don't start by them
                  //TODO: push last days instead of the month before instead of 0
                  for (let i = 1; i < firstDay; i++) {
                        days.push(' ');
                  }

                  //Fill the array with all the day
                  for (let i = 1; i <= numberOfDays; i++) {
                        days.push(i);
                  }

                  return days;
            };

            let days = buildCalendar();

            return (
                  <View style={styles.calendar}>
                        {days.map((item, i) => {
                              return (
                                    <View style={styles.day} key={i}>
                                          <TouchableOpacity
                                                ref={thisItem => (this[`item-${i}`] = thisItem)}
                                                key={i}
                                                style={styles.dayContent}
                                                onPress={() => {
                                                      // console.log(this.props.month);
                                                      this.props.clear(this[`item-${i}`], i);
                                                }}
                                                // onPress={() => console.log(this)}
                                          >
                                                <Text>{item}</Text>
                                          </TouchableOpacity>
                                    </View>
                              );
                        })}
                  </View>
            );
      }
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
      componentContainer: {
            // flex: 1,
            height: 400
      },
      calendar: {
            // flex: 1,
            // height: 400,
            flexWrap: 'wrap',
            flexDirection: 'row',
            width: width
      },
      day: {
            width: width / 7,
            alignItems: 'center'
      },
      dayContent: {
            width: 32,
            height: 32,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white',
            borderRadius: 50
      },
      dayContentSelected: {
            width: 32,
            height: 32,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'blue',
            borderRadius: 50
      }
});

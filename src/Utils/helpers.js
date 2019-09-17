import moment from 'moment';
import { Platform } from 'react-native';
import { Notifications } from 'expo';

export const getToday = moment().format('L');

export function getPeriod(time) {
      let timeToCompare = moment(time, 'h:mma');
      let morningEnd = moment('11:59 AM', 'h:mma');
      let afternoonEnd = moment('05:59 PM', 'h:mma');

      if (timeToCompare.isBefore(morningEnd)) {
            return 'Morning';
      } else if (timeToCompare.isBefore(afternoonEnd)) {
            return 'Afternoon';
      } else {
            return 'Evening';
      }
}

export function clearLocalNotification(idNotification) {
      if (idNotification !== '') {
            Notifications.cancelScheduledNotificationAsync(idNotification);
      }
}

function createNotification(name, time) {
      if (Platform.OS === 'android') {
            Notifications.createChannelAndroidAsync('events', {
                  name: 'Events',
                  sound: true,
                  priority: 'max',
                  vibrate: [0, 250, 250, 250]
            });
      }
      return {
            title: name,
            body: time,
            ios: {
                  sound: true
            },
            android: {
                  channelId: 'events'
            }
      };
}

function createRepeatTimingNotification(reminderDate, repeat) {
      if (repeat === 'never') {
            return {
                  time: reminderDate
            };
      } else {
            let _repeat;
            if (repeat === 'daily') {
                  _repeat = 'day';
            } else if (repeat === 'weekly') {
                  _repeat = 'week';
            } else if (repeat === 'monthly') {
                  _repeat = 'month';
            }
            return {
                  time: reminderDate,
                  repeat: _repeat
            };
      }
}

export function setLocalNotification(id, name, date, time, reminder, repeat) {
      // Formatting date for new Date
      let year = date.substring(6);
      let month = date.substring(0, 2);
      let day = date.substring(3, 5);

      // Formatting time for new Date
      let time24h = moment(time, 'h:mm A').format('HH:mm:ss');
      let hour = time24h.substring(0, 2);
      let minute = time24h.substring(3, 5);

      let reminderDate;

      if (reminder.time === '1-hour') {
            reminderDate = new Date(year, parseInt(month, 10) - 1, day, parseInt(hour, 10) - 1, minute);
      } else if (reminder.time === '3-hour') {
            reminderDate = new Date(year, parseInt(month, 10) - 1, day, parseInt(hour, 10) - 3, minute);
      } else if (reminder.time === '1-day') {
            reminderDate = new Date(year, parseInt(month, 10) - 1, parseInt(day, 10) - 1, hour, minute);
      } else if (reminder.time === '3-day') {
            reminderDate = new Date(year, parseInt(month, 10) - 1, parseInt(day, 10) - 3, hour, minute);
      }

      // If the item is repeating, we doesn't care if the reminder date is in the past
      // But we should prevent to happen by selecting the next repeating reminder date, closest to present moment
      if (repeat !== 'never' && reminderDate < new Date()) {
            if (repeat === 'daily') {
                  let i = 1;
                  while (reminderDate < new Date()) {
                        console.log(i);
                        reminderDate.setDate(reminderDate.getDate() + i);
                        i++;
                  }
                  console.log(reminderDate);

                  return Notifications.scheduleLocalNotificationAsync(
                        createNotification(name, time),
                        createRepeatTimingNotification(reminderDate, repeat)
                  );
            }
            if (repeat === 'weekly') {
                  let _hour = reminderDate.getHours().toString();
                  let _minute = reminderDate.getMinutes().toString();

                  // Get the name of the day of the reminder
                  reminderDate = getNextDayOfTheWeek(reminderDate.getDay(), true, _hour, _minute);

                  return Notifications.scheduleLocalNotificationAsync(
                        createNotification(name, time),
                        createRepeatTimingNotification(reminderDate, repeat)
                  );
            }
            if (repeat === 'monthly') {
                  reminderDate = reminderDate.setMonth(reminderDate.getMonth() + 1);
                  return Notifications.scheduleLocalNotificationAsync(
                        createNotification(name, time),
                        createRepeatTimingNotification(reminderDate, repeat)
                  );
            }
      }

      if (reminderDate > new Date()) {
            return Notifications.scheduleLocalNotificationAsync(
                  createNotification(name, time),
                  createRepeatTimingNotification(reminderDate, repeat)
            );
      } else {
            return new Promise((resolve, reject) => {
                  resolve('');
            });
      }
}

// Get the next day of the week
// Useful to set recurring reminder but not having the first one fired
function getNextDayOfTheWeek(day, excludeToday = true, hour, minute, refDate = new Date()) {
      const dayOfWeek = [0, 1, 2, 3, 4, 5, 6].indexOf(day);
      if (dayOfWeek < 0) return;
      refDate.setHours(hour, minute);
      refDate.setDate(refDate.getDate() + !!excludeToday + ((dayOfWeek + 7 - refDate.getDay() - !!excludeToday) % 7));
      return refDate;
}

// function getNextDayOfTheWeek(day, excludeToday = true, refDate = new Date()) {
//       const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].indexOf(day.slice(0, 3).toLowerCase());
//       if (dayOfWeek < 0) return;
//       refDate.setHours(0, 0, 0, 0);
//       refDate.setDate(refDate.getDate() + !!excludeToday + ((dayOfWeek + 7 - refDate.getDay() - !!excludeToday) % 7));
//       return refDate;
// }

// Used in ItemList to know if a repeated items should be present in the list
export function isRepeatedItemsValid(dateSelected, item) {
      // First we need to check if the initial date of the item is superior to the date selected
      let year = item.date.substring(6);
      let month = item.date.substring(0, 2);
      let day = item.date.substring(3, 5);

      let initialDateItem = new Date(year, parseInt(month, 10) - 1, day);

      let year2 = dateSelected.substring(6);
      let month2 = dateSelected.substring(0, 2);
      let day2 = dateSelected.substring(3, 5);

      let dateSelectedObject = new Date(year2, parseInt(month2, 10) - 1, day2);

      if (dateSelectedObject > initialDateItem) {
            if (item.repeat === 'daily') {
                  return true;
            } else if (item.repeat === 'weekly' && initialDateItem.getDay() === dateSelectedObject.getDay()) {
                  return true;
            } else if (item.repeat === 'monthly' && initialDateItem.getDate() === dateSelectedObject.getDate()) {
                  return true;
            }
      }

      return false;
}

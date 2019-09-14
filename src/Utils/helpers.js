import moment from 'moment';
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
      return {
            title: name,
            body: time,
            ios: {
                  sound: true
            },
            android: {
                  sound: true,
                  priority: 'high',
                  sticky: false,
                  vibrate: true
            }
      };
}

export function setLocalNotification(id, name, date, time, reminder) {
      // FIXME: Create on function to get a date object and create and other to get the right time for the reminded
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
            // console.log('reminder 1hour');
      } else if (reminder.time === '3-hour') {
            reminderDate = new Date(year, parseInt(month, 10) - 1, day, parseInt(hour, 10) - 3, minute);
            // console.log('reminder 3hour');
      } else if (reminder.time === '1-day') {
            reminderDate = new Date(year, parseInt(month, 10) - 1, parseInt(day, 10) - 1, hour, minute);
            // console.log('reminder 1day');
      } else if (reminder.time === '3-day') {
            reminderDate = new Date(year, parseInt(month, 10) - 1, parseInt(day, 10) - 3, hour, minute);
            // console.log('reminder 3day');
      }

      if (reminderDate > new Date()) {
            return Notifications.scheduleLocalNotificationAsync(createNotification(name, time), {
                  time: reminderDate
            });
      } else {
            return new Promise((resolve, reject) => {
                  resolve('');
            });
      }
}

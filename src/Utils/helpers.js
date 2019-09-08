import moment from 'moment';
// import { AsyncStorage } from 'react-native'
// import { Notifications, Permissions} from 'expo'

// const NOTIFICATION_KEY = 'Almana:notifications'

// export function clearLocalNotification () {

// }

// export function createLocalNotification(){
//       return {
//             title: 'Hour + Name of Event'
//       }
// }

// export function setLocalNotification () {

// }

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

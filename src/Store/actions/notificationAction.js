export function setLocalNotificationAction() {
      console.log('local notif action');

      return dispatch => {
            dispatch({
                  type: 'SET_LOCAL_NOTIFICATION',
                  notification: 'test'
            });
      };

      AsyncStorage.getItem(NOTIFICATION_KEY)
            .then(JSON.parse)
            .then(data => {
                  // We didn't set notification
                  if (data === null) {
                        Permissions.askAsync(Permissions.NOTIFICATIONS).then(status => {
                              if (status === 'granted') {
                                    Notifications.cancelAllScheduledNotificationsAsync();

                                    let tomorrow = new Date();
                                    tomorrow.setDate(tomorrow.getDate());
                                    tomorrow.setHours(0);
                                    tomorrow.setMinutes(0);
                                    tomorrow.setSeconds(5);

                                    Notifications.scheduleLocalNotificationAsync(createNotification(), {
                                          time: tomorrow
                                          // repeat: 'day'
                                    });

                                    AsyncStorage.setItem(NOTIFICATION_KEY, JSON.stringify(true));
                              }
                        });
                  }
            });
}

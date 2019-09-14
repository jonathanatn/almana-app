// STATIC UI
import React, { Component } from 'react';
import { Text, TextInput, View, StyleSheet, TouchableOpacity, Alert, AsyncStorage } from 'react-native';
import { Notifications } from 'expo';
import { connect } from 'react-redux';
import * as Permissions from 'expo-permissions';
// ANIMATED UI

// DATA
import { setLocalNotificationAction } from '../Store/actions/notificationAction';
function mapDispatchToProps(dispatch) {
      return {
            setLocalNotificationProp: () => dispatch(setLocalNotificationAction())
      };
}

// HELPERS
const NOTIFICATION_KEY = 'Almana:notifications';

class Playground extends Component {
      createNotification = async () => {
            // const { status, permissions } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
            // if (status === 'granted') {
            let date = new Date(2019, 8, 10, 14, 0);

            let idNotif = 0;

            // try {
            //       await AsyncStorage.setItem('@MySuperStore:key', 123);
            // } catch (error) {
            //       console.log(error);
            // }

            // try {
            //       const value = await AsyncStorage.getItem('@MySuperStore:key');
            //       if (value !== null) {
            //             // We have data!!
            //             console.log(typeof value);
            //       }
            // } catch (error) {
            //       console.log(error);
            // }

            let notificationId = {
                  notification: Notifications.scheduleLocalNotificationAsync(
                        {
                              title: 'Even work in method',
                              body: 'Wow, I can show up even when app is closed'
                        },
                        {
                              time: new Date().getTime() + 5000
                              // time: date
                        }
                  )
                        .then(e => {
                              idNotif = e;
                        })
                        .then(() => Notifications.cancelScheduledNotificationAsync(idNotif))
            };

            // Notifications.cancelScheduledNotificationAsync(idNotif);
            // notificationId.notification.then(e => Notifications.cancelScheduledNotificationAsync(e));
            // } else {
            //       throw new Error('Location permission not granted');
            // }
      };

      render() {
            return (
                  <View style={styles.containerParent}>
                        <View style={styles.container}>
                              <TouchableOpacity onPress={this.createNotification}>
                                    <Text>Add notification</Text>
                              </TouchableOpacity>
                        </View>
                  </View>
            );
      }
}

function mapStateToProp(state, ownProps) {
      // console.log(state.general);
      let notifications = state.notifications;

      return {
            notification: notifications
      };
}

export default connect(
      mapStateToProp,
      mapDispatchToProps
)(Playground);

const styles = StyleSheet.create({
      containerParent: {
            flex: 1,
            backgroundColor: '#ecf0f1',
            paddingTop: 20,
            justifyContent: 'flex-end'
      },
      container: {
            height: 300
      }
});

function clearLocalNotification() {
      return AsyncStorage.removeItem(NOTIFICATION_KEY).then(Notifications.cancelAllScheduledNotificationsAsync);
}

function createNotification2() {
      return {
            title: 'Almana Notification',
            body: 'Message notification',
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

function setLocalNotification() {
      // AsyncStorage.getAllKeys((err, keys) => {
      //       AsyncStorage.multiGet(keys, (error, stores) => {
      //             stores.map((result, i, store) => {
      //                   console.log({ [store[i][0]]: store[i][1] });
      //                   return true;
      //             });
      //       });
      // });
      AsyncStorage.getItem(NOTIFICATION_KEY)
            .then(JSON.parse)
            .then(data => {
                  // We didn't set notification
                  if (data === null) {
                        Permissions.askAsync(Permissions.NOTIFICATIONS).then(status => {
                              if (status === 'granted') {
                                    console.log('granted');
                                    Notifications.cancelAllScheduledNotificationsAsync();

                                    let today = new Date();
                                    today.setDate(today.getDate());
                                    today.setHours(0);
                                    today.setMinutes(0);
                                    today.setSeconds(5);

                                    let date = new Date(2019, 8, 10, 13, 22);

                                    Notifications.scheduleLocalNotificationAsync(createNotification(), {
                                          time: date
                                          // repeat: 'day'
                                    });

                                    AsyncStorage.setItem(NOTIFICATION_KEY, JSON.stringify(true));
                              }
                        });
                  }
            });
}

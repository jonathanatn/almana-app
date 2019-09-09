// STATIC UI
import React, { Component } from 'react';
import { Text, TextInput, View, StyleSheet, TouchableOpacity, AsyncStorage } from 'react-native';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
// ANIMATED UI
// DATA
// HELPERS

const NOTIFICATION_KEY = 'Almana:notifications';

function clearLocalNotification() {
      return AsyncStorage.removeItem(NOTIFICATION_KEY).then(Notifications.cancelAllScheduledNotificationsAsync);
}

function createNotification() {
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
      AsyncStorage.getAllKeys((err, keys) => {
            AsyncStorage.multiGet(keys, (error, stores) => {
                  stores.map((result, i, store) => {
                        console.log({ [store[i][0]]: store[i][1] });
                        return true;
                  });
            });
      });
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
      console.log(AsyncStorage.getItem(NOTIFICATION_KEY));
}

function test() {
      console.log('test');
}

export default class App extends Component {
      state = {
            isNameInputFocus: false
      };

      render() {
            return (
                  <View style={styles.containerParent}>
                        <View style={styles.container}>
                              <TouchableOpacity onPress={setLocalNotification}>
                                    <Text>Add notification</Text>
                              </TouchableOpacity>
                        </View>
                  </View>
            );
      }

      _submit = () => {
            alert(`Confirmation email has been sent to ${this.state.email}`);
      };
}

const styles = StyleSheet.create({
      containerParent: {
            flex: 1,
            backgroundColor: '#ecf0f1',
            paddingTop: 20,
            justifyContent: 'flex-end'
      },
      container: {
            height: 300
            // elevation: 15,
            // shadowColor: 'black',
            // shadowOffset: { width: 0, height: 0.5 * 5 },
            // shadowOpacity: 0.3,
            // shadowRadius: 0.8 * 8,
            // borderTopLeftRadius: 15,
            // borderTopRightRadius: 15
      },
      input: {
            margin: 20,
            // marginBottom: 0,
            // marginTop: 20,
            height: 34,
            paddingHorizontal: 10,
            borderRadius: 4,
            borderColor: '#ccc',
            borderWidth: 1,
            fontSize: 16
      },
      legal: {
            margin: 10,
            color: '#333',
            fontSize: 12,
            textAlign: 'center'
      },
      form: {
            flex: 1
            // justifyContent: 'space-between'
      }
});

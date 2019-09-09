import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

class Event extends Component {
      render() {
            return (
                  <View style={styles.componentContainer}>
                        <View
                              style={{
                                    flexDirection: 'column',
                                    marginLeft: 12
                              }}
                        >
                              <Text
                                    style={{
                                          fontSize: 11,
                                          color: 'rgba(145, 145, 145, 1.0)'
                                    }}
                              >
                                    {this.props.time.substring(0, 5)}
                              </Text>
                              <Text
                                    style={{
                                          fontSize: 11,
                                          color: 'rgba(145, 145, 145, 1.0)'
                                    }}
                              >
                                    {this.props.endTime.substring(0, 5)}
                              </Text>
                        </View>
                        <View style={styles.CircleShape} />
                        <Text style={{ fontSize: 16 }}>{this.props.name}</Text>
                  </View>
            );
      }
}

const styles = StyleSheet.create({
      componentContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            height: 70,
            marginHorizontal: 8,
            backgroundColor: 'rgba(245, 245, 245, 1.0)',
            borderRadius: 8
      },
      CircleShape: {
            width: 10,
            height: 10,
            borderRadius: 150 / 2,
            marginHorizontal: 16,
            backgroundColor: '#FF2D55'
      }
});

export default Event;

import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

class Task extends Component {
      render() {
            return (
                  <View style={styles.componentContainer}>
                        <Ionicons
                              name="ios-checkmark-circle-outline"
                              size={30}
                              color={this.props.completed ? 'red' : 'grey'}
                        />
                        <Text>{this.props.time}</Text>
                        <Text style={{ fontSize: 18, marginLeft: 12, color: this.props.completed ? 'grey' : 'black' }}>
                              {this.props.name}
                        </Text>
                  </View>
            );
      }
}

const styles = StyleSheet.create({
      componentContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 10,
            paddingHorizontal: 12
      }
});

export default Task;

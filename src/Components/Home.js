import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default class Home extends Component {
      render() {
            return (
                  <View style={styles.container}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('Playground')}>
                              <Text>Go to Playground</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('CalendarMenu')}>
                              <Text>Go to CalendarMenu</Text>
                        </TouchableOpacity>
                  </View>
            );
      }
}

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 50
      }
});

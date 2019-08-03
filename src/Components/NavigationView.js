import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

class NavigationView extends Component {
      render() {
            return (
                  <View style={styles.container}>
                        <TouchableOpacity style={styles.dateMoverButton} onPress={() => this.props.openDateMover()}>
                              <Ionicons name="ios-calendar" size={30} color={'#FF2D55'} />
                        </TouchableOpacity>
                  </View>
            );
      }
}

export default NavigationView;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
      container: {
            flexDirection: 'row',
            width: width,
            height: 100,
            backgroundColor: 'white',
            justifyContent: 'center',
            alignItems: 'center'
      },
      dateMoverButton: {
            width: 60,
            height: 60,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            borderRadius: 30,
            borderColor: '#ededed',
            borderWidth: 0.5,
            shadowColor: '#000',
            shadowOffset: {
                  width: 0,
                  height: -4
            },
            shadowOpacity: 0.23,
            shadowRadius: 2.62,

            elevation: 1
      }
});

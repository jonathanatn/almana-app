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
            alignItems: 'center',
            // elevation: 15,
            zIndex: 2
      },
      dateMoverButton: {
            width: 60,
            height: 60,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            borderRadius: 30,
            // borderColor: '#ededed',
            // borderWidth: 0.5,
            elevation: 2,
            shadowColor: 'black',
            shadowOffset: { width: 0, height: 0.5 * 5 },
            shadowOpacity: 0.3,
            shadowRadius: 0.8 * 5
      }
});

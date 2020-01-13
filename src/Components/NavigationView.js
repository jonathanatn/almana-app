import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

class NavigationView extends Component {
      alert = () => {
            Alert.alert('Come back later!', 'Sorry, this section is under intense construction :)', [{ text: 'Ok' }], {
                  cancelable: true
            });
      };

      mainScreenNav = () => {
            return (
                  <View style={styles.container}>
                        {/* ----------------------------- LEFT BUTTON ----------------------------- */}
                        <TouchableOpacity style={[styles.sideButton, { opacity: 0.2 }]} onPress={this.alert}>
                              <Ionicons name="md-contact" size={28} color={'grey'} />
                        </TouchableOpacity>
                        {/* ----------------------------- MIDDLE BUTTON ----------------------------- */}
                        <TouchableOpacity style={styles.dateMoverButton} onPress={() => this.props.openDateMover()}>
                              <Ionicons name="ios-calendar" size={30} color={'#FF2D55'} />
                        </TouchableOpacity>
                        {/* ----------------------------- RIGHT BUTTON ----------------------------- */}
                        <TouchableOpacity
                              style={styles.sideButton}
                              onPress={() => this.props.navigation.navigate('ProjectsScreen')}
                        >
                              <Ionicons name="ios-list" size={24} color={'grey'} />
                        </TouchableOpacity>
                  </View>
            );
      };

      projectsScreenNav = () => {
            return (
                  <View style={styles.container}>
                        {/* ----------------------------- LEFT BUTTON ----------------------------- */}
                        <TouchableOpacity style={[styles.sideButton, { opacity: 0.2 }]} onPress={this.alert}>
                              <Ionicons name="md-contact" size={28} color={'grey'} />
                        </TouchableOpacity>
                        {/* ----------------------------- MIDDLE BUTTON ----------------------------- */}
                        <TouchableOpacity
                              style={{ marginHorizontal: 20 }}
                              onPress={() => this.props.navigation.goBack()}
                        >
                              <Ionicons name="ios-calendar" size={24} color={'grey'} />
                        </TouchableOpacity>
                        {/* ----------------------------- RIGHT BUTTON ----------------------------- */}
                        <TouchableOpacity
                              style={styles.sideButton}
                              onPress={() => this.props.navigation.navigate('ProjectsScreen')}
                        >
                              <Ionicons name="ios-list" size={24} color={'blue'} />
                        </TouchableOpacity>
                  </View>
            );
      };

      render() {
            if (this.props.navigation.state.routeName === 'MainScreen') {
                  return this.mainScreenNav();
            }
            if (this.props.navigation.state.routeName === 'ProjectsScreen') {
                  return this.projectsScreenNav();
            }
            // this.props.navigation.state.routeName === 'MainScreen' && return this.mainScreenNav()
            // this.props.navigation.state.routeName === 'ProjectsScreen' &&  return this.projectsScreenNav();
      }
}

// {
//       this.props.navigation.state.routeName === 'ProjectsScreen' ? (
//             <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
//                   <Ionicons name="ios-calendar" size={30} color={'grey'} />
//             </TouchableOpacity>
//       ) : null;
// }

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
            zIndex: 2,
            position: 'absolute',
            bottom: 0,
            paddingBottom: 24
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
      },
      sideButton: {
            marginHorizontal: 36
      }
});

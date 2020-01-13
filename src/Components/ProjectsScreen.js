// STATIC UI
import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, Alert, BackHandler } from 'react-native';
import { Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProjectsList from './ProjectsList2';
import NavigationView from './NavigationView';
import ProjectAdder from './Elements/ProjectAdder';

// ANIMATED UI

// DATA
import { connect } from 'react-redux';
function mapDispatchToProps(dispatch) {
      return {};
}

// HELPERS
import moment from 'moment';
import { getToday } from '../Utils/helpers';
const { width, height } = Dimensions.get('window');

class ProjectsScreen extends Component {
      constructor(props) {
            super(props);
            this.state = {
                  isAddItemMenuOpen: false,
                  isProjectAdderOpen: false,
                  projectType: ''
            };
      }

      componentDidMount() {
            this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
      }

      componentWillUnmount() {
            this.backHandler.remove();
      }

      handleBackPress = () => {
            if (this.state.isAddItemMenuOpen === true) {
                  this.setState({ isAddItemMenuOpen: false });
                  return true;
            }

            if (this.state.isProjectAdderOpen === true) {
                  this.setState({ isProjectAdderOpen: false });
                  return true;
            }

            this.props.navigation.goBack();
            return;
      };

      openAddItemMenu = () => {
            // if (this.props.general.isDateMoverOpen === true) {
            //       this.closeDateMover();
            // }
            // if (this.props.general.isTaskMenuOpen === true) {
            //       this.props.closeTaskMenuProp();
            // }
            // if (this.props.general.isEventMenuOpen === true) {
            //       this.props.closeEventMenuProp();
            // }
            // if (this.props.general.isTaskAdderOpen === true) {
            //       this.props.closeTaskAdderProp();
            // }
            this.setState({ isAddItemMenuOpen: true, isProjectAdderOpen: false });
      };

      openProjectAdder = type => {
            this.setState({
                  projectType: type,
                  isAddItemMenuOpen: false,
                  isProjectAdderOpen: true
            });
            // this.props.openTaskAdderProp();
      };

      closeProjectAdder = () => {
            this.setState({
                  projectType: '',
                  isProjectAdderOpen: false
            });
      };

      render() {
            return (
                  <View style={styles.container}>
                        <StatusBar backgroundColor="white" barStyle="dark-content" />
                        {/*---------------------------------------------------- ADDITEMMENU ---------------------------------------------------- */}

                        {this.state.isAddItemMenuOpen === true ? (
                              <View
                                    style={{
                                          backgroundColor: 'black',
                                          opacity: 0.6,
                                          position: 'absolute',
                                          top: 0,
                                          bottom: 0,
                                          left: 0,
                                          right: 0,
                                          zIndex: 998,
                                          elevation: 98
                                    }}
                              />
                        ) : null}

                        {this.state.isAddItemMenuOpen === true ? (
                              <View
                                    style={{
                                          position: 'absolute',
                                          top: 0,
                                          bottom: 0,
                                          left: 0,
                                          right: 0,
                                          zIndex: 999,
                                          elevation: 99,
                                          justifyContent: 'flex-end',
                                          alignItems: 'center'
                                    }}
                              >
                                    <TouchableOpacity
                                          style={{
                                                backgroundColor: 'white',
                                                width: width - 32,
                                                height: 80,
                                                borderRadius: 12,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                marginVertical: 8
                                          }}
                                          onPress={() => this.openProjectAdder('project')}
                                    >
                                          <Text>Add a new project</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                          style={{
                                                backgroundColor: 'white',
                                                width: width - 32,
                                                height: 80,
                                                borderRadius: 12,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                marginVertical: 8
                                          }}
                                          onPress={() => this.openProjectAdder('projectsCategory')}
                                    >
                                          <Text>Add a category</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                          style={{
                                                backgroundColor: 'white',
                                                width: width - 32,
                                                height: 50,
                                                borderRadius: 12,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                marginVertical: 8,
                                                marginBottom: 24
                                          }}
                                          onPress={() => this.setState({ isAddItemMenuOpen: false })}
                                    >
                                          <Text>Cancel</Text>
                                    </TouchableOpacity>
                              </View>
                        ) : null}

                        {/* ------------------------------------------------------------------------------------------------------------- */}

                        <View style={styles.header}>
                              <Text style={{ fontWeight: '900', fontSize: 36 }}>Projects </Text>
                        </View>
                        <ProjectsList style={{ zIndex: 10 }} navigation={this.props.navigation} />

                        {/* ------------------------------------------ Add Items Button ------------------------------------------ */}
                        <TouchableOpacity style={styles.addButtonContainer} onPress={this.openAddItemMenu}>
                              <View style={styles.addButton}>
                                    <Ionicons name="ios-add" size={50} color={'white'} />
                              </View>
                        </TouchableOpacity>

                        {/*-------------------------------------------------- Items Adder -------------------------------------------------- */}
                        {this.state.isProjectAdderOpen ? (
                              <ProjectAdder type={this.state.projectType} closeProjectAdder={this.closeProjectAdder} />
                        ) : null}
                        <NavigationView openDateMover={() => this.openDateMover()} navigation={this.props.navigation} />
                  </View>
            );
      }
}

function mapStateToProp(state, ownProps) {
      return {
            general: state.general
      };
}

export default connect(
      mapStateToProp,
      mapDispatchToProps
)(ProjectsScreen);

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: 'white'
      },
      header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            paddingHorizontal: 12,
            marginTop: 50
      },
      addButtonContainer: {
            width: 60,
            height: 60,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: height / 2 - 60,
            right: -20,
            zIndex: 9,
            elevation: 6
      },
      addButton: {
            width: 60,
            height: 60,
            ...Platform.select({
                  ios: {
                        paddingTop: 5
                  }
            }),
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'blue',
            borderRadius: 30,
            elevation: 5,
            shadowColor: 'black',
            shadowOffset: { width: 0, height: 0.5 * 5 },
            shadowOpacity: 0.3,
            shadowRadius: 0.8 * 5
      }
});

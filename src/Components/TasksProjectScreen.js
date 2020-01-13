// STATIC UI
import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, Alert, BackHandler } from 'react-native';
import { Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TasksProjectList from './TasksProjectList2';
import NavigationView from './NavigationView';
import ProjectAdder from './Elements/ProjectAdder';
import TaskAdder from './Elements/TaskAdder';
import TaskMenu from './Elements/TaskMenu';
import Menu, { MenuItem } from 'react-native-material-menu';

// ANIMATED UI

// DATA
import { connect } from 'react-redux';
import { deleteProjectAction } from '../Store/actions/projectAction';
import { closeTaskMenuAction, openTaskAdderAction, closeTaskAdderAction } from '../Store/actions/generalAction';
function mapDispatchToProps(dispatch) {
      return {
            // PROJECTS
            deleteProjectProp: projectId => dispatch(deleteProjectAction(projectId)),
            // GENERAL
            closeTaskMenuProp: () => dispatch(closeTaskMenuAction()),
            openTaskAdderProp: () => dispatch(openTaskAdderAction()),
            closeTaskAdderProp: () => dispatch(closeTaskAdderAction())
      };
}

// HELPERS
const { width, height } = Dimensions.get('window');

class TasksProjectScreen extends Component {
      constructor(props) {
            super(props);
            this.state = {
                  isAddItemMenuOpen: false,
                  isTaskAdderOpen: false,
                  isProjectAdderOpen: false,
                  projectType: ''
            };
      }

      componentDidMount() {
            this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
      }

      componentDidUpdate() {
            if (this.props.general.isTaskMenuOpen === true && this.state.isProjectAdderOpen === true) {
                  this.setState({
                        projectType: '',
                        isProjectAdderOpen: false
                  });
            }
      }

      componentWillUnmount() {
            this.backHandler.remove();
      }

      handleBackPress = () => {
            if (this.props.general.isTaskMenuOpen === true) {
                  this.props.closeTaskMenuProp();
                  return true;
            }

            if (this.state.isAddItemMenuOpen === true) {
                  this.setState({ isAddItemMenuOpen: false });
                  return true;
            }

            if (this.state.isTaskAdderOpen === true) {
                  this.setState({ isTaskAdderOpen: false });
                  return true;
            }

            if (this.state.isProjectAdderOpen === true) {
                  this.setState({ isProjectAdderOpen: false });
                  return true;
            }

            this.props.navigation.goBack();
            return true;
      };

      openAddItemMenu = () => {
            if (this.props.general.isTaskMenuOpen === true) {
                  this.props.closeTaskMenuProp();
            }
            if (this.props.general.isTaskAdderOpen === true) {
                  this.props.closeTaskAdderProp();
            }
            this.setState({ isAddItemMenuOpen: true, isProjectAdderOpen: false });
      };

      openProjectAdder = type => {
            this.setState({
                  projectType: type,
                  isAddItemMenuOpen: false,
                  isProjectAdderOpen: true
            });
            if (this.props.general.isTaskMenuOpen === true) {
                  this.props.closeTaskMenuProp();
            }
      };

      openTaskAdder = () => {
            this.setState({
                  isAddItemMenuOpen: false
            });
            this.props.openTaskAdderProp();
      };

      closeProjectAdder = () => {
            this.setState({
                  projectType: '',
                  isProjectAdderOpen: false
            });
      };

      deleteProject = id => {
            Alert.alert(
                  'Be careful!',
                  'You will delete this project and all the tasks it contains, this action is irreversible.',
                  [
                        {
                              text: 'Cancel',
                              style: 'cancel'
                        },
                        {
                              text: 'Delete project',
                              onPress: () => {
                                    this.props.deleteProjectProp(id);
                                    this.menu.hide();
                                    this.props.navigation.goBack();
                              }
                        }
                  ],
                  { cancelable: true }
            );
      };

      render() {
            let { name, id } = this.props.navigation.state.params;
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
                                          onPress={() => this.openTaskAdder('task')}
                                    >
                                          <Text>Add a task</Text>
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
                                          onPress={() => this.openProjectAdder('tasksCategory')}
                                    >
                                          <Text>Add a headline</Text>
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
                              <Text style={{ fontWeight: '900', fontSize: 36 }}>{name + ' '}</Text>
                              <Menu
                                    ref={ref => (this.menu = ref)}
                                    button={
                                          <TouchableOpacity onPress={() => this.menu.show()}>
                                                <Ionicons name="ios-more" size={32} color={'black'} />
                                          </TouchableOpacity>
                                    }
                              >
                                    <MenuItem
                                          onPress={() => {
                                                this.deleteProject(id);
                                          }}
                                          children={<Text>Delete project</Text>}
                                    />
                              </Menu>
                        </View>
                        <TasksProjectList style={{ zIndex: 10 }} navigation={this.props.navigation} />
                        {/* <TasksProjectList style={{ zIndex: 10 }} /> */}

                        {/* ------------------------------------------ Add Items Button ------------------------------------------ */}
                        <TouchableOpacity style={styles.addButtonContainer} onPress={this.openAddItemMenu}>
                              <View style={styles.addButton}>
                                    <Ionicons name="ios-add" size={50} color={'white'} />
                              </View>
                        </TouchableOpacity>

                        {/*-------------------------------------------------- Items Adder -------------------------------------------------- */}
                        {this.state.isProjectAdderOpen ? (
                              <ProjectAdder
                                    type={this.state.projectType}
                                    projectId={id}
                                    closeProjectAdder={this.closeProjectAdder}
                              />
                        ) : null}

                        <TaskMenu />
                        {this.props.general.isTaskAdderOpen ? <TaskAdder projectId={id} /> : null}

                        <TouchableOpacity style={styles.backButton} onPress={() => this.props.navigation.goBack()}>
                              <Ionicons name="ios-arrow-back" size={30} color={'blue'} />
                        </TouchableOpacity>
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
)(TasksProjectScreen);

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
      },
      backButton: {
            width: 60,
            height: 60,
            marginBottom: 36,
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            borderRadius: 30,
            elevation: 2,
            shadowColor: 'black',
            shadowOffset: { width: 0, height: 0.5 * 5 },
            shadowOpacity: 0.3,
            shadowRadius: 0.8 * 5
      }
});

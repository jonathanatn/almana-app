import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { connect } from 'react-redux';

import {
      editTaskCompletionAction,
      addRepeatedTaskCompletionAction,
      deleteRepeatedTaskCompletionAction
} from '../../Store/actions/taskAction';
import { closeTaskMenuAction } from '../../Store/actions/generalAction';

function mapDispatchToProps(dispatch) {
      return {
            editTaskCompletionProp: (state, id) => dispatch(editTaskCompletionAction(state, id)),
            addRepeatedTaskCompletionProp: (id, date, datesArray) =>
                  dispatch(addRepeatedTaskCompletionAction(id, date, datesArray)),
            deleteRepeatedTaskCompletionProp: (id, date, datesArray) =>
                  dispatch(deleteRepeatedTaskCompletionAction(id, date, datesArray)),

            // GENERAL
            closeTaskMenuProp: () => dispatch(closeTaskMenuAction())
      };
}

class Task extends Component {
      state = {
            completed: false
      };

      componentDidMount() {
            let completed = this.props.completed;
            if (this.props.dateSelectedDateMover !== this.props.date && this.props.mainScreen) {
                  completed = false;
                  // Check for back compatibility
                  this.props.completedArray &&
                        this.props.completedArray.map(item => {
                              if (item === this.props.dateSelectedDateMover) {
                                    completed = true;
                              }
                        });
            }

            this.setState({
                  completed: completed
            });
      }

      componentDidUpdate(prevProps, prevState) {
            if (
                  this.props.completedArray !== prevState.completedArray ||
                  (this.props.completed !== prevState.completed &&
                        this.props.dateSelectedDateMover === this.props.date) ||
                  (this.props.completed !== prevState.completed && !this.props.mainScreen) ||
                  this.props.dateSelectedDateMover !== prevState.date
            ) {
                  let completed = this.props.completed;
                  if (this.props.dateSelectedDateMover !== this.props.date && this.props.mainScreen) {
                        completed = false;
                        // Check for back compatibility
                        this.props.completedArray &&
                              this.props.completedArray.map(item => {
                                    if (item === this.props.dateSelectedDateMover) {
                                          completed = true;
                                    }
                              });
                  }

                  this.setState({
                        completed: completed,
                        completedArray: this.props.completedArray,
                        date: this.props.dateSelectedDateMover
                  });
            }
      }

      toggleCompletion = () => {
            let { id, completed, dateSelectedDateMover } = this.props;
            let completedArray = this.props.completedArray ? this.props.completedArray : [];

            if (this.props.general.isTaskMenuOpen === true) {
                  this.props.closeTaskMenuProp();
            }

            if (!this.props.mainScreen || dateSelectedDateMover === this.props.date) {
                  this.props.editTaskCompletionProp(completed, id);
            } else {
                  if (this.state.completed === true) {
                        // console.log('arraytrue', completedArray);
                        this.setState({
                              completed: !this.state.completed
                        });
                        this.props.deleteRepeatedTaskCompletionProp(id, dateSelectedDateMover, completedArray);
                  } else if (this.state.completed === false) {
                        // console.log('arrayfalse', date);
                        this.setState({
                              completed: !this.state.completed
                        });
                        this.props.addRepeatedTaskCompletionProp(id, dateSelectedDateMover, completedArray);
                  }
            }
      };

      render() {
            return (
                  <View style={styles.componentContainer}>
                        <View
                              style={{
                                    flexDirection: 'column',
                                    width: 44,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                              }}
                        >
                              <TouchableOpacity
                                    onPress={() => this.toggleCompletion()}
                                    style={{ alignItems: 'center' }}
                              >
                                    <Ionicons
                                          name="ios-checkmark-circle-outline"
                                          size={30}
                                          color={this.state.completed ? 'red' : 'grey'}
                                    />
                                    {this.props.time && this.props.time !== '' ? (
                                          <Text style={{ fontSize: 11, color: 'grey', marginTop: -3 }}>
                                                {this.props.time.substring(0, 5)}
                                          </Text>
                                    ) : null}
                              </TouchableOpacity>
                        </View>
                        <View>
                              <Text
                                    style={{
                                          fontSize: 19,
                                          marginLeft: 8,
                                          opacity: this.state.completed ? 0.2 : 1,
                                          textDecorationLine: this.state.completed ? 'line-through' : 'none',
                                          flex: 1,
                                          paddingTop: 18
                                    }}
                              >
                                    {this.props.name.length > 30
                                          ? this.props.name.substring(0, 30) + '..'
                                          : this.props.name}
                              </Text>
                        </View>
                  </View>
            );
      }
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
      componentContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            flex: 1,
            backgroundColor: 'white'
      }
});

function mapStateToProp(state, ownProps) {
      // console.log(state.general);
      let task = state.tasks[state.general.selectedItem.id];

      return {
            task: task,
            general: state.general
      };
}

export default connect(
      mapStateToProp,
      mapDispatchToProps
)(Task);

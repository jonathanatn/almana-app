import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import { connect } from 'react-redux';
import { getToday } from '../Utils/helpers';
import { addTask, receiveTasksAction } from '../Store/actions/taskAction';

import Task from './Elements/Task';
import BottomMenu from './Elements/BottomMenu';

class AgendaView extends Component {
      state = {
            // isTaskSetterOpen: false,
            // yValue: new Animated.Value(-taskSetterHeight),
            taskName: '',
            isBottomMenuOpen: false,
            bottomMenuProps: {},
            BottomMenuId: ''
      };

      componentDidUpdate(prevProps) {
            if (this.props.date !== prevProps.date) {
                  this.props.receiveTasksProp(this.props.date);
            }
      }

      openBottomMenu = (props, id) => {
            this.setState({
                  isBottomMenuOpen: !this.state.isBottomMenuOpen,
                  bottomMenuProps: props,
                  BottomMenuId: id
            });
      };

      render() {
            let tasksId = [...this.props.tasks.tasksId];
            let { tasksDetails } = this.props.tasks;
            return (
                  <View style={styles.container}>
                        <Text>DATE: {this.props.date}</Text>
                        {tasksId.map((item, index) => {
                              return (
                                    <TouchableOpacity
                                          key={index}
                                          onPress={() => this.openBottomMenu(tasksDetails[item], item)}
                                          style={{ zIndex: 0 }}
                                    >
                                          <Task {...tasksDetails[item]} />
                                    </TouchableOpacity>
                              );
                        })}
                        {this.state.isBottomMenuOpen ? (
                              <BottomMenu {...this.state.bottomMenuProps} id={this.state.BottomMenuId} />
                        ) : null}
                  </View>
            );
      }
}

function mapStateToProp(state, ownProps) {
      let tasks = state.tasks[ownProps.date] ? state.tasks[ownProps.date] : {};

      console.log('TASKS', tasks);

      return {
            dateProps: ownProps.date,
            tasks: Object.values(tasks),
            tasks: {
                  tasksId: Object.keys(tasks),
                  tasksDetails: tasks
            }
      };
}

function mapDispatchToProps(dispatch) {
      return {
            receiveTasksProp: date => dispatch(receiveTasksAction(date)),
            addTask: task => dispatch(addTask(task))
      };
}

export default connect(
      mapStateToProp,
      mapDispatchToProps
)(AgendaView);

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: 'white',
            marginTop: 50
      }
});

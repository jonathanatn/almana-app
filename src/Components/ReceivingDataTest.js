import React, { Component } from 'react';
import {
      StyleSheet,
      Text,
      View,
      TouchableOpacity,
      TextInput,
      Dimensions,
      Animated,
      TouchableWithoutFeedback
} from 'react-native';
import { connect } from 'react-redux';
import { addTaskAction, receiveTasksAction } from '../Store/actions/taskAction';
// import { firestoreConnect } from 'react-redux-firebase';
// import { compose } from 'redux';
import { getToday } from '../Utils/helpers';

import Task from './Elements/Task';
import ItemMenu from './Elements/ItemMenu';

class ReceivingDataTest extends Component {
      state = {
            // isTaskSetterOpen: false,
            // yValue: new Animated.Value(-taskSetterHeight),
            taskName: '',
            isBottomMenuOpen: false,
            bottomMenuProps: {},
            BottomMenuId: ''
      };

      componentDidMount() {
            // await this.setState({
            //       date: getToday
            // });
            this.props.receiveTasksProp(getToday);
      }

      submitTask = () => {
            const date = new Date();
            const taskName = this.state.taskName;

            this.props.addTaskProp({
                  name: taskName,
                  dateAdded: date,
                  completed: false,
                  subtask: {},
                  date: '',
                  time: '',
                  reminder: '',
                  reccurency: '',
                  labels: [],
                  projectId: '',
                  position: -1
            });
      };

      openBottomMenu = (props, id) => {
            this.setState({
                  isBottomMenuOpen: !this.state.isBottomMenuOpen,
                  bottomMenuProps: props,
                  BottomMenuId: id
            });
      };

      toggleAddItemView = () => {};

      render() {
            let tasksId = [...this.props.tasks.tasksId];
            let { tasksDetails } = this.props.tasks;
            // console.log(tasksId);

            return (
                  <View style={styles.container}>
                        {/* <TouchableOpacity style={styles.addButtonContainer} onPress={this.toggleAddItemView}>
                              <View style={styles.addButton}></View>
                        </TouchableOpacity> */}
                        {/* <Text style={{ fontWeight: '900', fontSize: 36 }}>Today</Text> */}
                        <TextInput
                              style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                              onChangeText={text => this.setState({ taskName: text })}
                              //   value={this.state.text}
                        />
                        <TouchableOpacity onPress={this.submitTask}>
                              <Text>Add task</Text>
                        </TouchableOpacity>
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
                              <ItemMenu {...this.state.bottomMenuProps} id={this.state.BottomMenuId} />
                        ) : null}
                  </View>
            );
      }
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: 'white',
            marginTop: 50
      },
      addButtonContainer: {
            width: 80,
            height: 80,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: height / 2 - 60,
            right: -30,
            zIndex: 1
      },
      addButton: {
            width: 60,
            height: 60,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'blue',
            shadowColor: '#333',
            shadowOpacity: 0.1,
            shadowOffset: { x: 2, y: 0 },
            shadowRadius: 2,
            borderRadius: 30
            // position: 'absolute',
            // top: height / 2 - 60,
            // right: -30
      }
});

function mapStateToProp(state) {
      let tasks = state.tasks ? state.tasks : {};

      return {
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
            addTaskProp: task => dispatch(addTaskAction(task))
      };
}

// export default compose(
//       connect(
//             mapStateToProp,
//             mapDispatchToProps
//       ),
//       firestoreConnect([
//             {
//                   collection: 'tasks'
//             }
//       ])
// )(ReceivingDataTest);

export default connect(
      mapStateToProp,
      mapDispatchToProps
)(ReceivingDataTest);

//RULES
// match /tasks/{task} {
//       allow read, write: if request.auth.uid != null
//     }
//     match /userId/{task} {
//       allow read, write: if request.auth.uid != null
//     }
//     match /users/{userId} {
//     	allow create
//       allow read: if request.auth.uid != null
//       allow write: if request.auth.uid == userId
//     }

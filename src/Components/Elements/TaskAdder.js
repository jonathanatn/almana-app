// TODO: Add a Time Picker (Datetime picker mode close the keyboard)
import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, TextInput, KeyboardAvoidingView } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { connect } from 'react-redux';
import { addTaskAction, receiveTasksAction, editTasksPositionAction } from '../../Store/actions/taskAction';
import { getToday } from '../../Utils/helpers';

class TaskAdder extends Component {
      state = {
            isDateTimePickerVisible: false,
            textInput: '',
            date: '',
            time: ''
      };

      componentDidMount() {
            this.inputRef.focus();

            this.setState({
                  date: getToday
            });
      }

      showDateTimePicker = () => {
            this.setState({ isDateTimePickerVisible: true });
      };

      hideDateTimePicker = () => {
            this.setState({ isDateTimePickerVisible: false });
      };

      handleDateTimePicked = dateTimeReceived => {
            let date = moment(dateTimeReceived).format('L');
            //     let time = moment(dateTimeReceived).format('LT');

            this.setState({
                  date: date
            });

            this.hideDateTimePicker();
      };

      handleText(text) {
            this.setState({
                  textInput: text
            });
      }

      addTask() {
            let taskDate = this.state.date;

            if (this.state.textInput.length !== 0) {
                  const date = new Date();
                  this.props.addTaskProp({
                        name: this.state.textInput,
                        dateAdded: date,
                        completed: false,
                        subtask: {},
                        date: taskDate,
                        time: '',
                        reminder: '',
                        reccurency: '',
                        labels: [],
                        projectId: '',
                        position: -1
                  });
            }

            this.setState({
                  textInput: '',
                  time: ''
            });
            this.inputRef.clear();
      }

      render() {
            return (
                  <KeyboardAvoidingView
                        style={{ backgroundColor: 'white' }}
                        //FIXME: Weird effect, the component come faster than the keyboard, try with padding
                        behavior="padding"
                  >
                        <View style={[styles.container, { flexDirection: 'row' }]}>
                              <TouchableOpacity onPress={() => this.showDateTimePicker()}>
                                    <Ionicons name="ios-calendar" size={30} color={'grey'} />
                              </TouchableOpacity>
                              {/* <Ionicons name="md-notifications-outline" size={30} color={'grey'} />
                              <Ionicons name="md-pricetag" size={30} color={'grey'} />
			      <Ionicons name="ios-add-circle" size={30} color={'grey'} />
			      <Ionicons name="md-folder" size={30} color={'grey'} />
			      <Ionicons name="md-person" size={30} color={'grey'} /> */}
                              <TextInput
                                    ref={ref => (this.inputRef = ref)}
                                    style={styles.textInput}
                                    returnKeyType="done"
                                    onChangeText={text => this.setState({ textInput: text })}
                                    onSubmitEditing={event => this.addTask()}
                              />
                              <TouchableOpacity onPress={() => this.addTask()}>
                                    <Ionicons
                                          name="md-send"
                                          size={30}
                                          color={this.state.textInput.length > 0 ? 'red' : 'grey'}
                                    />
                              </TouchableOpacity>
                        </View>

                        <DateTimePicker
                              mode={'date'}
                              isVisible={this.state.isDateTimePickerVisible}
                              onConfirm={this.handleDateTimePicked}
                              onCancel={this.hideDateTimePicker}
                        />
                  </KeyboardAvoidingView>
            );
      }
}

function mapDispatchToProps(dispatch) {
      return {
            addTaskProp: task => dispatch(addTaskAction(task))
      };
}

export default connect(
      null,
      mapDispatchToProps
)(TaskAdder);

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
      container: {
            //     zIndex: 2,
            backgroundColor: 'white',
            width: width,
            bottom: 0,
            padding: 16,
            shadowRadius: 2,
            shadowOffset: {
                  width: 0,
                  height: -3
            },
            shadowColor: '#000000',
            elevation: 24,
            shadowOpacity: 1,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15
      },
      textInput: {
            borderRadius: 50,
            flex: 1,
            height: 30,
            bottom: 0,
            backgroundColor: 'white',
            zIndex: 2,
            paddingHorizontal: 10,
            marginHorizontal: 16,
            borderWidth: 1,
            borderColor: 'grey'
      }
});

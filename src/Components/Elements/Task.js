import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { connect } from 'react-redux';

import { editTaskCompletionAction } from '../../Store/actions/taskAction';

class Task extends Component {
      state = {
            completed: ''
      };

      componentDidMount() {
            this.setState({
                  completed: this.props.completed
            });
      }

      toggleCompletion = () => {
            this.setState(
                  {
                        completed: !this.state.completed
                  },
                  () => {
                        this.props.editTaskCompletionProp(this.state.completed, this.props.id);
                  }
            );
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
                                          color={this.props.completed ? 'red' : 'grey'}
                                    />
                                    {this.props.time !== '' && (
                                          <Text style={{ fontSize: 11, color: 'grey', marginTop: -3 }}>
                                                {this.props.time.substring(0, 5)}
                                          </Text>
                                    )}
                              </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={() => this.props.openItemMenu()}>
                              <Text
                                    style={{
                                          fontSize: 19,
                                          lineHeight: 34,
                                          marginLeft: 8,
                                          color: this.props.completed ? 'grey' : 'black',
                                          height: 40,
                                          flex: 1
                                    }}
                              >
                                    {this.props.name}
                              </Text>
                        </TouchableOpacity>
                  </View>
            );
      }
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
      componentContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            // marginVertical: 5,
            paddingHorizontal: 12,
            flex: 1
            // backgroundColor: 'blue'
            // height: 44
      }
});

function mapDispatchToProps(dispatch) {
      return {
            editTaskCompletionProp: (state, id) => dispatch(editTaskCompletionAction(state, id))
      };
}

export default connect(
      null,
      mapDispatchToProps
)(Task);

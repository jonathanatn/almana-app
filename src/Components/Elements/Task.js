import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { connect } from 'react-redux';

import { editTaskCompletionAction } from '../../Store/actions/taskAction';

class Task extends Component {
      toggleCompletion = () => {
            this.props.editTaskCompletionProp(this.props.completed, this.props.id);
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
                                          opacity: this.props.completed ? 0.2 : 1,
                                          textDecorationLine: this.props.completed ? 'line-through' : 'none',
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

function mapDispatchToProps(dispatch) {
      return {
            editTaskCompletionProp: (state, id) => dispatch(editTaskCompletionAction(state, id))
      };
}

function mapStateToProp(state, ownProps) {
      // console.log(state.general);
      let task = state.tasks[state.general.selectedItem.id];

      return {
            task: task
      };
}

export default connect(
      mapStateToProp,
      mapDispatchToProps
)(Task);

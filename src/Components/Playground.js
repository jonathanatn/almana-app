// STATIC UI
import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ANIMATED UI

// DATA
import { connect } from 'react-redux';
import { receiveTasksAction } from '../Store/actions/taskAction';
function mapDispatchToProps(dispatch) {
      return {
            receiveTasksProp: date => dispatch(receiveTasksAction(date))
      };
}

// HELPERS
import { getToday } from '../Utils/helpers';
import moment from 'moment';
const { width, height } = Dimensions.get('window');

class Template extends Component {
      state = {};

      componentDidMount() {
            this.props.receiveTasksProp();
      }

      componentDidUpdate(prevProps) {}

      render() {
            return (
                  <View style={styles.container}>
                        <Text>Canvas</Text>
                  </View>
            );
      }
}

function mapStateToProp(state, ownProps) {
      return {};
}

export default connect(
      mapStateToProp,
      mapDispatchToProps
)(Template);

const styles = StyleSheet.create({
      container: {
            flex: 1
      }
});

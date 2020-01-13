// STATIC UI
import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Menu, { MenuItem } from 'react-native-material-menu';
import ProjectAdder from '../ProjectAdder';

// ANIMATED UI

// DATA
import { connect } from 'react-redux';
import { deleteProjectItemsAction } from '../../../Store/actions/projectAction';
function mapDispatchToProps(dispatch) {
      return {
            deleteProjectItemsProp: items => dispatch(deleteProjectItemsAction(items))
      };
}
// HELPERS

class MoreMenu extends Component {
      render() {
            return (
                  <View style={styles.container}>
                        <Menu
                              ref={ref => (this.menu = ref)}
                              button={
                                    <TouchableOpacity onPress={() => this.menu.show()}>
                                          <Ionicons name="ios-more" size={24} color={'black'} />
                                    </TouchableOpacity>
                              }
                        >
                              <MenuItem
                                    onPress={() => {
                                          this.props.deleteProjectItemsProp([this.props.item]);
                                          this.menu.hide();
                                    }}
                                    children={<Text>Delete headline</Text>}
                              />
                        </Menu>
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
)(MoreMenu);

const styles = StyleSheet.create({
      container: {
            backgroundColor: 'white'
      }
});

// STATIC UI
import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';

// ANIMATED UI

// DATA
import { connect } from 'react-redux';
function mapDispatchToProps(dispatch) {
      return {};
}

// HELPERS

class RepeatButton extends Component {
      state = {
            repeat: 'never'
      };

      setRepeat(repeat) {
            let id = this.props.general.selectedItem.id;
            this.setState(
                  {
                        repeat: repeat
                  },
                  () => {
                        // Update parent prop to fire change in the UI
                        this.props.setRepeat(repeat);
                  }
            );
      }

      render() {
            return (
                  <View style={styles.container}>
                        <Menu
                              ref={ref => (this.menu = ref)}
                              button={
                                    this.props.repeat === 'never' ? (
                                          <TouchableOpacity onPress={() => this.menu.show()}>
                                                <Ionicons name="ios-repeat" size={30} color={'grey'} />
                                          </TouchableOpacity>
                                    ) : (
                                          <View style={{ flexDirection: 'row' }}>
                                                <TouchableOpacity
                                                      onPress={() => this.menu.show()}
                                                      style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            backgroundColor: '#FF2D55',
                                                            borderRadius: 100,
                                                            padding: 4,
                                                            paddingHorizontal: 12,
                                                            marginBottom: 12
                                                      }}
                                                >
                                                      <Ionicons name="ios-repeat" size={24} color="white" />
                                                      <Text style={{ color: 'white', marginLeft: 8, marginBottom: 3 }}>
                                                            {this.props.repeat}
                                                      </Text>
                                                </TouchableOpacity>
                                          </View>
                                    )
                              }
                        >
                              <MenuItem
                                    onPress={() => {
                                          this.menu.hide();
                                    }}
                                    disabled
                                    children={<Text>Repeat: </Text>}
                              />
                              <MenuDivider />
                              <MenuItem
                                    onPress={() => {
                                          this.setRepeat('never');
                                          this.menu.hide();
                                    }}
                                    children={<Text>Never</Text>}
                              />
                              <MenuItem
                                    onPress={() => {
                                          this.setRepeat('daily');
                                          this.menu.hide();
                                    }}
                                    children={<Text>Every day</Text>}
                              />
                              <MenuItem
                                    onPress={() => {
                                          this.setRepeat('weekly');
                                          this.menu.hide();
                                    }}
                                    children={<Text>Every week</Text>}
                              />
                              <MenuItem
                                    onPress={() => {
                                          this.setRepeat('monthly');
                                          this.menu.hide();
                                    }}
                                    children={<Text>Every month</Text>}
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
)(RepeatButton);

const styles = StyleSheet.create({
      container: {
            backgroundColor: 'white'
      }
});

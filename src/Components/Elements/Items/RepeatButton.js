// STATIC UI
import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';

// ANIMATED UI

// DATA
import { connect } from 'react-redux';
import { setEventRepeatAction } from '../../../Store/actions/eventAction';
function mapDispatchToProps(dispatch) {
      return {
            setEventRepeatProp: (id, repeat) => dispatch(setEventRepeatAction(id, repeat))
      };
}

// HELPERS
// import { getToday } from '../Utils/helpers';
// import moment from 'moment';
// const { width, height } = Dimensions.get('window');

class RepeatButton extends Component {
      state = {
            repeat: 'never'
      };

      componentDidMount() {
            // Differentiate data coming from ItemMenu or ItemAdder
            if (this.props.repeat) {
                  this.setState({
                        repeat: this.props.repeat
                  });
            }
            // this.setState({
            //       repeat: this.props.general.selectedItem.repeat
            // });
      }

      setRepeat(repeat) {
            // Update parent prop to fire change in the UI
            // this.props.setRepeat(repeat);

            let id = this.props.general.selectedItem.id;
            this.setState(
                  {
                        repeat: repeat
                  },
                  () => {
                        this.props.setRepeat(repeat);
                        // this.props.setEventRepeatProp(id, repeat);
                  }
            );
      }

      render() {
            return (
                  <View style={styles.container}>
                        {/* <TouchableOpacity onPress={() => this.menu.show()}>
                        <Ionicons
                              name="ios-repeat"
                              size={30}
                              //       color={this.state.reminder.time !== 'none' ? '#FF2D55' : 'grey'}
                              color={'#FF2D55'}
                        />
                  </TouchableOpacity> */}

                        <Menu
                              ref={ref => (this.menu = ref)}
                              button={
                                    this.state.repeat === 'never' ? (
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
                                                            {this.state.repeat}
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

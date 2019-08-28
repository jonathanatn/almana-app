import React, { Component, useRef, useState } from 'react';
import { StyleSheet, View, Button } from 'react-native';
import { State, TapGestureHandler } from 'react-native-gesture-handler';
import Animated, { Easing, Transitioning, Transition } from 'react-native-reanimated';

const {
      cond,
      eq,
      set,
      neq,
      and,
      Value,
      event,
      Clock,
      startClock,
      stopClock,
      timing,
      block,
      interpolate,
      Extrapolate
} = Animated;

const column = {
      id: 'column',
      name: 'Column',
      layout: {
            container: {
                  // flexDirection: "column"
            }
      }
};

const row = {
      id: 'row',
      name: 'Row',
      layout: {
            container: {
                  // flexDirection: 'row',
                  marginTop: 400
            }
      }
};

const wrap = {
      id: 'wrap',
      name: 'Wrap',
      layout: {
            container: {
                  // flexDirection: 'row',
                  // flexWrap: 'wrap',
                  marginTop: 300
            },
            child: {
                  flex: 0,
                  width: 180
            }
      }
};

// const currentLayout = wrap.layout;

const layouts = [column, row, wrap];

const transition = <Transition.Change durationMs={400} interpolation="easeInOut" />;
// const ref = useRef(null);

export default () => {
      const [currentLayout, setCurrentLayout] = useState(layouts[0].layout);

      const ref = useRef(null);

      return (
            <Transitioning.View style={[styles.container, currentLayout.container]} ref={ref} transition={transition}>
                  {/* <TapGestureHandler minDist={0} onHandlerStateChange={this.onStateChange}> */}
                  <Transitioning.View style={[styles.rect, currentLayout.child]} />
                  <Transitioning.View style={[styles.rect, currentLayout.child]} />
                  <Transitioning.View style={[styles.rect, currentLayout.child]} />
                  {/* </TapGestureHandler> */}

                  {layouts.map(layout => (
                        <Button
                              key={layout.id}
                              title={layout.name}
                              isSelected={layout.layout === currentLayout}
                              onPress={() => {
                                    if (ref.current) {
                                          ref.current.animateNextTransition();
                                    }
                                    setCurrentLayout(layout.layout);
                              }}
                        />
                  ))}
            </Transitioning.View>
      );
};

const styles = StyleSheet.create({
      container: {
            flex: 1,
            marginTop: 100
      },
      rect: {
            width: 100,
            height: 50,
            backgroundColor: 'tomato',
            margin: 10
      }
});

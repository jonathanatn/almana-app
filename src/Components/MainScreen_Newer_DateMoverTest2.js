import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Animated, { Easing } from 'react-native-reanimated';
import { loop } from 'react-native-redash';
import { useMemoOne } from 'use-memo-one';

import SimpleActivityIndicator from './MainScreen_Newer_DateMoverTest';

const { Clock, Value, useCode, set, block, cond, startClock, stopClock, clockRunning, and, not, timing } = Animated;

const styles = StyleSheet.create({
      container: {
            flex: 1,
            justifyContent: 'space-between',
            backgroundColor: 'white'
      }
});

const runTiming = clock => {
      const state = {
            finished: new Value(0),
            position: new Value(0),
            frameTime: new Value(0),
            time: new Value(0)
      };

      const config = {
            toValue: new Value(100),
            duration: 1000,
            easing: Easing.linear
      };

      return block([cond(not(clockRunning(clock)), startClock(clock)), timing(clock, state, config), state.position]);
};

export default () => {
      const [play, setPlay] = useState(true);
      const { clock, isPlaying, progress } = useMemoOne(
            () => ({
                  clock: new Clock(),
                  isPlaying: new Value(0),
                  progress: new Value(0)
            }),
            []
      );
      isPlaying.setValue(play ? 1 : 0);
      useCode(
            block([
                  cond(and(isPlaying, not(clockRunning(clock))), startClock(clock)),
                  cond(and(not(isPlaying), clockRunning(clock)), stopClock(clock)),
                  set(
                        progress,
                        runTiming(clock)
                        // loop({
                        //       clock,
                        //       duration: 1000,
                        //       easing: Easing.inOut(Easing.ease),
                        //       boomerang: true,
                        //       autoStart: false
                        // })
                  )
            ]),
            []
      );
      return (
            <View style={styles.container}>
                  <SimpleActivityIndicator {...{ progress }} />
                  {/* <Button
        label={play ? "Pause" : "Play"}
        primary
        onPress={() => setPlay(!play)}
      /> */}

                  <TouchableOpacity onPress={() => setPlay(!play)}>
                        <Text>{play ? 'Pause' : 'Play'} </Text>
                  </TouchableOpacity>
            </View>
      );
};

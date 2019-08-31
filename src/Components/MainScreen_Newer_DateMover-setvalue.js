import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Animated, { Easing } from 'react-native-reanimated';
import { useMemoOne } from 'use-memo-one';

const {
      Clock,
      Value,
      useCode,
      set,
      block,
      cond,
      startClock,
      stopClock,
      clockRunning,
      and,
      not,
      interpolate,
      timing
} = Animated;

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

// FIXME: Try clock
export default () => {
      const progress = new Value(0);
      const clock = new Clock();

      // useCode(block([set(progress, runTiming(clock))]), []);

      const [close, setClose] = useState(true);

      const [transY, setTransY] = useState(new Value(0));

      // const { transY } = useMemoOne(
      //       () => ({
      //             transY: new Value(0)
      //       }),
      //       []
      // );

      // transY.setValue(!close ? 100 : 0);

      transY.setValue(!close ? runTiming(clock) : 0);

      return (
            <View style={styles.container}>
                  <Animated.View
                        style={{ width: 60, height: 60, backgroundColor: 'blue', transform: [{ translateY: transY }] }}
                  ></Animated.View>

                  <TouchableOpacity onPress={() => setClose(!close)}>
                        <Text>button</Text>
                  </TouchableOpacity>
            </View>
      );
};

// // FIXME: Simple Toggle
// export default () => {
//       const [close, setClose] = useState(true);

//       const [transY, setTransY] = useState(new Value(0));

//       // const { transY } = useMemoOne(
//       //       () => ({
//       //             transY: new Value(0)
//       //       }),
//       //       []
//       // );

//       transY.setValue(!close ? 100 : 0);

//       return (
//             <View style={styles.container}>
//                   <Animated.View
//                         style={{ width: 60, height: 60, backgroundColor: 'blue', transform: [{ translateY: transY }] }}
//                   ></Animated.View>

//                   <TouchableOpacity onPress={() => setClose(!close)}>
//                         <Text>button</Text>
//                   </TouchableOpacity>
//             </View>
//       );
// };

  import React, { useEffect } from 'react';
  import { useWindowDimensions, StyleSheet } from 'react-native';
  import { Canvas, Points, vec } from '@shopify/react-native-skia';
  import {
    useSharedValue,
    withRepeat,
    withTiming,
    Easing,
    useDerivedValue,
    configureReanimatedLogger,
    ReanimatedLogLevel
  } from 'react-native-reanimated';

  // Suppress the "Reading from value during component render" warning.
  // This warning often triggers as a false positive with third-party libraries like Skia
  // even when using the correct useDerivedValue pattern.
  configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false,
  });

  export default function WaterBackground() {
    const { width, height } = useWindowDimensions();
    const time = useSharedValue(0);

    useEffect(() => {
      // Slower, more liquid-like timing
      time.value = withRepeat(
        withTiming(Math.PI * 2, {
          duration: 20000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    }, [time]);

    // Wave configuration optimized for "flow"
    const rows = 22;
    const cols = 50;
    const xGap = width / (cols - 1);
    const yGap = 8;
    const yBase = height * 0.63;

    // Calculate points entirely on the UI thread
    const animatedPoints = useDerivedValue(() => {
      const p = [];
      const t = time.value;

      for (let r = 0; r < rows; r++) {
        const depthFactor = r / rows;
        for (let c = 0; c < cols; c++) {
          const x = c * xGap;

          // Complex interference for a realistic water flow look
          const wave1 = Math.sin(x * 0.008 + t + r * 0.3) * (18 + depthFactor * 12);
          const wave2 = Math.sin(x * 0.02 - t * 0.6 + r * 0.4) * 6;

          const y = yBase + (r * yGap) + wave1 + wave2;

          // Horizontal sway to simulate liquid volume drift
          const xOffset = Math.cos(x * 0.005 + t * 0.3 + r * 0.15) * 8;

          p.push(vec(x + xOffset, y));
        }
      }
      return p;
    }, [width, height, time]);

    return (
      <Canvas style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]}>
        <Points
          points={animatedPoints}
          mode="points"
          color="rgba(0, 242, 255, 0.35)"
          strokeWidth={1.8}
          strokeCap="round"
        />
      </Canvas>
    );
  }

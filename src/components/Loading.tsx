import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

interface LoadingProps {
  size?: number;
  color?: string;
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 100,
  color = "#1A3F8B",
  message = "Please Wait",
}) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const dotsRef = useRef(
    Array.from({ length: 4 }, () => new Animated.Value(0.2)),
  ).current;

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    spinLoop.start();

    const dotLoops = dotsRef.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.2,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.delay(800),
        ]),
      ),
    );
    dotLoops.forEach((loop) => loop.start());

    return () => {
      spinLoop.stop();
      dotLoops.forEach((loop) => loop.stop());
    };
  }, [dotsRef, spinAnim]);

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const border = size * 0.05;

  return (
    <View style={styles.wrapper}>
      <View
        style={{
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: border,
            borderColor: "#D1D5DB",
          }}
        />

        <Animated.View
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: border,
            borderTopColor: color,
            borderRightColor: color,
            borderBottomColor: "transparent",
            borderLeftColor: "transparent",
            transform: [{ rotate }],
          }}
        />
      </View>

      <View style={styles.labelRow}>
        <Text style={styles.labelText}>LOADING</Text>
        {dotsRef.map((dot, i) => (
          <Animated.Text key={i} style={[styles.dot, { opacity: dot }]}>
            .
          </Animated.Text>
        ))}
      </View>

      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

export default Loading;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  labelText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0D1B2A",
    letterSpacing: 1.5,
  },
  dot: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0D1B2A",
    lineHeight: 32,
  },
  message: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 21,
  },
});

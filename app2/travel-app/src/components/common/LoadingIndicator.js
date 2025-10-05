import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const LoadingIndicator = ({
  size = "large",
  color,
  text,
  type = "spinner",
  overlay = false,
  fullScreen = false,
  gradient = ["#667eea", "#764ba2"],
  style,
}) => {
  const { t } = useTranslation();

  const spinValue = new Animated.Value(0);

  React.useEffect(() => {
    if (type === "pulse" || type === "travel") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(spinValue, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(spinValue, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else if (type === "rotate") {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [type]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const scale = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const opacity = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  const renderLoader = () => {
    switch (type) {
      case "spinner":
        return (
          <ActivityIndicator
            size={size}
            color={color || "#667eea"}
            style={styles.spinner}
          />
        );

      case "dots":
        return (
          <View style={styles.dotsContainer}>
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: color || "#667eea",
                    transform: [
                      {
                        scale: spinValue.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [1, 1.5, 1],
                        }),
                      },
                    ],
                    opacity: spinValue.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.3, 1, 0.3],
                    }),
                  },
                ]}
              />
            ))}
          </View>
        );

      case "pulse":
        return (
          <Animated.View
            style={[
              styles.pulseContainer,
              {
                transform: [{ scale }],
                opacity,
              },
            ]}
          >
            <LinearGradient
              colors={gradient}
              style={styles.pulseCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="airplane" size={24} color="#ffffff" />
            </LinearGradient>
          </Animated.View>
        );

      case "rotate":
        return (
          <Animated.View
            style={[
              styles.rotateContainer,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          >
            <LinearGradient
              colors={gradient}
              style={styles.rotateCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="compass" size={28} color="#ffffff" />
            </LinearGradient>
          </Animated.View>
        );

      case "travel":
        return (
          <View style={styles.travelContainer}>
            <Animated.View
              style={[
                styles.airplaneContainer,
                {
                  transform: [
                    {
                      translateX: spinValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-30, 30],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Ionicons name="airplane" size={32} color="#667eea" />
            </Animated.View>
            <View style={styles.travelDots}>
              {[0, 1, 2].map((index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.travelDot,
                    {
                      backgroundColor: color || "#667eea",
                      opacity: spinValue.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.3, 1, 0.3],
                      }),
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        );

      case "skeleton":
        return (
          <View style={styles.skeletonContainer}>
            <Animated.View
              style={[
                styles.skeletonLine,
                {
                  opacity: spinValue.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 0.7, 0.3],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.skeletonLine,
                styles.skeletonShort,
                {
                  opacity: spinValue.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 0.7, 0.3],
                  }),
                },
              ]}
            />
          </View>
        );

      default:
        return (
          <ActivityIndicator
            size={size}
            color={color || "#667eea"}
            style={styles.spinner}
          />
        );
    }
  };

  const containerStyle = [
    styles.container,
    overlay && styles.overlay,
    fullScreen && styles.fullScreen,
    style,
  ];

  if (fullScreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.fullScreenContent}>
          {renderLoader()}
          <Text style={styles.fullScreenText}>
            {text || t("loading") || "Loading..."}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      {renderLoader()}
      {text && (
        <Text style={[styles.text, { color: color || "#667eea" }]}>{text}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    zIndex: 999,
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenContent: {
    alignItems: "center",
    padding: 40,
  },
  fullScreenText: {
    marginTop: 20,
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "600",
    textAlign: "center",
  },
  spinner: {
    transform: [{ scale: 1.2 }],
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  pulseContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  pulseCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  rotateContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  rotateCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  travelContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  airplaneContainer: {
    marginBottom: 20,
  },
  travelDots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  travelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 6,
  },
  skeletonContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  skeletonLine: {
    height: 12,
    backgroundColor: "#e2e8f0",
    borderRadius: 6,
    marginVertical: 4,
    width: 200,
  },
  skeletonShort: {
    width: 120,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default LoadingIndicator;

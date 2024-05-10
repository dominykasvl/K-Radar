import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";

import ContentCard from "./components/ContentCard";
import GestureHandlers from "./components/GestureHandlers";

import { AppProvider } from "./context/AppContext";

import { colors } from "./assets/theme/theme";
const PlaceholderImage = require("./assets/images/background-image.png");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
    alignItems: "center",
  },
  gestureContainer: {
    ...StyleSheet.absoluteFillObject, // Fills the parent container
  },
  gradient: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});

const App = () => {
  const [screenDimensions, setScreenDimensions] = useState({
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  });

  const translateXRight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const onChange = ({ window }) => {
      setScreenDimensions({
        width: window.width,
        height: window.height,
      });
    };

    Dimensions.addEventListener("change", onChange);

    // Cleanup
    return () => {
      Dimensions.removeEventListener("change", onChange);
    };
  }, []);

  return (
    <AppProvider>
      <LinearGradient
        colors={[colors.primary, colors.accent]} // Using defined vibrant colors
        style={styles.gradient}
      >
        <GestureHandlerRootView style={styles.gestureContainer}>
          <View style={styles.container}>
            <GestureHandlers
              translateXRight={translateXRight} // Pass the translateXRight ref
              contentCard={
                <ContentCard
                  placeholderImageSource={PlaceholderImage}
                  screenHeight={screenDimensions.height} // Pass the screenHeight value
                />
              }
            ></GestureHandlers>
            <StatusBar style="light" />
          </View>
        </GestureHandlerRootView>
      </LinearGradient>
    </AppProvider>
  );
};

export default App;

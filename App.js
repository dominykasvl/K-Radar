import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";

import ContentCard from "./components/ContentCard";

import { AppProvider } from "./context/AppContext";

import { colors } from "./assets/theme/theme";
const PlaceholderImage = require("./assets/images/background-image.png");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "50%",
    alignItems: "center",
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
        <View style={styles.container}>
          <ContentCard
            placeholderImageSource={PlaceholderImage}
            screenHeight={screenDimensions.height} // Pass the screenHeight value
          />
          <StatusBar style="light" />
        </View>
      </LinearGradient>
    </AppProvider>
  );
};

export default App;

import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";

import ContentList from "../components/ContentList";
const PlaceholderImage = require("../assets/images/background-image.png");

export const FeedScreen = (props) => {
  const [screenDimensions, setScreenDimensions] = useState({
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  });
  1;

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
    <View style={styles.container}>
      <View
        style={{
          flex: 1,
          width: "100%",
          marginTop: props.marginTop ? props.marginTop : 0,
        }}
      >
        <ContentList
          placeholderImageSource={PlaceholderImage}
          screenHeight={screenDimensions.height} // Pass the screenHeight value
          cardWidth={props.cardWidth}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});

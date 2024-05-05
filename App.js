import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import ContentCard from "./components/ContentCard";
import GestureHandlers from "./components/GestureHandlers";

import { useFetchAndParse } from "./hooks/useFetchAndParse";
import config from "./config/config.json";
import storage from "./config/storage";

const PlaceholderImage = require("./assets/images/background-image.png");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
    backgroundColor: "#25292e",
    alignItems: "center",
  },
  gestureContainer: {
    ...StyleSheet.absoluteFillObject, // Fills the parent container
  },
});

const App = () => {
  const [screenDimensions, setScreenDimensions] = useState({
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  });

  const [refreshKey, setRefreshKey] = useState(0);
  const [data, setData] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(false);

  const url = config.website;

  const { error } = useFetchAndParse(url, refreshKey, setData);
  //console.log('data:', data);
  if (error !== null) {
    console.log("error:", error);
  }

  const [refreshing, setRefreshing] = useState(false);

  const translateXRight = useRef(new Animated.Value(0)).current;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    storage
      .clear()
      .then(() => {
        // Directly reset the refreshing state and increment refreshKey once storage is cleared
        setRefreshing(false);
        setRefreshKey(refreshKey + 1);
        console.log("Refreshed saved data");
      })
      .catch((error) => {
        console.error("Failed to clear storage:", error);
        // Handle any errors that occur during the storage clearing
      });
  }, [refreshKey]);

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
    <GestureHandlerRootView style={styles.gestureContainer}>
      <View style={styles.container}>
        <GestureHandlers
          translateXRight={translateXRight} // Pass the translateXRight ref
          loadingProgress={loadingProgress} // Pass the loadingProgress state
          contentCard={
            <ContentCard
              placeholderImageSource={PlaceholderImage}
              data={data}
              refreshing={refreshing}
              onRefresh={onRefresh}
              screenHeight={screenDimensions.height} // Pass the screenHeight value
            />
          } // The WebView component does not support web browsers. //TODO: Create an alternative method for opening links in the web browser.
        ></GestureHandlers>
        <StatusBar style="light" />
      </View>
    </GestureHandlerRootView>
  );
};

export default App;

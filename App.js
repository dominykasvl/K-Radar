import React, { useState, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import ContentCard from "./components/ContentCard";
import GestureHanlders from "./components/GestureHandlers";

import { useFetchAndParse } from "./hooks/useFetchAndParse";
import config from "./config/config.json";
import storage from "./config/storage";

const PlaceholderImage = require("./assets/images/background-image.png");

const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
    backgroundColor: "#25292e",
    alignItems: "center",
  },
  gestureContainer: {
    flex: 1,
    height: screenHeight,
    width: screenWidth,
    backgroundColor: "#25292e",
    alignItems: "center",
  },
});

const wait = (timeout) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};

const App = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [data, setData] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(false);

  const url = config.website;

  const { error } = useFetchAndParse(url, refreshKey, setData);
  //console.log('data:', data);
  if (error !== null) {
    console.log("error:", error);
  }

  const [showWebView, setShowWebView] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const translateXRight = useRef(new Animated.Value(0)).current;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    storage.clear().then(() => {
      wait(2000).then(() => {
        setRefreshing(false);
        setRefreshKey(refreshKey + 1);
        console.log("Refreshed saved data");
      });
    });
  }, [refreshKey]);

  return (
    <GestureHandlerRootView style={styles.gestureContainer}>
      <View style={styles.container}>
        <GestureHanlders
          showWebView={showWebView} // Pass the showWebView state
          setShowWebView={setShowWebView} // Pass the setShowWebView function
          translateXRight={translateXRight} // Pass the translateXRight ref
          loadingProgress={loadingProgress} // Pass the loadingProgress state
          contentCard={
            <ContentCard
              placeholderImageSource={PlaceholderImage}
              data={data}
              refreshing={refreshing}
              onRefresh={onRefresh}
              showWebView={showWebView} // Pass the showWebView state
              screenHeight={screenHeight} // Pass the screenHeight value
            />
          }
          // The WebView component does not support web browsers. //TODO: Create an alternative method for opening links in the web browser.
        ></GestureHanlders>
        <StatusBar style="light" />
      </View>
    </GestureHandlerRootView>
  );
};

export default App;

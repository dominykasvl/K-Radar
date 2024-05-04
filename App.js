import React, { useState, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import ContentCard from "./components/ContentCard";
import GestureHanlders from "./components/GestureHandlers";

import { useFetchAndParse } from "./hooks/useFetchAndParse";
import { onOpenWithWebBrowser } from "./utilities/NetworkTools";
import config from "./config/config.json";
import storage from "./config/storage";

const PlaceholderImage = require("./assets/images/background-image.png");

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  const [currentUrl, setCurrentUrl] = useState(null);

  const [refreshing, setRefreshing] = useState(false);

  // Assume `currentIndex` is a state variable that gets updated whenever the visible item in content card changes
  const [currentIndex, setCurrentIndex] = useState(0);

  const translateXRight = useRef(new Animated.Value(0)).current;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    storage.clear().then(() => {
      wait(2000).then(() => {
        setRefreshing(false);
        setRefreshKey(refreshKey + 1);
      });
    });
  }, [refreshKey]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
              onPress={() =>
                onOpenWithWebBrowser(currentUrl, setCurrentUrl, setShowWebView)
              }
              refreshing={refreshing}
              onRefresh={onRefresh}
              showWebView={showWebView} // Pass the showWebView state
              setCurrentIndex={setCurrentIndex} // Pass the setCurrentIndex function
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

import React, { useState, useRef } from "react";
import { View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { Animated } from "react-native";
import { WebView } from "react-native-webview";

import ContentCard from "./components/ContentCard";
import GestureHanlders from "./components/GestureHandlers";

import { useFetchAndParse } from "./hooks/useFetchAndParse";
import { useFetchAndSummarize } from "./hooks/useFetchAndSummarize";
import { onOpenWithWebBrowser, isValidUrl } from "./utilities/NetworkTools";
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
  const [currentNavUri, setCurrentNavUri] = useState(null);

  const url = config.website;
  const corsProxy = config.proxyUrl;
  const summariesAPI = config.summariesAPI;
  const domain = config.domain;

  const { error } = useFetchAndParse(url, corsProxy, refreshKey, setData);
  //console.log('data:', data);
  if (error !== null) {
    console.log("error:", error);
  }
  // const { errorWithSummaries } = useFetchAndSummarize(
  //   data,
  //   summariesAPI,
  //   corsProxy,
  //   refreshKey,
  //   setData,
  //   url,
  // );
  // if (errorWithSummaries !== null) {
  //   console.log("errorWithSummaries:", errorWithSummaries);
  // }

  const [showWebView, setShowWebView] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(null);

  const [refreshing, setRefreshing] = useState(false);

  // Assume `currentIndex` is a state variable that gets updated whenever the visible item changes
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
          setCurrentUrl={setCurrentUrl} // Pass the setCurrentUrl function
          onOpenWithWebBrowser={onOpenWithWebBrowser} // Pass the onOpenWithWebBrowser function
          currentIndex={currentIndex} // Pass the currentIndex state
          data={data} // Pass the data state
          translateXRight={translateXRight} // Pass the translateXRight ref
          loadingProgress={loadingProgress} // Pass the loadingProgress state
          setLoadingProgress={setLoadingProgress} // Pass the setLoadingProgress function
          currentNavUri={currentNavUri} // Pass the currentNavUri state
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
          webView={
            <WebView
              source={{ uri: currentUrl }}
              incognito={true}
              style={{ marginTop: 20, backgroundColor: "transparent" }}
              onShouldStartLoadWithRequest={(request) => {
                // Only allow navigating within this website
                return request.url.startsWith("https://");
              }}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.warn("WebView error: ", nativeEvent);
              }}
              onLoadEnd={() => translateXRight.setValue(0)}
              onNavigationStateChange={(navState) => {
                setCurrentNavUri(navState.url);
                setLoadingProgress(navState.loading);
                console.log("navState.loading:", navState.loading);
              }}
            />
          }
        ></GestureHanlders>
        <StatusBar style="light" />
      </View>
    </GestureHandlerRootView>
  );
};

export default App;

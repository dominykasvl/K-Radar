import React, { useEffect, useState, useRef } from 'react';
import { RefreshControl, Text, View, Platform, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import domtoimage from 'dom-to-image';
import * as WebBrowser from 'expo-web-browser';
import NetInfo from '@react-native-community/netinfo';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Animated } from 'react-native';

import ImageViewer from './components/ImageViewer';
import Button from './components/Button';
import CircleButton from './components/CircleButton';
import IconButton from './components/IconButton';
import EmojiPicker from "./components/EmojiPicker";
import EmojiList from './components/EmojiList';
import EmojiSticker from './components/EmojiSticker';
import WebViewComponent from './components/WebViewComponent';
import { WebView } from 'react-native-webview';

import { useFetchAndParse } from './hooks/useFetchAndParse';
import { useFetchAndSummarize } from './hooks/useFetchAndSummarize';
import config from './config/config.json';
import storage from './config/storage';

const PlaceholderImage = require('./assets/images/background-image.png');

const styles = StyleSheet.create({
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
  },
  optionsContainer: {
    position: 'absolute',
    bottom: 80,
  },
  optionsRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    width: 520,
    height: 240,
    borderRadius: 18,
  },
});

const wait = (timeout) => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

const App = () => {
  const imageRef = useRef();
  const [refreshKey, setRefreshKey] = useState(0);
  const [data, setData] = useState(null);

  const url = config.website;
  const corsProxy = config.proxyUrl;
  const summariesAPI = config.summariesAPI;
  
  const { error } = useFetchAndParse(url, corsProxy, refreshKey, setData);
  //console.log('data:', data);
  if (error !== null) {
    console.log('error:', error);
  }
  const { errorWithSummaries } = useFetchAndSummarize(data, summariesAPI, corsProxy, refreshKey, setData);
  if (errorWithSummaries !== null) {
    console.log('errorWithSummaries:', errorWithSummaries);
  }

  const translateX = useRef(new Animated.Value(0)).current;
const opacity = translateX.interpolate({
  inputRange: [0, 1000],
  outputRange: [1, 0], // Change this to adjust the fade out effect
  extrapolate: 'clamp'
});

const onGestureEvent = ({ nativeEvent }) => {
  if (nativeEvent.translationX >= 0) {
    translateX.setValue(nativeEvent.translationX);
  }
};

const onHandlerStateChange = ({ nativeEvent }) => {
  if (nativeEvent.state === State.END) {
    if (nativeEvent.translationX > 100) { // Increase this value to require a larger swipe to go back
      Animated.timing(translateX, {
        toValue: 1000,
        duration: 250,
        useNativeDriver: true
      }).start(() => {
        setShowWebView(false);
        setCurrentUrl(null); // Unmount the WebView
        translateX.setValue(0); // Reset translation
      });
    } else {
      // If the swipe was not far enough, animate the WebView back to its original position
      Animated.timing(translateX, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true
      }).start();
    }
  }
};
  

  const [showWebView, setShowWebView] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(null);

  const onOpenWithWebBrowser = async (url) => {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected && !netInfo.isInternetReachable) {
        alert('No internet connection');
        return;
      }
      if (!isValidUrl(url)) {
        console.error("Invalid URL:", url);
        return;
      }
  
      setCurrentUrl(url);
      translateX.setValue(1000); // Start off the right edge of the screen
      setShowWebView(true);
      Animated.timing(translateX, {
        toValue: 0, // Slide into place
        duration: 250,
        useNativeDriver: true
      }).start();
    } catch (error) {
      console.error("Failed to open browser:", error);
    }
  };

  function isValidUrl(url) {
    const domain = "https://www.allkpop.com";
    const escapedDomain = domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapes special characters
    const regex = new RegExp(`^${escapedDomain}`);
    return regex.test(url);
  }

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    storage.clear().then(() => {
      wait(2000).then(() => {
        setRefreshing(false);
        setRefreshKey(refreshKey + 1);
        setData(null); // Clear data
      });
    });
  }, [refreshKey]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.container}>
          <View style={styles.container}>
            <View style={styles.imageContainer}>
              <View ref={imageRef} collapsable={false}>
                <ImageViewer
                  placeholderImageSource={PlaceholderImage}
                  data={data}
                  onPress={onOpenWithWebBrowser}
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  showWebView={showWebView} // Pass the showWebView state
                />
              </View>
            </View>
            <StatusBar style="light" />
          </View>
        </View>
      </View>
      {showWebView ? (
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View
            style={{
              flex: 1,
              flexDirection: 'column',
              transform: [{ translateX }],
              opacity: opacity,
              position: 'absolute',
              width: '100%',
              height: '100%',
              zIndex: 1000 // Set a higher zIndex
            }}
          >
            <WebView
              source={{ uri: currentUrl }}
              incognito={true}
              style={{ marginTop: 20 }}
              onShouldStartLoadWithRequest={request => {
                // Only allow navigating within this website
                return request.url.startsWith("https://");
              }}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.warn('WebView error: ', nativeEvent);
              }}
            />
          </Animated.View>
        </PanGestureHandler>
      ) : null}
    </GestureHandlerRootView>
  );
};

export default App;
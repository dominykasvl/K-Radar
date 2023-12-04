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

import ImageViewer from './components/ImageViewer';
import Button from './components/Button';
import CircleButton from './components/CircleButton';
import IconButton from './components/IconButton';
import EmojiPicker from "./components/EmojiPicker";
import EmojiList from './components/EmojiList';
import EmojiSticker from './components/EmojiSticker';
import WebViewComponent from './components/WebViewComponent';

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
    paddingTop: 58,
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

  const url = config.website;
  const corsProxy = config.proxyUrl;
  const summariesAPI = config.summariesAPI;
  
  const { data, error } = useFetchAndParse(url, corsProxy);
  console.log('data:', data);
  console.log('error:', error);
  const { data: summaries, errorWithSummaries } = useFetchAndSummarize(data, summariesAPI, corsProxy);
  console.log('summaries:', summaries);
  console.log('errorWithSummaries:', errorWithSummaries);

  const onOpenWithWebBrowser = async (url) => {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected && !netInfo.isInternetReachable) {
        alert('No internet connection');
        return;
      }
  
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error("Failed to open browser:", error);
    }
  };

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    storage.clear().then(() => {
      wait(2000).then(() => setRefreshing(false));
    });
  }, []);

  return (
    <View style={{ flex: 1 }}>
    <GestureHandlerRootView style={styles.container}>
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
              />
            </View>
          </View>
          <StatusBar style="light" />
        </View>
        {/* <WebViewComponent data={data} /> */}
      </View>
    </GestureHandlerRootView>
    </View>
  );
};

export default App;
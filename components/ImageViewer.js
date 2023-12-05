import React, { memo, useState, useRef } from 'react';
import { Platform, RefreshControl, StyleSheet, Image, Text, View, ActivityIndicator, Pressable, FlatList } from 'react-native';
import moment from 'moment';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Dimensions } from 'react-native';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
const backgroundBottomMargin = 40;

const Item = memo(({ item, onPress, placeholderImageSource }) => {
    const [showSummary, setShowSummary] = useState(false);
    const imageSource = item.image ? { uri: item.image } : placeholderImageSource;
    const timestamp = moment.unix(item.timestamp).format('MMMM Do YYYY, h:mm a');
    const [summaryHeight, setSummaryHeight] = useState(0);
    const [titleHeight, setTitleHeight] = useState(0);
    const [dateHeight, setDateHeight] = useState(0);

    const backgroundStyle = {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent background
        height: showSummary ? summaryHeight + titleHeight + dateHeight + backgroundBottomMargin : titleHeight + dateHeight + backgroundBottomMargin, // Adjust this value as needed
        width: screenWidth,
    };

    return (
        <Pressable
            onPressIn={() => setShowSummary(true)}
            onPressOut={() => setShowSummary(false)}
            style={styles.imageContainer}
        >
            <Image source={imageSource} style={styles.image} resizeMode='cover' />
            <View style={backgroundStyle} >
                <View style={styles.textContainer}>
                <Text style={styles.title} onLayout={(event) => setTitleHeight(event.nativeEvent.layout.height)}>
                    {item.title}
                </Text>
                <Text style={styles.timestamp} onLayout={(event) => setDateHeight(event.nativeEvent.layout.height)}>
                    {timestamp}
                </Text>
                    {showSummary && (
                        <Text style={styles.summary} onLayout={(event) => setSummaryHeight(event.nativeEvent.layout.height)}>
                            {item.summary || 'Loading summaries...'}
                        </Text>
                    )}
                </View>
            </View>
            {/* <Pressable onPress={() => onPress(item.link)} style={styles.pressable}>
                <MaterialIcons name="open-in-browser" size={32} color="white" />
            </Pressable> */}
        </Pressable>
    );
}, (prevProps, nextProps) => prevProps.item === nextProps.item && prevProps.onPress === nextProps.onPress);


export default function ImageViewer({ placeholderImageSource, data, onPress, refreshing, onRefresh, showWebView, setCurrentIndex }) {
    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
          setCurrentIndex(viewableItems[0].index);
        }
      }).current;
    
    if (!data) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text color="white">Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.parentContainer}>
            {Platform.OS === 'web' && (
                <View style={styles.refreshButtonContainer}>
                    <Pressable style={styles.pressableRefresh} onPress={onRefresh}>
                        <MaterialIcons name="refresh" size={24} color="black" />
                    </Pressable>
                </View>
            )}
            <View style={styles.container}>
                <FlatList
                    data={data}
                    renderItem={({ item }) => <Item item={item} onPress={onPress} placeholderImageSource={placeholderImageSource} />}
                    keyExtractor={(item, index) => index.toString()}
                    pagingEnabled
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={{
                        itemVisiblePercentThreshold: 50 // Adjust this value as needed
                    }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                    scrollEnabled={!showWebView} // Disable scrolling when the WebView is shown
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    parentContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    refreshButtonContainer: {
        padding: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pressableRefresh: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pressable: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      paddingRight: 5,
  },
    imageContainer: {
        height: screenHeight,
      position: 'relative',
  },
    image: {
        width: screenWidth,
        height: screenHeight,
        borderRadius: 18,
    },
    textContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        paddingLeft: 10, // Add left padding
        //backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent background
        marginBottom: backgroundBottomMargin, // Adjust this value as needed
        width: screenWidth, // Add this line
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent background
        height: 120, // Adjust this value as needed
        width: screenWidth,
    },
  title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
  },
  timestamp: {
      fontSize: 16,
      color: 'white',
  },
  summary: {
    fontSize: 16,
    color: 'white',
    },
});
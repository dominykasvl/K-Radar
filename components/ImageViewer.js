import React, { memo, useState } from 'react';
import { Platform, RefreshControl, StyleSheet, Image, Text, View, ActivityIndicator, Pressable, FlatList } from 'react-native';
import moment from 'moment';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const Item = memo(({ item, onPress, placeholderImageSource }) => {
    const [showSummary, setShowSummary] = useState(false);
    const imageSource = item.image ? { uri: item.image } : placeholderImageSource;
    const timestamp = moment.unix(item.timestamp).format('MMMM Do YYYY, h:mm a');

    return (
        <Pressable
            onPressIn={() => setShowSummary(true)}
            onPressOut={() => setShowSummary(false)}
            style={styles.imageContainer}
        >
            <Image source={imageSource} style={styles.image} />
            <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.timestamp}>{timestamp}</Text>
                {showSummary && (
                    <Text style={styles.summary}>
                        {item.summary || 'Loading summaries...'}
                    </Text>
                )}
            </View>
            <Pressable onPress={() => onPress(item.link)} style={styles.pressable}>
                <MaterialIcons name="open-in-browser" size={24} color="white" />
            </Pressable>
        </Pressable>
    );
}, (prevProps, nextProps) => prevProps.item === nextProps.item && prevProps.onPress === nextProps.onPress);


export default function ImageViewer({ placeholderImageSource, data, onPress, refreshing, onRefresh }) {
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
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
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
      bottom: 1,
      right: 5,
      paddingRight: 5,
  },
    imageContainer: {
      position: 'relative',
      margin: 10, // Add space between images
  },
    image: {
        width: 320,
        height: 440,
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
      backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent background
      borderRadius: 18,
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
import React, { useRef } from 'react';
import { Animated, View, Text } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

export default function GestureHandlers({ showWebView, setShowWebView, onOpenWithWebBrowser, setCurrentUrl, currentIndex, data, translateXRight, contentCard, webView }) {
    const translateX = useRef(new Animated.Value(0)).current;
    const opacity = translateX.interpolate({
        inputRange: [0, 1000],
        outputRange: [1, 0], // Change this to adjust the fade out effect
        extrapolate: 'clamp'
    });

    const onGestureEventRight = ({ nativeEvent }) => {
        if (nativeEvent.translationX <= 0) {
            translateXRight.setValue(nativeEvent.translationX);
        }
    };

    const onHandlerStateChangeRight = ({ nativeEvent }) => {
        if (nativeEvent.state === State.END) {
            if (nativeEvent.translationX < -100) {
                Animated.timing(translateXRight, {
                    toValue: -1000,
                    duration: 250,
                    useNativeDriver: true
                }).start(() => {
                    // Get the URL of the currently visible item
                    const currentUrl = data[currentIndex].link;
                    if (currentUrl) {
                        onOpenWithWebBrowser(currentUrl, setCurrentUrl, setShowWebView);
                    }
                    // translateXRight.setValue(0); // Remove this line
                });
            } else {
                Animated.timing(translateXRight, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true
                }).start();
            }
        }
    };

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
                }).start(() => {
                    translateX.setValue(0); // Reset translation
                });
            }
        }
    };

    return (
        <View style={styles.container}>
            <PanGestureHandler
                onGestureEvent={onGestureEventRight}
                onHandlerStateChange={onHandlerStateChangeRight}
            >
                <Animated.View
                    style={[
                        styles.container,
                        { flex: 1, transform: [{ translateX: translateXRight }] }
                    ]}
                >
                    {contentCard}
                </Animated.View>
            </PanGestureHandler>
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
                            backgroundColor: '#25292e',
                            width: '100%',
                            height: '100%',
                            zIndex: 1000 // Set a higher zIndex
                        }}
                    >
                        {webView}
                    </Animated.View>
                </PanGestureHandler>
            ) : null}
        </View>
    );

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        alignItems: 'center',
    },
});
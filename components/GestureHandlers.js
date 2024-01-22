import React, { useRef, useState } from 'react';
import { Animated, View, Text, ActivityIndicator } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

export default function GestureHandlers({ showWebView, setShowWebView, onOpenWithWebBrowser, setCurrentUrl, currentIndex, data, translateXRight, loadingProgress, setLoadingProgress, currentNavUri, contentCard, webView }) {
    const translateX = useRef(new Animated.Value(0)).current;

    const [zIndex, setZIndex] = useState(-1);

    const onGestureEventLeft = ({ nativeEvent }) => {
        if (nativeEvent.translationX <= 0) {
            translateXRight.setValue(nativeEvent.translationX);
        }
    };

    const onHandlerStateChangeLeft = ({ nativeEvent }) => {
        console.log('Left swipe - state:', nativeEvent.state);
        if (nativeEvent.state === State.ACTIVE) {
            console.log('Left swipe BEGAN - translationX:', nativeEvent.translationX);
            if (nativeEvent.translationX < -5) {
                console.log('Left swipe: Loading URL in WebView', nativeEvent.translationX);
                const currentUrl = data[currentIndex].link;
                console.log('currentUrl:', currentUrl);
                if (currentUrl && currentUrl !== currentNavUri) {
                    setLoadingProgress(true);
                    onOpenWithWebBrowser(currentUrl, setCurrentUrl, setShowWebView);
                }
            }
        }
        if (nativeEvent.state === State.END) {
            console.log('Left swipe - translationX:', nativeEvent.translationX);
            if (nativeEvent.translationX < -100) {
                console.log('Left swipe BEGAN - translationX', nativeEvent.translationX);
                Animated.timing(translateXRight, {
                    toValue: -1000,
                    duration: 250,
                    useNativeDriver: true
                }).start(() => {
                    console.log('Left swipe: Made it to the end of the animation for the left swipe!')
                    setShowWebView(true);
                    setZIndex(1000);
                    translateXRight.setValue(0);
                });
            } else {
                Animated.timing(translateXRight, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true
                }).start(() => {
                    console.log('Left swipe: swipe wasn\'t far enough to trigger web view!', nativeEvent.translationX);
                    setShowWebView(false);
                    setZIndex(-1);
                    translateXRight.setValue(0);
                });
            }
        }
    };

    const onGestureEventRight = ({ nativeEvent }) => {
        if (nativeEvent.translationX >= 0) {
            translateX.setValue(nativeEvent.translationX);
        }
    };

    const onHandlerStateChangeRight = ({ nativeEvent }) => {
        console.log('Right swipe - state:', nativeEvent.state);
        if (nativeEvent.state === State.END) {
            console.log('Right swipe - translationX:', nativeEvent.translationX);
            if (nativeEvent.translationX > 100) {
                Animated.timing(translateX, {
                    toValue: 1000,
                    duration: 250,
                    useNativeDriver: true
                }).start(() => {
                    console.log('Right swipe: Made it to the end of the animation for the right swipe!')
                    setShowWebView(false);
                    translateX.setValue(0);
                    setZIndex(-1); // Add this line
                });
            } else {
                Animated.timing(translateX, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true
                }).start(() => {
                    console.log('Right swipe: swipe wasn\'t far enough to the right to trigger the animation!')
                    setShowWebView(true);
                    translateX.setValue(0);
                    setZIndex(1000); // Add this line
                });
            }
        }
    };

    return (
        <View style={styles.container}>
            <PanGestureHandler
                onGestureEvent={onGestureEventLeft}
                onHandlerStateChange={onHandlerStateChangeLeft}
            >
                <Animated.View
                    style={[
                        styles.container,
                        { flex: 1, transform: [{ translateX: translateXRight }] }
                    ]}
                >
                    {contentCard ? contentCard : <View><Text>Failed to load content. Try to refresh.</Text></View>}
                </Animated.View>
            </PanGestureHandler>
            <PanGestureHandler
                onGestureEvent={onGestureEventRight}
                onHandlerStateChange={onHandlerStateChangeRight}
                enabled={showWebView}
            >
                <Animated.View
                    style={{
                        flex: 1,
                        flexDirection: 'column',
                        transform: [{ translateX }],
                        position: 'absolute',
                        backgroundColor: '#25292e',
                        width: '100%',
                        height: '100%',
                        zIndex: zIndex, // Change this line
                        pointerEvents: showWebView ? 'auto' : 'none'
                    }}
                >
                    {loadingProgress && (
                        <View style={{
                            position: 'absolute',
                            justifyContent: 'center',
                            alignItems: 'center',
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                            zIndex: 2000,
                            backgroundColor: 'rgba(255, 255, 255, 1)' // Semi-transparent grey background
                        }}>
                            <ActivityIndicator
                                size="large"
                                color="#0000ff"
                            />
                        </View>
                    )}
                    {webView ? webView : <View><Text>Failed to load content. Try to refresh.</Text></View>}
                </Animated.View>
            </PanGestureHandler>
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
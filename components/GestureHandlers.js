import React, { useRef, useState } from 'react';
import { Animated, View, Text, ActivityIndicator } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

export default function GestureHandlers({ showWebView, setShowWebView, onOpenWithWebBrowser, setCurrentUrl, currentIndex, data, translateXRight, loadingProgress, contentCard, webView }) {
    const translateX = useRef(new Animated.Value(0)).current;
    const [opaque, setOpaque] = useState(false);

    const [zIndex, setZIndex] = useState(-1); // Add this line

    const onGestureEventRight = ({ nativeEvent }) => {
        if (nativeEvent.translationX <= 0) {
            translateXRight.setValue(nativeEvent.translationX);
        }
    };

    const onHandlerStateChangeRight = ({ nativeEvent }) => {
        console.log('onHandlerStateChangeRight - state:', nativeEvent.state);
        if (nativeEvent.state === State.ACTIVE) {
            console.log('onHandlerStateChangeRight BEGAN - translationX:', nativeEvent.translationX);
            if (nativeEvent.translationX < -5) {
                console.log('Passed State "BEGAN" if clause!', nativeEvent.translationX);
                const currentUrl = data[currentIndex].link;
                console.log('currentUrl:', currentUrl);
                if (currentUrl) {
                    onOpenWithWebBrowser(currentUrl, setCurrentUrl, setShowWebView);
                }
            }
        }
        if (nativeEvent.state === State.END) {
            console.log('onHandlerStateChangeRight - translationX:', nativeEvent.translationX);
            if (nativeEvent.translationX < -100) {
                console.log('Passed State "END" if clause state!', nativeEvent.translationX);
                Animated.timing(translateXRight, {
                    toValue: -1000,
                    duration: 250,
                    useNativeDriver: true
                }).start(() => {
                    console.log('Made it to the end of the animation for the right swipe!')
                    // Get the URL of the currently visible item
                    setZIndex(1000);
                    translateXRight.setValue(0); // Remove this line
                });
            } else {
                console.log('Passed State "END" else clause state!', nativeEvent.translationX);
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
        console.log('onHandlerStateChange - state:', nativeEvent.state);
        if (nativeEvent.state === State.END) {
            if (nativeEvent.translationX > 100) {
                Animated.timing(translateX, {
                    toValue: 1000,
                    duration: 250,
                    useNativeDriver: true
                }).start(() => {
                    setShowWebView(false);
                    setCurrentUrl(null);
                    translateX.setValue(0);
                    setZIndex(-1); // Add this line
                });
            } else {
                Animated.timing(translateX, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true
                }).start(() => {
                    translateX.setValue(0);
                    setZIndex(1000); // Add this line
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
            <PanGestureHandler
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onHandlerStateChange}
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
                    {webView}
                    {loadingProgress < 1 && (
                        <View style={{
                            position: 'absolute',
                            justifyContent: 'center',
                            alignItems: 'center',
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: 'rgba(255, 255, 255, 1)' // Semi-transparent grey background
                        }}>
                            <ActivityIndicator
                                size="large"
                                color="#0000ff"
                            />
                        </View>
                    )}
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
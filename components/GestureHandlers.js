import React, { useRef, useState } from "react";
import {
  Animated,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";

export default function GestureHandlers({
  showWebView,
  setShowWebView,
  translateXRight,
  loadingProgress,
  contentCard,
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [zIndex, setZIndex] = useState(-1);

  const onGestureEventLeft = ({ nativeEvent }) => {
    if (nativeEvent.translationX <= 0) {
      translateXRight.setValue(nativeEvent.translationX);
    }
  };

  const onHandlerStateChangeLeft = ({ nativeEvent }) => {
    console.log("Left swipe - state:", nativeEvent.state);
    if (nativeEvent.state === State.ACTIVE) {
      console.log("Left swipe BEGAN - translationX:", nativeEvent.translationX);
      if (nativeEvent.translationX < 0) {
        // TODO: Fix opening web links. This section of code doesn't show up in the console logs at all.
      }
    }
    if (nativeEvent.state === State.END) {
      console.log("Left swipe - translationX:", nativeEvent.translationX);
      if (nativeEvent.translationX < -100) {
        console.log(
          "Left swipe BEGAN - translationX",
          nativeEvent.translationX,
        );
        Animated.timing(translateXRight, {
          toValue: -1000,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          setShowWebView(true);
          setZIndex(1000);
          translateXRight.setValue(0);
        });
      } else {
        Animated.timing(translateXRight, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
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
    console.log("Right swipe - state:", nativeEvent.state);
    if (nativeEvent.state === State.END) {
      console.log("Right swipe - translationX:", nativeEvent.translationX);
      if (nativeEvent.translationX > 100) {
        Animated.timing(translateX, {
          toValue: 1000,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          setShowWebView(false);
          translateX.setValue(0);
          setZIndex(-1);
        });
      } else {
        Animated.timing(translateX, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          setShowWebView(true);
          translateX.setValue(0);
          setZIndex(1000);
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
            styles.leftSwipeAnimatedView,
            { transform: [{ translateX: translateXRight }] },
          ]}
        >
          {contentCard ? (
            contentCard
          ) : (
            <View>
              <Text>Failed to load content. Try to refresh.</Text>
            </View>
          )}
        </Animated.View>
      </PanGestureHandler>
      <PanGestureHandler
        onGestureEvent={onGestureEventRight}
        onHandlerStateChange={onHandlerStateChangeRight}
        enabled={showWebView}
      >
        <Animated.View
          style={[
            styles.rightSwipeAnimatedView,
            {
              transform: [{ translateX }],
              zIndex,
              pointerEvents: showWebView ? "auto" : "none",
            },
          ]}
        >
          {loadingProgress && (
            <View style={styles.loadingProgress}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )}
          {
            <View>
              <Text>TODO: Fix content loading</Text>
            </View>
          }
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "50%",
    height: "100%",
    backgroundColor: "#25292e",
    alignItems: "center",
  },
  leftSwipeAnimatedView: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#25292e",
    alignItems: "center",
  },
  rightSwipeAnimatedView: {
    flex: 1,
    width: "100%",
    height: "100%",
    flexDirection: "column",
    position: "absolute",
    backgroundColor: "#25292e",
  },
  loadingProgress: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2000,
    backgroundColor: "rgba(255, 255, 255, 1)",
  },
});

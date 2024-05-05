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
    if (nativeEvent.state === State.ACTIVE) {
      console.log("Left swipe BEGAN - translationX:", nativeEvent.translationX);
      // Additional logic if needed when swipe starts
    }

    if (nativeEvent.state === State.END) {
      console.log("Left swipe - state:", nativeEvent.state);
      console.log("Left swipe - translationX:", nativeEvent.translationX);

      // Determine final zIndex based on swipe direction
      const finalZIndex = nativeEvent.translationX < -100 ? 1000 : -1;

      // Call the refactored function with appropriate parameters
      handleEndGesture(
        nativeEvent.translationX,
        100,
        translateXRight,
        finalZIndex,
      );
    }
  };

  const onGestureEventRight = ({ nativeEvent }) => {
    if (nativeEvent.translationX >= 0) {
      translateX.setValue(nativeEvent.translationX);
    }
  };

  const onHandlerStateChangeRight = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END) {
      // Log the current state and translation for debugging
      console.log("Right swipe - state:", nativeEvent.state);
      console.log("Right swipe - translationX:", nativeEvent.translationX);

      // Determine final zIndex based on swipe direction
      const finalZIndex = nativeEvent.translationX > 100 ? -1 : 1000;

      // Call the refactored function with appropriate parameters
      handleEndGesture(nativeEvent.translationX, 100, translateX, finalZIndex);
    }
  };

  const handleEndGesture = (
    translationX,
    threshold,
    animationTarget,
    finalZIndex,
  ) => {
    const endValue = translationX > 0 ? 1000 : -1000; // Determine the end value based on swipe direction
    if (Math.abs(translationX) > threshold) {
      Animated.timing(animationTarget, {
        toValue: endValue,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        animationTarget.setValue(0);
        setZIndex(finalZIndex);
      });
    } else {
      Animated.timing(animationTarget, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        animationTarget.setValue(0);
        setZIndex(-1);
      });
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
              <Text>
                Failed to load content. Try to refresh. TODO: Beautify this
              </Text>
            </View>
          )}
        </Animated.View>
      </PanGestureHandler>
      <PanGestureHandler
        onGestureEvent={onGestureEventRight}
        onHandlerStateChange={onHandlerStateChangeRight}
      >
        <Animated.View
          style={[
            styles.rightSwipeAnimatedView,
            {
              transform: [{ translateX }],
              zIndex,
            },
          ]}
        ></Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "50%",
    height: "100%",
    alignItems: "center",
  },
  leftSwipeAnimatedView: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
  },
  rightSwipeAnimatedView: {
    flex: 1,
    width: "100%",
    height: "100%",
    flexDirection: "column",
    position: "absolute",
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

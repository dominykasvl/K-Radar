import React, { memo, useState, useRef } from "react";
import {
  Platform,
  StyleSheet,
  Image,
  Text,
  View,
  Pressable,
  FlatList,
  Animated,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../assets/theme/theme";

import { onOpenWithWebBrowser } from "../utilities/NetworkTools";

const backgroundBottomMargin = 50;
const backgroundTopMargin = 10;

const Item = memo(
  ({ item, placeholderImageSource, screenHeight }) => {
    const [showSummary, setShowSummary] = useState(false);
    const imageSource = item.image
      ? { uri: item.image }
      : placeholderImageSource;
    const date = new Date(item.timestamp * 1000); // Convert UNIX timestamp to JavaScript Date object
    const formatter = new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    const timestamp = formatter.format(date);
    const [summaryHeight, setSummaryHeight] = useState(0);
    const [titleHeight, setTitleHeight] = useState(0);
    const [dateHeight, setDateHeight] = useState(0);

    const backgroundStyle = {
      position: "absolute",
      bottom: 10,
      borderRadius: 18,
      backgroundColor: "rgba(0, 0, 0, 0.6)", // Semi-transparent background
      height: showSummary
        ? summaryHeight +
          titleHeight +
          dateHeight +
          backgroundBottomMargin +
          backgroundTopMargin
        : titleHeight + dateHeight + backgroundBottomMargin, // Adjust this value as needed
      alignSelf: "center",
    };

    const image = {
      height: screenHeight * 0.5,
      borderRadius: 18,
      marginBottom: 10,
      alignSelf: "center",
    };

    const [isPressed, setIsPressed] = useState(false);

    const handlePressIn = () => {
      setIsPressed(true);
      setShowSummary(true);
    };

    const handlePressOut = () => {
      setIsPressed(false);
      setShowSummary(false);
    };

    return (
      <Pressable
        onHoverIn={() => handlePressIn()}
        onHoverOut={() => handlePressOut()}
        style={styles.imageContainer}
        onPress={() => onOpenWithWebBrowser(item.link)}
      >
        <Image
          source={imageSource}
          style={[image, { width: isPressed ? "100%" : "90%" }]}
          resizeMode="auto"
        />
        <View style={[backgroundStyle, { width: isPressed ? "100%" : "90%" }]}>
          <View style={styles.textContainer}>
            <Text
              style={styles.title}
              onLayout={(event) =>
                setTitleHeight(event.nativeEvent.layout.height + 5)
              }
            >
              {item.title}
            </Text>
            <Text
              style={styles.timestamp}
              onLayout={(event) =>
                setDateHeight(event.nativeEvent.layout.height)
              }
            >
              {timestamp}
            </Text>
            {showSummary && (
              <Text
                style={styles.summary}
                onLayout={(event) =>
                  setSummaryHeight(event.nativeEvent.layout.height)
                }
              >
                {item.summary || "Loading summaries..."}
              </Text>
            )}
          </View>
        </View>
        {isPressed && (
          <Pressable style={styles.pressable}>
            <MaterialIcons name="open-in-browser" size={32} color="white" />
          </Pressable>
        )}
      </Pressable>
    );
  },
  (prevProps, nextProps) => prevProps.item === nextProps.item,
);

export default function ContentCard({
  placeholderImageSource,
  data,
  refreshing,
  onRefresh,
  screenHeight,
}) {
  const [isHovered, setHovered] = useState(false);
  const [isPressed, setPressed] = useState(false);

  const getButtonStyle = () => {
    if (isPressed) {
      return [styles.pressableRefresh, styles.pressableRefreshActive];
    } else if (isHovered) {
      return [styles.pressableRefresh, styles.pressableRefreshHover];
    } else {
      return styles.pressableRefresh;
    }
  };

  // Use useRef to maintain the animated value
  const scrollY = useRef(new Animated.Value(0)).current;

  // Animated event for binding the scroll to the animated value
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true },
  );

  return (
    <View style={styles.parentContainer}>
      {Platform.OS === "web" && (
        <View style={styles.refreshButtonContainer}>
          <Pressable
            style={getButtonStyle()}
            onPressIn={() => setPressed(true)}
            onPressOut={() => {
              setPressed(false);
              onRefresh();
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <MaterialIcons name="refresh" size={24} color="black" />
          </Pressable>
        </View>
      )}
      <View style={styles.container}>
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <Item
              item={item}
              placeholderImageSource={placeholderImageSource}
              screenHeight={screenHeight}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 50, // Adjust this value as needed
          }}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onScroll={handleScroll}
          scrollEventThrottle={80}
        />
        <Animated.View
          style={[
            styles.fade,
            {
              opacity: scrollY.interpolate({
                inputRange: [0, 50], // Adjust input range based on your needs
                outputRange: [0, 1],
                extrapolate: "clamp", // Clamp so opacity doesn't go beyond 1
              }),
            },
          ]}
        >
          <LinearGradient
            colors={["rgba(255,255,255,0.8)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.gradient}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  parentContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  refreshButtonContainer: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pressableRefresh: {
    backgroundColor: "#f0f0f0", // Light gray background
    borderRadius: 30, // Circular button
    width: 50, // Fixed size for the button
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow
    transition: "background-color 0.3s, transform 0.2s", // Smooth transitions for color and transform
  },
  pressableRefreshHover: {
    backgroundColor: "#e0e0e0", // Slightly darker on hover
  },
  pressableRefreshActive: {
    backgroundColor: "#d0d0d0", // Even darker when pressed
    transform: [{ scale: 0.96 }], // Slightly scale down when pressed
  },
  pressable: {
    position: "absolute",
    bottom: 30,
    right: 20,
    paddingRight: 5,
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  textContainer: {
    width: "100%",
    height: "100%",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    alignItems: "flex-start",
    paddingLeft: 10, // Add left padding
    //backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent background
    marginBottom: backgroundBottomMargin, // Adjust this value as needed
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Semi-transparent background
    height: 120, // Adjust this value as needed
    width: "100%",
  },
  title: {
    fontSize: 24,
    color: colors.text,
    fontWeight: "bold",
  },
  timestamp: {
    fontSize: 16,
    color: "white",
  },
  summary: {
    fontSize: 16,
    color: colors.text,
    marginTop: backgroundTopMargin,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 50,
  },
  fade: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 50,
  },
});

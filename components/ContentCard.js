import React, { memo, useState, useRef, useContext } from "react";
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
import ResfreshButton from "./RefreshButton";

import { AppContext } from "../context/AppContext";
import { onOpenWithWebBrowser } from "../utilities/NetworkTools";

const Item = memo(
  ({
    item,
    placeholderImageSource,
    screenHeight,
    isMobileDevice,
    backgroundBottomMargin,
    backgroundTopMargin,
  }) => {
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
          <View
            style={[
              styles.textContainer,
              { marginBottom: backgroundBottomMargin },
            ]}
          >
            <Text
              style={isMobileDevice ? styles.titleMobile : styles.titleDesktop}
              onLayout={(event) =>
                setTitleHeight(event.nativeEvent.layout.height + 5)
              }
            >
              {item.title}
            </Text>
            <Text
              style={
                isMobileDevice
                  ? styles.timestampMobile
                  : styles.timestampDesktop
              }
              onLayout={(event) =>
                setDateHeight(event.nativeEvent.layout.height)
              }
            >
              {timestamp}
            </Text>
            {showSummary && (
              <Text
                style={[
                  isMobileDevice ? styles.summaryMobile : styles.summaryDesktop,
                  { marginTop: backgroundTopMargin },
                ]}
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
  screenHeight,
  cardWidth,
}) {
  cardWidth ? cardWidth : (cardWidth = "100%");
  const { state, setState, onRefresh, isMobileDevice } = useContext(AppContext);

  const backgroundBottomMargin = isMobileDevice ? 10 : 50;
  const backgroundTopMargin = 10;

  // Use useRef to maintain the animated value
  const scrollY = useRef(new Animated.Value(0)).current;

  // Animated event for binding the scroll to the animated value
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true },
  );

  return (
    <View style={styles.parentContainer}>
      <View style={styles.topContainer}>
        <View style={styles.container}>
          <FlatList
            data={state.data}
            renderItem={({ item }) => (
              <View
                style={{
                  flex: 1,
                  width: cardWidth,
                  justifyContent: "center",
                  alignItems: "center",
                  alignSelf: "center",
                }}
              >
                <Item
                  item={item}
                  placeholderImageSource={placeholderImageSource}
                  screenHeight={screenHeight}
                  isMobileDevice={isMobileDevice}
                  backgroundBottomMargin={backgroundBottomMargin}
                  backgroundTopMargin={backgroundTopMargin}
                />
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
            viewabilityConfig={{
              itemVisiblePercentThreshold: 50, // Adjust this value as needed
            }}
            refreshing={state.refreshing}
            onRefresh={onRefresh}
            onScroll={handleScroll}
            scrollEventThrottle={80}
          />
          <Animated.View
            style={[
              styles.fade,
              {
                width: cardWidth,
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
        {!isMobileDevice && state.data && (
          <ResfreshButton onRefresh={onRefresh} />
        )}
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
  topContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  titleDesktop: {
    fontSize: 24,
    color: colors.text,
    fontWeight: "bold",
  },
  titleMobile: {
    fontSize: 18,
    color: colors.text,
    fontWeight: "bold",
  },
  timestampDesktop: {
    fontSize: 16,
    color: "white",
  },
  timestampMobile: {
    fontSize: 14,
    color: "white",
  },
  summaryDesktop: {
    fontSize: 16,
    color: colors.text,
  },
  summaryMobile: {
    fontSize: 14,
    color: colors.text,
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
    height: 50,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
});

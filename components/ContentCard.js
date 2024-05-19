import React, { memo, useState } from "react";
import { StyleSheet, Image, Text, View, Pressable } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { colors } from "../assets/theme/theme";
import { onOpenWithWebBrowser } from "../utilities/NetworkTools";

const ContentCard = memo(
  function ContentList({
    item,
    placeholderImageSource,
    screenHeight,
    isMobileDevice,
    backgroundBottomMargin,
    backgroundTopMargin,
  }) {
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

const styles = StyleSheet.create({
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
});

export default ContentCard;

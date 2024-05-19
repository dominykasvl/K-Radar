import React, { useRef, useContext, useState } from "react";
import { Platform, StyleSheet, View, FlatList, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Popup from "./ContentCardPopup";
import ResfreshButton from "./RefreshButton";
import usePullToRefresh from "../hooks/usePullToRefresh";
import ContentCard from "./ContentCard";

import { AppContext } from "../context/AppContext";

export default function ContentList({
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

  //const panHandlers = usePullToRefresh(onRefresh); // Custom hook for web pull-to-refresh

  const [selectedItem, setSelectedItem] = useState(null);

  const handleItemPress = (item) => {
    setSelectedItem(item);
  };

  const handleClosePopup = () => {
    setSelectedItem(null);
  };

  return (
    <View style={styles.parentContainer}>
      <View style={styles.topContainer}>
        <View style={styles.container}>
          <FlatList
            // {...(Platform.OS === "web" ? panHandlers : {})} // Apply panHandlers only for web
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
                <ContentCard
                  item={item}
                  placeholderImageSource={placeholderImageSource}
                  screenHeight={screenHeight}
                  isMobileDevice={isMobileDevice}
                  backgroundBottomMargin={backgroundBottomMargin}
                  backgroundTopMargin={backgroundTopMargin}
                  handleItemPress={handleItemPress}
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
          <Popup
            visible={selectedItem !== null}
            item={selectedItem}
            onClose={handleClosePopup}
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

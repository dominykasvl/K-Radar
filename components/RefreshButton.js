import React, { useState } from "react";
import { StyleSheet, View, Pressable } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function ResfreshButton({ onRefresh }) {
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

  return (
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
  );
}

const styles = StyleSheet.create({
  refreshButtonContainer: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  pressableRefreshHover: {
    backgroundColor: "#e0e0e0", // Slightly darker on hover
  },
  pressableRefreshActive: {
    backgroundColor: "#d0d0d0", // Even darker when pressed
    transform: [{ scale: 0.96 }], // Slightly scale down when pressed
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
});

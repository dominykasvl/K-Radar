import React from "react";
import { StyleSheet } from "react-native";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { LinearGradient } from "expo-linear-gradient";

import { AppProvider } from "./context/AppContext";
import { FeedScreen } from "./screens/FeedScreen";
import { colors } from "./assets/theme/theme";
import { View } from "react-native";

const Drawer = createDrawerNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "rgb(255, 45, 85)",
    background: "rgba(0, 0, 0, 0.0)",
  },
};

const App = () => {
  return (
    <AppProvider>
      <LinearGradient
        colors={[colors.primary, colors.accent]}
        style={{ flex: 1 }}
      >
        <NavigationContainer theme={MyTheme}>
          <Drawer.Navigator
            screenOptions={{
              sceneContainerStyle: {
                flex: 1,
              },
              drawerType: "permanent",
              drawerStyle: { width: "15%" },
              overlayColor: "transparent",
              headerShown: false,
            }}
            initialRouteName="Feed"
          >
            <Drawer.Screen
              name="Feed"
              component={() => <FeedScreen cardWidth={"60%"} marginTop={10} />}
            />
          </Drawer.Navigator>
        </NavigationContainer>
      </LinearGradient>
    </AppProvider>
  );
};

export default App;

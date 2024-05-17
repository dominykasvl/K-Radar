import React, { useContext } from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { FeedScreen } from "../screens/FeedScreen";
import { AppContext } from "../context/AppContext";

const Drawer = createDrawerNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "rgb(255, 45, 85)",
    background: "rgba(0, 0, 0, 0.0)",
  },
};

export default function Navigator() {
  const { isMobileDevice } = useContext(AppContext);
  return (
    <NavigationContainer theme={MyTheme}>
      <Drawer.Navigator
        screenOptions={{
          sceneContainerStyle: {
            flex: 1,
          },
          drawerType: !isMobileDevice ? "permanent" : "front",
          drawerStyle: !isMobileDevice ? { width: "15%" } : null,
          overlayColor: "transparent",
          headerShown: false,
        }}
        initialRouteName="Feed"
      >
        <Drawer.Screen
          name="Feed"
          component={() => (
            <FeedScreen
              cardWidth={isMobileDevice ? "100%" : "60%"}
              marginTop={isMobileDevice ? 0 : 10}
            />
          )}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

import React from "react";
import { LinearGradient } from "expo-linear-gradient";

import { AppProvider } from "./context/AppContext";
import { colors } from "./assets/theme/theme";
import Navigator from "./components/Navigator";

const App = () => {
  return (
    <AppProvider>
      <LinearGradient
        colors={[colors.primary, colors.accent]}
        style={{ flex: 1 }}
      >
        <Navigator />
      </LinearGradient>
    </AppProvider>
  );
};

export default App;

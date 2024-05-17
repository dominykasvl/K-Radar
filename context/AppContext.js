import React, { createContext, useState } from "react";
import { useFetchAndParse } from "../hooks/useFetchAndParse";
import config from "../config/config.json";
import storage from "../config/storage";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, setState] = useState({
    data: [],
    refreshKey: 0,
    refreshing: false,
    loadingProgress: false,
  });

  const url = config.website;

  const userAgent = window.navigator.userAgent;
  const isMobileDevice =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent,
    );

  const updateData = (newData) => {
    setState((prevState) => ({ ...prevState, data: newData }));
  };

  const { error } = useFetchAndParse(url, state.refreshKey, updateData);
  //console.log("data:", state.data);
  if (error !== null) {
    console.log("error:", error);
  }

  const setRefreshing = (value) => {
    setState((prevState) => ({ ...prevState, refreshing: value }));
  };

  const setRefreshKey = (value) => {
    setState((prevState) => ({ ...prevState, refreshKey: value }));
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    storage
      .clear()
      .then(() => {
        // Directly reset the refreshing state and increment refreshKey once storage is cleared
        setRefreshing(false);
        setRefreshKey(state.refreshKey + 1);
        console.log("Refreshed saved data");
      })
      .catch((error) => {
        console.error("Failed to clear storage:", error);
        // Handle any errors that occur during the storage clearing
      });
  }, [state.refreshKey]);

  const value = {
    state,
    setState,
    onRefresh,
    isMobileDevice,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

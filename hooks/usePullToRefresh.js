import { useRef } from "react";
import { PanResponder } from "react-native";

const usePullToRefresh = (onRefresh) => {
  const startY = useRef(0);
  const isRefreshing = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return gestureState.dy > 0; // Only respond to downward gestures
      },
      onPanResponderGrant: (evt, gestureState) => {
        startY.current = gestureState.y0;
      },
      onPanResponderMove: (evt, gestureState) => {
        const currentY = gestureState.moveY;
        if (currentY - startY.current > 30 && !isRefreshing.current) {
          // Adjust the threshold as needed
          isRefreshing.current = true;
          onRefresh().then(() => {
            isRefreshing.current = false;
          });
        }
      },
      onPanResponderRelease: () => {
        startY.current = 0;
      },
    }),
  ).current;

  return panResponder.panHandlers;
};

export default usePullToRefresh;

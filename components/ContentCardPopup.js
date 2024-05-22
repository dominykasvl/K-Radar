import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
} from "react-native";

const Popup = ({ visible, item, onClose }) => {
  const [showModal, setShowModal] = useState(visible);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowModal(false);
      });
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowModal(false);
      onClose();
    });
  };

  if (!item || !showModal) return null;

  return (
    <Modal
      transparent={true}
      animationType="none"
      visible={showModal}
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.modalOverlay, { opacity }]}>
        <View style={styles.popup}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <Image source={{ uri: item.image }} style={styles.popupImage} />
          <Text style={styles.popupTitle}>{item.title}</Text>
          <Text style={styles.popupTimestamp}>
            {new Date(item.timestamp * 1000).toLocaleString()}
          </Text>
          <Text style={styles.popupSummary}>{item.summary}</Text>
          <TouchableOpacity onPress={() => window.open(item.link, "_blank")}>
            <Text style={styles.popupLink}>Read more</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  popup: {
    width: "90%",
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    alignItems: "center",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 18,
  },
  popupImage: {
    width: "100%",
    height: 200,
    marginBottom: 16,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  popupTimestamp: {
    fontSize: 14,
    color: "gray",
    marginBottom: 8,
  },
  popupSummary: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  popupLink: {
    fontSize: 16,
    color: "blue",
    textDecorationLine: "underline",
  },
});

export default Popup;

// storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

let storage = {
  getItem: async (key) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error("Failed to get item from AsyncStorage: ", error);
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error("Failed to set item in AsyncStorage: ", error);
    }
  },
  clear: async () => {
    try {
      const itemToKeep = await AsyncStorage.getItem('EXPO_CONSTANTS_INSTALLATION_ID');
      await AsyncStorage.clear();
      if (itemToKeep) {
        await AsyncStorage.setItem('EXPO_CONSTANTS_INSTALLATION_ID', itemToKeep);
      }
    } catch (error) {
      console.error("Failed to clear AsyncStorage: ", error);
    }
  },
};

export default storage;
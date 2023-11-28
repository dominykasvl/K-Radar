// storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

let storage = {
  getItem: async (key) => {
    return await AsyncStorage.getItem(key);
  },
  setItem: async (key, value) => {
    await AsyncStorage.setItem(key, value);
  },
};

export default storage;
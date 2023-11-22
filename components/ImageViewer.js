import { StyleSheet, Image, Text, View, ActivityIndicator } from 'react-native';
import moment from 'moment';

export default function ImageViewer({ placeholderImageSource, data }) {
    if (!data) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </View>
        );
    }

    return data.map((item, index) => {
        const imageSource = item.image ? { uri: item.image } : placeholderImageSource;
        const timestamp = moment.unix(item.timestamp).format('MMMM Do YYYY, h:mm:ss a');

        return (
            <View key={index} style={styles.imageContainer}>
                <Image source={imageSource} style={styles.image} />
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.timestamp}>{timestamp}</Text>
                </View>
            </View>
        );
    });
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
      position: 'relative',
      margin: 10, // Add space between images
  },
    image: {
        width: 320,
        height: 440,
        borderRadius: 18,
    },
    textContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'flex-end',
      alignItems: 'flex-start',
      paddingLeft: 10, // Add left padding
      backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent background
      borderRadius: 18,
  },
  title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
  },
  timestamp: {
      fontSize: 16,
      color: 'white',
  },
});
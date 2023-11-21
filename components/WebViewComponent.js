import React from 'react';
import { View, Text, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const WebViewComponent = ({ data }) => {
    const renderWebView = () => {
        if (Platform.OS === 'web') {
            // Render web specific view
            return (
                <View>
                    {data ? <div dangerouslySetInnerHTML={{ __html: data }} /> : <Text style={{ color: '#fff' }}>Loading...</Text>}
                </View>
            );
        } else {
            // Render view for mobile platforms
            return (
                <View>
                    {data ? <WebView source={{ html: data }} /> : <Text style={{ color: '#fff' }}>Loading...</Text>}
                </View>
            );
        }
    };

    return (
        <View>
            {renderWebView()}
        </View>
    );
};

export default WebViewComponent;

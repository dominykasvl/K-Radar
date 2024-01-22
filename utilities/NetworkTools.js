import NetInfo from '@react-native-community/netinfo';

export const onOpenWithWebBrowser = async (url, setCurrentUrl, setShowWebView) => {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected && !netInfo.isInternetReachable) {
        alert('No internet connection');
        return;
      }
      if (!isValidUrl(url)) {
        console.error("Invalid URL:", url);
        return;
      }
  
      setCurrentUrl(url);
      setShowWebView(true);
    } catch (error) {
      console.error("Failed to open browser:", error);
    }
  };

  export const setBrowserUrl = async (url, setCurrentUrl) => {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected && !netInfo.isInternetReachable) {
        alert('No internet connection');
        return;
      }
      if (!isValidUrl(url)) {
        console.error("Invalid URL:", url);
        return;
      }
  
      setCurrentUrl(url);
    } catch (error) {
      console.error("Failed to open browser:", error);
    }
  };

export function isValidUrl(url) {
  const domain = "https://www.allkpop.com";
  const escapedDomain = domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapes special characters
  const regex = new RegExp(`^${escapedDomain}`);
  return regex.test(url);
}
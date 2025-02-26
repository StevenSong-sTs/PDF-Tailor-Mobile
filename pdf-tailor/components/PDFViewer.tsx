import { View, Dimensions, Text } from "react-native";
import { WebView } from 'react-native-webview';
import { DocumentPickerAsset } from 'expo-document-picker';

interface PDFViewerProps {
  uri: string;
  style?: object;
}

export function PDFViewer({ uri, style }: PDFViewerProps) {
  // Check if the URI is valid
  if (!uri) {
    return (
      <View style={[{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }, style]}>
        <Text>No PDF document selected</Text>
      </View>
    );
  }
  
  return (
    <View style={[{ flex: 1, width: '100%' }, style]}>
      <WebView
        source={{ uri }}
        style={{
          flex: 1,
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height,
        }}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
}

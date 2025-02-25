import { View, Dimensions } from "react-native";
import Pdf from 'react-native-pdf';
import { DocumentPickerAsset } from 'expo-document-picker';

interface PDFViewerProps {
  uri: string;
  style?: object;
}

export function PDFViewer({ uri, style }: PDFViewerProps) {
  const source = { uri, cache: true };
  
  return (
    <View style={[{ flex: 1, width: '100%' }, style]}>
      <Pdf
        source={source}
        style={{
          flex: 1,
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height,
        }}
        onLoadComplete={(numberOfPages, filePath) => {
          console.log(`PDF loaded: ${numberOfPages} pages`);
        }}
        onError={(error) => {
          console.error('PDF Error:', error);
        }}
      />
    </View>
  );
}

import { View } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import * as DocumentPicker from 'expo-document-picker';
import { useState } from "react";
import { FileText } from "lucide-react-native";
import { PDFViewer } from "@/components/PDFViewer";
import { Spinner } from "@/components/ui/spinner";

export default function Split() {
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickDocument = async () => {
    setIsLoading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });
      
      if (result.assets && result.assets[0]) {
        setSelectedFile(result);
      }
    } catch (err) {
      console.error('Error picking document:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        gap: 20,
      }}
    >
      <Text size="xl" bold>Split PDF</Text>
      
      <Button 
        size="lg" 
        variant="outline" 
        onPress={pickDocument}
      >
        <FileText size={24} />
        <ButtonText>Select PDF</ButtonText>
      </Button>

      {isLoading && <Spinner size="large" />}

      {selectedFile?.assets && (
        <View style={{ flex: 1 }}>
          <Text size="md" style={{ marginBottom: 10 }}>
            Selected: {selectedFile.assets[0].name}
          </Text>
          <PDFViewer uri={selectedFile.assets[0].uri} />
        </View>
      )}
    </View>
  );
}

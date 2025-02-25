import { View } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import * as DocumentPicker from 'expo-document-picker';
import { useState } from "react";
import { FileText } from "lucide-react-native";

export default function Convert() {
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });
      
      if (result.assets && result.assets[0]) {
        setSelectedFile(result);
        // Here we'll add PDF preview functionality later
      }
    } catch (err) {
      console.error('Error picking document:', err);
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
      <Text size="xl" bold>Convert PDF</Text>
      
      <Button 
        size="lg" 
        variant="outline" 
        onPress={pickDocument}
      >
        <FileText size={24} />
        <ButtonText>Select PDF</ButtonText>
      </Button>

      {selectedFile?.assets && (
        <Text size="md">
          Selected: {selectedFile.assets[0].name}
        </Text>
      )}
    </View>
  );
}
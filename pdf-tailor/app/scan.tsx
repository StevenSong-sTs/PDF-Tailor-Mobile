import { View } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import * as DocumentPicker from 'expo-document-picker';
import { useState } from "react";
import { FileText } from "lucide-react-native";

export default function Scan() {

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        gap: 20,
      }}
    >
      <Text size="xl" bold>Scan PDF</Text>
      
    </View>
  );
}
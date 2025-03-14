import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <GluestackUIProvider mode="light">
        <Stack>
          <Stack.Screen 
            name="index" 
            options={{ 
              title: "PDF Tailor",
              headerShown: false 
            }} 
          />
          <Stack.Screen 
            name="split" 
            options={{ 
              title: "Split PDF",
              presentation: "card",
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="merge" 
            options={{ 
              title: "Merge PDFs",
              presentation: "card",
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="scan" 
            options={{ 
              title: "Scan to PDF",
              presentation: "card",
              headerShown: false,
            }} 
          />
        </Stack>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}

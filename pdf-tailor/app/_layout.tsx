import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { InAppPurchaseProvider } from "@/context/InAppPurchaseContext";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <GluestackUIProvider mode="light">
        <InAppPurchaseProvider>
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
            <Stack.Screen 
              name="remove-ads" 
              options={{ 
                title: "Remove Ads",
                presentation: "card",
                headerShown: false,
              }} 
            />
          </Stack>
        </InAppPurchaseProvider>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}

import { Stack } from "expo-router";

import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";

export default function Layout() {
  return (
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
            presentation: "card"
          }} 
        />
        <Stack.Screen 
          name="merge" 
          options={{ 
            title: "Merge PDFs",
            presentation: "card"
          }} 
        />
        <Stack.Screen 
          name="convert" 
          options={{ 
            title: "Convert PDF",
            presentation: "card"
          }} 
        />
        </Stack>
    </GluestackUIProvider>
  );
}

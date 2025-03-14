import { View, Animated, TouchableOpacity } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Camera, ScissorsLineDashed, Combine } from "lucide-react-native";
import { router } from "expo-router";
import { Box } from "@/components/ui/box"
import { HStack } from "@/components/ui/hstack"
import { VStack } from "@/components/ui/vstack"
import { Card } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import {useFonts, Orbitron_700Bold} from "@expo-google-fonts/orbitron"
import { useState, useRef, useEffect } from "react";

export default function Index() {
 const [titleFontLoaded] = useFonts({
  Orbitron_700Bold,
 })

 // Add animation refs for each icon
 const splitShakeAnimation = useRef(new Animated.Value(0)).current;
 const mergeShakeAnimation = useRef(new Animated.Value(0)).current;
 const scanShakeAnimation = useRef(new Animated.Value(0)).current;

 // Animation function
 const shakeIcon = (animation: Animated.Value) => {
  Animated.sequence([
   Animated.timing(animation, {
    toValue: 10,
    duration: 100,
    useNativeDriver: true,
   }),
   Animated.timing(animation, {
    toValue: -10,
    duration: 100,
    useNativeDriver: true,
   }),
   Animated.timing(animation, {
    toValue: 0,
    duration: 100,
    useNativeDriver: true,
   }),
  ]).start();
 };

 // Add initial animation sequence
 useEffect(() => {
  const animateSequentially = () => {
   setTimeout(() => shakeIcon(splitShakeAnimation), 0);
   setTimeout(() => shakeIcon(mergeShakeAnimation), 500);
   setTimeout(() => shakeIcon(scanShakeAnimation), 1000);
  };

  animateSequentially();
 }, []); // Empty dependency array means this runs once on mount

  return (
    <Box className="flex-1 p-6 bg-background-0 pt-24">
      <Heading 
        size="3xl" 
        className="text-center mb-8" 
        style={{ fontFamily: titleFontLoaded ? "Orbitron_700Bold" : "sans-serif" }}
      >
        PDF Tailor
      </Heading>
      
      <VStack space="xl">
        {/* Split PDF Card */}
        <TouchableOpacity 
          activeOpacity={1.0} 
          onPress={() => shakeIcon(splitShakeAnimation)}
        >
          <Card size="md" variant="elevated" className="bg-background-50 p-6 rounded-2xl">
            <Box className="flex-row gap-4">
              <VStack space="xs" className="flex-1">
                <Heading size="xl">Split PDF</Heading>
                <Text className="font-bold text-gray-600">Divide documents easily</Text>
                <Text className="text-gray-500 text-sm mt-2">
                  Split large PDFs into smaller files
                  Organize your documents efficiently
                </Text>
              </VStack>
              <Box className="w-20 items-center justify-center">
                <Animated.View style={{ transform: [{ translateX: splitShakeAnimation }] }}>
                  <Box className="w-15 h-15 rounded-full bg-background-100 items-center justify-center">
                    <ScissorsLineDashed size={40} color="#64748b" />
                  </Box>
                </Animated.View>
              </Box>
            </Box>
            <Button
              size="md"
              variant="solid"
              action="primary"
              className="self-start mt-4 rounded-lg"
              onPress={() => router.push("/split")}
            >
              <ButtonText>Open Tool</ButtonText>
            </Button>
          </Card>
        </TouchableOpacity>

        {/* Merge PDFs Card */}
        <TouchableOpacity 
          activeOpacity={1.0} 
          onPress={() => shakeIcon(mergeShakeAnimation)}
        >
          <Card size="md" variant="elevated" className="bg-info-100 p-6 rounded-2xl">
            <Box className="flex-row gap-4">
              <VStack space="xs" className="flex-1">
                <Heading size="xl">Merge PDFs</Heading>
                <Text className="font-bold text-gray-600">Combine multiple files</Text>
                <Text className="text-gray-500 text-sm mt-2">
                  Join PDFs seamlessly
                  Perfect for document compilation
                </Text>
              </VStack>
              <Box className="w-20 items-center justify-center">
                <Animated.View style={{ transform: [{ translateX: mergeShakeAnimation }] }}>
                  <Box className="w-15 h-15 rounded-full bg-info-200 items-center justify-center">
                    <Combine size={40} color="#0369a1" />
                  </Box>
                </Animated.View>
              </Box>
            </Box>
            <Button
              size="md"
              variant="solid"
              action="primary"
              className="self-start mt-4 rounded-lg"
              onPress={() => router.push("/merge")}
            >
              <ButtonText>Open Tool</ButtonText>
            </Button>
          </Card>
        </TouchableOpacity>

        {/* Scan to PDF Card */}
        <TouchableOpacity 
          activeOpacity={1.0} 
          onPress={() => shakeIcon(scanShakeAnimation)}
        >
          <Card size="md" variant="elevated" className="bg-background-900 p-6 rounded-2xl">
            <Box className="flex-row gap-4">
              <VStack space="xs" className="flex-1">
                <Heading size="xl" className="text-typography-0">
                  Scan to PDF
                </Heading>
                <Text className="font-bold text-gray-400">Digital transformation</Text>
                <Text className="text-gray-500 text-sm mt-2">
                  Convert images instantly
                  Professional quality results
                </Text>
              </VStack>
              <Box className="w-20 items-center justify-center">
                <Animated.View style={{ transform: [{ translateX: scanShakeAnimation }] }}>
                  <Box className="w-15 h-15 rounded-full bg-background-800 items-center justify-center">
                    <Camera size={40} color="#f8fafc" />
                  </Box>
                </Animated.View>
              </Box>
            </Box>
            <Button
              size="md"
              variant="solid"
              action="primary"
              className="self-start mt-4 rounded-lg"
              onPress={() => router.push("/scan")}
            >
              <ButtonText>Open Tool</ButtonText>
            </Button>
          </Card>
        </TouchableOpacity>
      </VStack>
    </Box>
  );
}

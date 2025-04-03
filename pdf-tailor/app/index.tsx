import React, { useRef, useEffect, useState } from "react";
import { Animated, TouchableOpacity, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Camera, ScissorsLineDashed, Combine } from "lucide-react-native";
import { router } from "expo-router";
import { Box } from "@/components/ui/box"
import { VStack } from "@/components/ui/vstack"
import { Card } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import {useFonts, Orbitron_700Bold} from "@expo-google-fonts/orbitron"
import { BannerAd, BannerAdSize, TestIds, InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';

// Add your actual interstitial ad unit ID here
const interstitialAdUnitId = Platform.select({
  ios: 'ca-app-pub-4830895917217834/2240962012',
  android: 'ca-app-pub-4830895917217834/6964898981',
}) ?? TestIds.INTERSTITIAL;

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

 // Add your actual ad unit ID here
 const bannerAdUnitId = Platform.select({
   ios: 'ca-app-pub-4830895917217834/7306163424',
   android: 'ca-app-pub-4830895917217834/9055203255',
 }) ?? TestIds.BANNER;

 // Function to show interstitial ad with 30% probability
 const showInterstitialAd = (route: "/split" | "/merge" | "/scan") => {
  // 30% chance to show ad
  if (Math.random() < 0.3) {
    const interstitial = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL);

    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      unsubscribeLoaded();
      interstitial.show();
    });

    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      unsubscribeClosed();
      // Navigate to the route after ad is closed
      router.push(route);
    });

    // Load the ad
    interstitial.load();
  } else {
    // If no ad is shown, navigate directly
    router.push(route);
  }
 };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        <Box className="flex-1 p-6 bg-background-0">
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
                  onPress={() => showInterstitialAd("/split")}
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
                  onPress={() => showInterstitialAd("/merge")}
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
                  onPress={() => showInterstitialAd("/scan")}
                >
                  <ButtonText>Open Tool</ButtonText>
                </Button>
              </Card>
            </TouchableOpacity>
          </VStack>
        </Box>
      </ScrollView>
      
      {/* Banner Ad */}
      <Box 
        className="absolute bottom-0 left-0 right-0 items-center mb-2"
      >
        <BannerAd
          unitId={TestIds.BANNER}
          size={BannerAdSize.BANNER}
        />
      </Box>
    </SafeAreaView>
  );
}

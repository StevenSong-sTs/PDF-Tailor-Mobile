import React, { useRef, useEffect, useState } from "react";
import { Animated, TouchableOpacity, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Camera, ScissorsLineDashed, Combine, Crown, ShieldCheck } from "lucide-react-native";
import { router } from "expo-router";
import { Box } from "@/components/ui/box"
import { VStack } from "@/components/ui/vstack"
import { Card } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import {useFonts, Orbitron_700Bold} from "@expo-google-fonts/orbitron"
import { BannerAd, BannerAdSize, TestIds, InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import LinearGradient from 'react-native-linear-gradient';
import { useInAppPurchase } from "@/context/InAppPurchaseContext";

const interstitialAdUnitId = Platform.select({
  ios: 'ca-app-pub-4830895917217834/2240962012',
  android: 'ca-app-pub-4830895917217834/6964898981',
}) ?? TestIds.INTERSTITIAL;

const bannerAdUnitId = Platform.select({
  ios: 'ca-app-pub-4830895917217834/7306163424',
  android: 'ca-app-pub-4830895917217834/9055203255',
}) ?? TestIds.BANNER;

export default function Index() {
 const [titleFontLoaded] = useFonts({
  Orbitron_700Bold,
 })

 const { isAdFree } = useInAppPurchase();
 
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
 }, []);

 // Function to navigate to route, conditionally showing ads
 const navigateTo = (route: "/split" | "/merge" | "/scan") => {
  if (isAdFree) {
    router.push(route);
  } else {
    showInterstitialAd(route);
  }
 };

 // Function to show interstitial ad with 30% probability
 const showInterstitialAd = (route: "/split" | "/merge" | "/scan") => {
  if (Math.random() < 0.3) {
    const interstitial = InterstitialAd.createForAdRequest(interstitialAdUnitId);

    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      unsubscribeLoaded();
      interstitial.show();
    });

    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      unsubscribeClosed();
      router.push(route);
    });

    interstitial.load();
  } else {
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
          <Box className="items-center justify-center mb-8">
            <Heading 
              size="3xl" 
              className="text-center" 
              style={{ fontFamily: titleFontLoaded ? "Orbitron_700Bold" : "sans-serif" }}
            >
              PDF Tailor
            </Heading>
            
            {/* Show ad-free badge if user has purchased */}
            {isAdFree && (
              <Box className="mt-2 bg-green-100 px-2 py-1 rounded-full flex-row items-center">
                <ShieldCheck size={16} color="#16a34a" />
                <Text className="text-xs text-green-700 font-bold ml-1">Ad-Free</Text>
              </Box>
            )}
          </Box>
          
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
                  onPress={() => navigateTo("/split")}
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
                  onPress={() => navigateTo("/merge")}
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
                  onPress={() => navigateTo("/scan")}
                >
                  <ButtonText>Open Tool</ButtonText>
                </Button>
              </Card>
            </TouchableOpacity>

            {/* Only show Unlock Ads Free card if not already ad-free */}
            {!isAdFree && (
              <TouchableOpacity 
                activeOpacity={0.9}
                onPress={() => router.push("/remove-ads")}
              >
                <Card size="md" variant="elevated" className="p-6 rounded-2xl overflow-hidden">
                  <LinearGradient
                    colors={['#0054B4', '#40E0D0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 16,
                    }}
                  />
                  <Box className="flex-row gap-4 relative">
                    <VStack className="flex-1 justify-center">
                      <Heading size="xl" className="text-white">
                        Unlock Ads Free Experience
                      </Heading>
                    </VStack>
                    <Box className="w-20 items-center justify-center">
                      <Box className="w-15 h-15 rounded-full bg-white/20 items-center justify-center">
                        <Crown size={40} color="#ffffff" />
                      </Box>
                    </Box>
                  </Box>
                </Card>
              </TouchableOpacity>
            )}
          </VStack>
        </Box>
      </ScrollView>
      
      {/* Banner Ad - only shown if not ad-free */}
      {!isAdFree && (
        <Box 
          className="absolute bottom-0 left-0 right-0 items-center mb-2"
        >
          <BannerAd
            unitId={bannerAdUnitId}
            size={BannerAdSize.BANNER}
          />
        </Box>
      )}
    </SafeAreaView>
  );
}

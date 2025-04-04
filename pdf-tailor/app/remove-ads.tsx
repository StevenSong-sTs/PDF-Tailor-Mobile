import React from 'react';
import { SafeAreaView, ScrollView, Image, View, Dimensions } from 'react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { ArrowLeft, Zap } from 'lucide-react-native';
import { router } from 'expo-router';
import LinearGradient from 'react-native-linear-gradient';
import {useFonts, Orbitron_600SemiBold} from "@expo-google-fonts/orbitron"

export default function RemoveAdsRoute() {
  const [titleFontLoaded] = useFonts({
    Orbitron_600SemiBold,
  });
  
  // Get screen height to adjust layout
  const { height } = Dimensions.get('window');

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#0054b4', '#40e0d0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <Box className="flex-1 p-6">
              {/* Header with Back Button */}
              <Box className="flex-row items-center justify-between mb-8">
                <Button
                  size="sm"
                  variant="link"
                  onPress={() => router.back()}
                  className="self-start"
                >
                  <ArrowLeft size={24} color="#ffffff" />
                  <ButtonText className="text-white ml-1">Back</ButtonText>
                </Button>
                <Heading 
                  size="2xl" 
                  className="text-white"
                  style={{ fontFamily: titleFontLoaded ? "Orbitron_600SemiBold" : "sans-serif" }}
                >
                  Remove Ads
                </Heading>
                <Box className="w-20">
                  <Text className="hidden">Spacer for centering</Text>
                </Box>
              </Box>

              <Box style={{ flex: 1, justifyContent: 'space-between' }}>
                {/* Top Section */}
                <VStack space="xl" className="items-center">
                  {/* Description */}
                  <Text className="text-center text-white/90 font-bold text-2xl">
                    Support our development and enjoy an uninterrupted experience
                    with our premium ad-free version.
                  </Text>

                  {/* Image */}
                  <View style={{ 
                    width: '100%', 
                    height: Math.min(height * 0.35, 300),
                    marginTop: 20,
                    marginBottom: 20,
                    borderRadius: 12,
                    overflow: 'hidden'
                  }}>
                    <Image
                      source={require('@/assets/images/scissors_transparent.png')}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="contain"
                    />
                  </View>
                </VStack>

                {/* Bottom Section */}
                <VStack space="xl" className="mt-auto">
                  {/* Price */}
                  <Box className="bg-white/20 p-4 rounded-lg">
                    <Text className="text-center text-2xl font-bold text-white mb-2">
                      $2.99
                    </Text>
                    <Text className="text-center text-white">
                      One-time payment
                    </Text>
                  </Box>

                  {/* Buttons */}
                  <VStack space="md" className="w-full">
                    <Button
                      size="lg"
                      variant="solid"
                      action="primary"
                      className="w-full bg-white"
                      style={{ 
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 6,
                        elevation: 8,
                        paddingVertical: 16,
                        height: 60,
                      }}
                    >
                      <Zap size={24} color="#0054b4" />
                      <ButtonText className="text-[#0054b4] ml-2 text-xl font-bold">
                        Unlock Now
                      </ButtonText>
                    </Button>

                    <Button
                      size="lg"
                      variant="outline"
                      action="secondary"
                      className="w-full border-white"
                      style={{
                        height: 50,
                        paddingVertical: 12,
                      }}
                    >
                      <ButtonText className="text-white">Restore Purchase</ButtonText>
                    </Button>
                  </VStack>
                </VStack>
              </Box>
            </Box>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
} 
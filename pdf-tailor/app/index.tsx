import { View } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Camera, ScissorsLineDashed, Combine } from "lucide-react-native";
import { router } from "expo-router";
import { Box } from "@/components/ui/box"
import { HStack } from "@/components/ui/hstack"
import { VStack } from "@/components/ui/vstack"
import { Card } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"

export default function Index() {
  return (
    <Box className="flex-1 p-6 bg-background-0 pt-20">
      <Heading size="2xl" className="text-center mb-8">
        PDF Tailor
      </Heading>
      
      <VStack space="xl">
        {/* Split PDF Card */}
        <Card size="md" variant="elevated" className="bg-background-50 p-6 rounded-2xl">
          <Box className="flex-row gap-4">
            <VStack space="xs" className="flex-1">
              <Heading size="xl">Split PDF</Heading>
              <Text className="text-typography-500 font-bold">Divide documents easily</Text>
              <Text className="text-typography-400 text-sm mt-2">
                Split large PDFs into smaller files
                Organize your documents efficiently
              </Text>
            </VStack>
            <Box className="w-20 items-center justify-center">
              <Box className="w-15 h-15 rounded-full bg-background-100 items-center justify-center">
                <ScissorsLineDashed size={40} color="#64748b" />
              </Box>
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

        {/* Merge PDFs Card */}
        <Card size="md" variant="elevated" className="bg-info-100 p-6 rounded-2xl">
          <Box className="flex-row gap-4">
            <VStack space="xs" className="flex-1">
              <Heading size="xl">Merge PDFs</Heading>
              <Text className="text-typography-500 font-bold">Combine multiple files</Text>
              <Text className="text-typography-400 text-sm mt-2">
                Join PDFs seamlessly
                Perfect for document compilation
              </Text>
            </VStack>
            <Box className="w-20 items-center justify-center">
              <Box className="w-15 h-15 rounded-full bg-info-200 items-center justify-center">
                <Combine size={40} color="#0369a1" />
              </Box>
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

        {/* Scan to PDF Card */}
        <Card size="md" variant="elevated" className="bg-background-900 p-6 rounded-2xl">
          <Box className="flex-row gap-4">
            <VStack space="xs" className="flex-1">
              <Heading size="xl" className="text-typography-0">
                Scan to PDF
              </Heading>
              <Text className="text-typography-400 font-bold">Digital transformation</Text>
              <Text className="text-typography-500 text-sm mt-2">
                Convert images instantly
                Professional quality results
              </Text>
            </VStack>
            <Box className="w-20 items-center justify-center">
              <Box className="w-15 h-15 rounded-full bg-background-800 items-center justify-center">
                <Camera size={40} color="#f8fafc" />
              </Box>
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
      </VStack>
    </Box>
  );
}

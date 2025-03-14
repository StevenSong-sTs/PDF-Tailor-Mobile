import { View, StyleSheet, Dimensions, Image } from "react-native";
import React, { Fragment, useState, useEffect, useRef } from "react";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { FileText, Camera as CameraIcon, Check, X, Eye, Trash2, FileDown, ArrowLeft } from "lucide-react-native";
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import Svg, { Rect, Mask } from 'react-native-svg';
import {
  ColorMatrix,
  concatColorMatrices,
  grayscale,
  contrast,
  brightness
} from 'react-native-color-matrix-image-filters';
import ViewShot, { ViewShotProperties } from "react-native-view-shot";
import * as FileSystem from 'expo-file-system';
import { GestureHandlerRootView, TouchableOpacity, Swipeable, RectButton } from 'react-native-gesture-handler';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import * as Sharing from 'expo-sharing';
import { PDFDocument } from 'pdf-lib';
import { Toast, ToastDescription, useToast } from "@/components/ui/toast";
import { Spinner } from '@/components/ui/spinner';
import { SafeAreaView } from "react-native-safe-area-context";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import {useFonts, Orbitron_600SemiBold} from "@expo-google-fonts/orbitron";
import { useRouter } from "expo-router";

const DOCUMENT_ASPECT_RATIO = 8.5 / 11; // Standard US Letter size
const CONTAINER_PADDING = 20;

export default function Scan() {
  const [titleFontLoaded] = useFonts({
    Orbitron_600SemiBold,
  });
  const [cameraReady, setCameraReady] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraLayout, setCameraLayout] = useState({ width: 0, height: 0 });
  const [scannedPages, setScannedPages] = useState<Array<{ id: string, uri: string }>>([]);
  const viewShotRef = useRef<ViewShot & { capture: () => Promise<string> }>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (cameraRef.current) {
        cameraRef.current = null;
      }
    };
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current || cameraLayout.width === 0 || cameraLayout.height === 0) return;
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1.0,
      });
      
      // Get the actual image dimensions
      const imageWidth = photo.width;
      const imageHeight = photo.height;
      
      // Calculate the scale factors between the camera view and the actual image
      const scaleX = imageWidth / cameraLayout.width;
      const scaleY = imageHeight / cameraLayout.height;
      
      // Calculate crop values in the actual image coordinates based on the camera view layout
      const cropX = Math.floor((cameraLayout.width * 0.1) * scaleX);
      const cropY = Math.floor((cameraLayout.height * 0.15) * scaleY);
      const cropWidth = Math.floor((cameraLayout.width * 0.8) * scaleX);
      // Using cameraLayout.width for consistency in height calculation (adjust if needed)
      const cropHeight = Math.floor((cameraLayout.width * 0.8 / DOCUMENT_ASPECT_RATIO) * scaleX);
      
      // First crop the image
      const cropped = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{
          crop: {
            originX: cropX,
            originY: cropY,
            width: cropWidth,
            height: cropHeight,
          },
        }],
        { compress: 1 }
      );

      setCapturedImage(cropped.uri);
    } catch (error) {
      console.error("Error processing image:", error);
    }
  };

  const saveEnhancedImage = async (uri: string): Promise<string> => {
    if (!viewShotRef.current) {
      throw new Error('ViewShot ref not available');
    }

    try {
      const enhancedUri = await viewShotRef.current.capture();
      return enhancedUri;
    } catch (error) {
      console.error('Error capturing enhanced image:', error);
      throw error;
    }
  };

  const handleContinue = async () => {
    if (capturedImage) {
      try {
        const enhancedUri = await saveEnhancedImage(capturedImage);
        setScannedPages(prev => [...prev, {
          id: Date.now().toString(),
          uri: enhancedUri
        }]);
        setCapturedImage(null);
      } catch (error) {
        console.error('Error saving enhanced image:', error);
      }
    }
  };

  const handleCancel = () => {
    setCapturedImage(null);
  };

  const removePage = (id: string) => {
    setScannedPages(prev => prev.filter(page => page.id !== id));
  };

  const handleExport = async () => {
    if (scannedPages.length === 0) return;
    
    setIsExporting(true);
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      
      // Add each scanned image as a page
      for (const pageItem of scannedPages) {
        const imageBytes = await FileSystem.readAsStringAsync(pageItem.uri, {
          encoding: FileSystem.EncodingType.Base64
        });
        
        // Convert JPEG to PDF page
        const jpgImage = await pdfDoc.embedJpg(imageBytes);
        const jpgDims = jpgImage.scale(1);
        
        // Add a page with the same dimensions as the image
        const pdfPage = pdfDoc.addPage([jpgDims.width, jpgDims.height]);
        pdfPage.drawImage(jpgImage, {
          x: 0,
          y: 0,
          width: jpgDims.width,
          height: jpgDims.height,
        });
      }
      
      // Save the PDF
      const pdfBytes = await pdfDoc.saveAsBase64();
      
      // Write to a temporary file
      const tempFileName = `scanned_document_${Date.now()}.pdf`;
      const tempFilePath = `${FileSystem.cacheDirectory}${tempFileName}`;
      await FileSystem.writeAsStringAsync(tempFilePath, pdfBytes, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      // Share the file
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(tempFilePath, {
          mimeType: 'application/pdf',
          dialogTitle: 'Save your scanned PDF',
          UTI: 'com.adobe.pdf',
        });
        
        toast.show({
          render: () => (
            <Toast action="success">
              <ToastDescription>PDF exported successfully!</ToastDescription>
            </Toast>
          )
        });
      } else {
        throw new Error("Sharing is not available on this platform");
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.show({
        render: () => (
          <Toast action="error">
            <ToastDescription>Failed to export PDF. Please try again.</ToastDescription>
          </Toast>
        )
      });
    } finally {
      setIsExporting(false);
    }
  };

  const renderScannedPage = ({ item, drag, isActive }: { 
    item: { id: string, uri: string }; 
    drag: () => void; 
    isActive: boolean 
  }) => {
    const renderRightActions = () => {
      return (
        <Box className="h-[82px] flex items-center my-16 mr-4">
          <Button
            variant="solid"
            action="negative"
            className="w-20 h-36 rounded-lg justify-center"
            onPress={() => removePage(item.id)}
          >
            <Trash2 size={20} color="white" />
          </Button>
        </Box>
      );
    };
    
    return (
      <ScaleDecorator activeScale={0.95}>
        <Swipeable
          renderRightActions={renderRightActions}
          friction={2}
          overshootRight={false}
        >
          <View
            style={[
              styles.pageItem,
              { opacity: isActive ? 0.7 : 1 }
            ]}
          >
            <TouchableOpacity
              onLongPress={drag}
              delayLongPress={150}
              style={styles.pageContent}
            >
              <View style={styles.pageContentInner}>
                <Image 
                  source={{ uri: item.uri }} 
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
                <Text style={styles.pageNumber}>
                  Page {scannedPages.findIndex(page => page.id === item.id) + 1}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Swipeable>
      </ScaleDecorator>
    );
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }
  
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
        <Button onPress={requestPermission}>
          <ButtonText>Grant Permission</ButtonText>
        </Button>
      </View>
    );
  }

  if (showPreview) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Box className="flex-1 bg-background-50">
            {/* Header */}
            <Box className="p-4 bg-background-100">
              <Box className="flex-row items-center justify-between mb-2">
                <Button
                  size="sm"
                  variant="link"
                  onPress={() => router.back()}
                  className="self-start"
                >
                  <ArrowLeft size={24} color="#64748b" />
                  <ButtonText className="text-gray-600 ml-1">Back</ButtonText>
                </Button>
                <Heading 
                  size="2xl" 
                  style={{ fontFamily: titleFontLoaded ? "Orbitron_600SemiBold" : "sans-serif" }}
                >
                  Scan PDF
                </Heading>
                <Box className="w-20">
                  <Text className="hidden">Spacer for centering</Text>
                </Box>
              </Box>
              <Text className="text-gray-600 text-center">Scan documents and convert to PDF</Text>
            </Box>

            <Box className="p-6 flex-1 bg-background-50">
              <VStack space="md" className="flex-1">
                <Card size="md" variant="elevated" className="bg-white p-4 rounded-xl">
                  <Box className="flex-row justify-between items-center">
                    <Box className="flex-1">
                      <Text size="sm" className="text-gray-500 italic">
                        Hold and drag to reorder. Swipe left to remove.
                      </Text>
                    </Box>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="rounded-lg ml-4 shrink-0"
                      onPress={() => setShowPreview(false)}
                    >
                      <ButtonText>Back to Camera</ButtonText>
                    </Button>
                  </Box>
                </Card>

                <Box className="flex-1">
                  <DraggableFlatList
                    data={scannedPages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderScannedPage}
                    onDragEnd={({ data }) => setScannedPages(data)}
                    contentContainerStyle={{ padding: 16 }}
                  />
                </Box>

                <Button
                  size="lg"
                  variant="solid"
                  action="primary"
                  className="rounded-xl"
                  onPress={handleExport}
                  disabled={isExporting || scannedPages.length === 0}
                >
                  {isExporting ? (
                    <Spinner size="small" />
                  ) : (
                    <>
                      <FileDown size={24} color="white" />
                      <ButtonText>Export PDF</ButtonText>
                    </>
                  )}
                </Button>
              </VStack>
            </Box>
          </Box>
        </GestureHandlerRootView>
      </SafeAreaView>
    );
  }

  if (capturedImage) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
        <Box className="flex-1 bg-background-50">
          {/* Header */}
          <Box className="p-4 bg-background-100">
            <Box className="flex-row items-center justify-between mb-2">
              <Button
                size="sm"
                variant="link"
                onPress={() => router.back()}
                className="self-start"
              >
                <ArrowLeft size={24} color="#64748b" />
                <ButtonText className="text-gray-600 ml-1">Back</ButtonText>
              </Button>
              <Heading 
                size="2xl" 
                style={{ fontFamily: titleFontLoaded ? "Orbitron_600SemiBold" : "sans-serif" }}
              >
                Scan PDF
              </Heading>
              <Box className="w-20">
                <Text className="hidden">Spacer for centering</Text>
              </Box>
            </Box>
            <Text className="text-gray-600 text-center">Scan documents and convert to PDF</Text>
          </Box>

          <Box className="p-6 flex-1 bg-background-50">
            <VStack space="md" className="flex-1">
              <Card size="md" variant="elevated" className="bg-white p-4 rounded-xl">
                <Text size="lg" bold>Review Document</Text>
              </Card>

              <Box className="flex-1 bg-white rounded-xl overflow-hidden">
                <ViewShot
                  ref={viewShotRef}
                  options={{
                    format: "jpg",
                    quality: 0.9,
                  }}
                >
                  <ColorMatrix
                    matrix={concatColorMatrices(
                      grayscale(1),
                      contrast(1.2),
                      brightness(1.1)
                    )}
                  >
                    <Image 
                      source={{ uri: capturedImage }} 
                      style={styles.previewImage} 
                      resizeMode="cover"
                    />
                  </ColorMatrix>
                </ViewShot>
              </Box>

              <Box className="flex-row justify-between gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  action="negative"
                  className="flex-1 rounded-xl"
                  onPress={handleCancel}
                >
                  <X size={24} color="red" />
                  <ButtonText>Cancel</ButtonText>
                </Button>
                <Button 
                  size="lg"
                  variant="solid"
                  action="primary"
                  className="flex-1 rounded-xl"
                  onPress={handleContinue}
                >
                  <Check size={24} color="white" />
                  <ButtonText>Continue</ButtonText>
                </Button>
              </Box>
            </VStack>
          </Box>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Box className="flex-1 bg-background-50">
          {/* Header */}
          <Box className="p-4 bg-background-100">
            <Box className="flex-row items-center justify-between mb-2">
              <Button
                size="sm"
                variant="link"
                onPress={() => router.back()}
                className="self-start"
              >
                <ArrowLeft size={24} color="#64748b" />
                <ButtonText className="text-gray-600 ml-1">Back</ButtonText>
              </Button>
              <Heading 
                size="2xl" 
                style={{ fontFamily: titleFontLoaded ? "Orbitron_600SemiBold" : "sans-serif" }}
              >
                Scan PDF
              </Heading>
              <Box className="w-20">
                <Text className="hidden">Spacer for centering</Text>
              </Box>
            </Box>
            <Text className="text-gray-600 text-center">Scan documents and convert to PDF</Text>
          </Box>

          <Box className="p-6 flex-1 bg-background-50">
            <VStack space="md" className="flex-1">
              <Card size="md" variant="elevated" className="bg-white p-4 rounded-xl">
                <Box className="flex-row justify-between items-center">
                  <Text size="sm" className="text-gray-500">
                    Position document within the frame
                  </Text>
                  {scannedPages.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg"
                      onPress={() => setShowPreview(true)}
                    >
                      <Eye size={20} />
                      <ButtonText>Preview ({scannedPages.length})</ButtonText>
                    </Button>
                  )}
                </Box>
              </Card>

              <Box 
                className="flex-1 bg-white rounded-xl overflow-hidden"
                onLayout={(event) => {
                  setCameraLayout(event.nativeEvent.layout);
                }}
              >
                <CameraView
                  ref={cameraRef}
                  style={styles.camera}
                  facing="back"
                  onCameraReady={() => {
                    setCameraReady(true);
                  }}
                >
                  <View style={styles.overlay}>
                    <Svg style={styles.svgOverlay}>
                      <Mask id="mask">
                        <Rect width="100%" height="100%" fill="white" />
                        <Rect
                          x={cameraLayout.width ? cameraLayout.width * 0.1 : 0}
                          y={cameraLayout.height ? cameraLayout.height * 0.15 : 0}
                          width={cameraLayout.width ? cameraLayout.width * 0.8 : 0}
                          height={cameraLayout.width ? cameraLayout.width * 0.8 / DOCUMENT_ASPECT_RATIO : 0}
                          fill="black"
                        />
                      </Mask>
                      <Rect
                        width="100%"
                        height="100%"
                        fill="rgba(0, 0, 0, 0.6)"
                        mask="url(#mask)"
                      />
                    </Svg>
                  </View>
                  <View 
                    style={[
                      styles.documentFrame,
                      {
                        top: cameraLayout.height ? cameraLayout.height * 0.15 : 0,
                        left: cameraLayout.width ? cameraLayout.width * 0.1 : 0,
                        width: cameraLayout.width ? cameraLayout.width * 0.8 : 0,
                        height: cameraLayout.width ? cameraLayout.width * 0.8 / DOCUMENT_ASPECT_RATIO : 0,
                      }
                    ]}
                  />
                </CameraView>
              </Box>

              <Box className="flex-row justify-center">
                <Button
                  size="xl"
                  variant="solid"
                  action="primary"
                  className="rounded-full w-20 h-20"
                  disabled={!cameraReady}
                  onPress={handleCapture}
                >
                  <CameraIcon size={32} color="white" />
                </Button>
              </Box>
            </VStack>
          </Box>
        </Box>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const windowWidth = Dimensions.get('window').width;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: CONTAINER_PADDING,
    gap: 20,
  },
  title: {
    marginBottom: 10,
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  documentFrame: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
  },
  captureButton: {
    flex: 1,
  },
  previewButton: {
    flex: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  instructions: {
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 10,
  },
  pageListContainer: {
    flex: 1,
    width: '100%',
  },
  pageList: {
    padding: 10,
  },
  pageItem: {
    width: '100%',
    padding: 10,
  },
  pageContent: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  pageContentInner: {
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  thumbnailImage: {
    width: '40%',
    aspectRatio: 0.7071,
    borderRadius: 4,
  },
  pageNumber: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  previewContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: Dimensions.get('window').height * 0.5,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    aspectRatio: DOCUMENT_ASPECT_RATIO,
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  svgOverlay: {
    flex: 1,
  },
  previewHeaderButtons: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
});

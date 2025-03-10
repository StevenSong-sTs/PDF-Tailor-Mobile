import { View, StyleSheet, Dimensions, Image, TouchableOpacity } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useState, useEffect, useRef } from "react";
import { FileText, Camera as CameraIcon, Check, X } from "lucide-react-native";
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import Svg, { Rect, Mask } from 'react-native-svg';

export default function Scan() {
  const [cameraReady, setCameraReady] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      // Force camera to null on unmount
      if (cameraRef.current) {
        cameraRef.current = null;
      }
    };
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });


      // Calculate crop dimensions
      const cropX = photo.width * 0.1;
      const cropY = photo.height * 0.15;
      const cropWidth = photo.width * 0.8;
      const cropHeight = (cropWidth * 11) / 8.5;

      // Create manipulator directly with the photo URI
      const manipulatorResult = await ImageManipulator.manipulateAsync(
        photo.uri,
        [
          {
            crop: {
              originX: cropX,
              originY: cropY,
              width: cropWidth,
              height: cropHeight
            }
          },
          {
            resize: {
              width: 1024
            }
          }
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG
        }
      );

      setCapturedImage(manipulatorResult.uri);
    } catch (error) {
      console.error("Error processing image:", error);
    }
  };

  const handleContinue = () => {
    // In the next step, we'll handle saving this image and continuing with more pages
    console.log("Continue with captured image:", capturedImage);
    setCapturedImage(null);
  };

  const handleCancel = () => {
    setCapturedImage(null);
  };

  if (!permission) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
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

  // Show image preview if an image is captured
  if (capturedImage) {
    return (
      <View style={styles.container}>
        <Text size="xl" bold style={styles.title}>Review Document</Text>
        
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
        </View>
        
        <View style={styles.previewControls}>
          <Button
            variant="outline"
            action="negative"
            style={styles.previewButton} 
            onPress={handleCancel}
          >
            <X size={20} color="red" />
            <ButtonText>Cancel</ButtonText>
          </Button>
          
          <Button 
            style={styles.previewButton}
            onPress={handleContinue}
          >
            <Check size={20} color="white" />
            <ButtonText>Continue</ButtonText>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text size="xl" bold style={styles.title}>Scan Document</Text>
      
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          onCameraReady={() => {
            console.log("Camera ready");
            setCameraReady(true);
          }}
        >
          <View style={styles.overlay}>
            <Svg style={styles.svgOverlay}>
              <Mask id="mask">
                <Rect width="100%" height="100%" fill="white" />
                <Rect
                  x={AVAILABLE_WIDTH * 0.1}
                  y={windowHeight * 0.15}
                  width={AVAILABLE_WIDTH * 0.8}
                  height={AVAILABLE_WIDTH * 0.8 / DOCUMENT_ASPECT_RATIO}
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
          <View style={styles.documentFrame} />
        </CameraView>
      </View>
      
      <View style={styles.controls}>
        <Button
          disabled={!cameraReady}
          onPress={handleCapture}
        >
          <CameraIcon size={20} color="white" />
          <ButtonText>Capture Document</ButtonText>
        </Button>
      </View>
    </View>
  );
}

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const DOCUMENT_ASPECT_RATIO = 8.5 / 11; // Standard US Letter size
const CONTAINER_PADDING = 20; // Match the container padding
const AVAILABLE_WIDTH = windowWidth - (CONTAINER_PADDING * 2); // Account for padding on both sides

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
    top: windowHeight * 0.15,
    left: AVAILABLE_WIDTH * 0.1,
    width: AVAILABLE_WIDTH * 0.8,
    height: AVAILABLE_WIDTH * 0.8 / DOCUMENT_ASPECT_RATIO,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 8,
  },
  controls: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  previewContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  previewButton: {
    flex: 1,
    marginHorizontal: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  svgOverlay: {
    flex: 1,
  },
});
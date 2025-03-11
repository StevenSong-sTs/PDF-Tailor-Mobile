import { View, StyleSheet, Dimensions, Image } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useState, useEffect, useRef } from "react";
import { FileText, Camera as CameraIcon, Check, X } from "lucide-react-native";
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import Svg, { Rect, Mask } from 'react-native-svg';

const DOCUMENT_ASPECT_RATIO = 8.5 / 11; // Standard US Letter size
const CONTAINER_PADDING = 20;

export default function Scan() {
  const [cameraReady, setCameraReady] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraLayout, setCameraLayout] = useState({ width: 0, height: 0 });

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
        quality: 0.8,
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
      
      // Crop the image using ImageManipulator
      const manipResult = await ImageManipulator.manipulateAsync(
        photo.uri,
        [
          {
            crop: {
              originX: cropX,
              originY: cropY,
              width: cropWidth,
              height: cropHeight,
            },
          },
        ],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      setCapturedImage(manipResult.uri);
    } catch (error) {
      console.error("Error processing image:", error);
    }
  };

  const handleContinue = () => {
    console.log("Continue with captured image:", capturedImage);
    setCapturedImage(null);
  };

  const handleCancel = () => {
    setCapturedImage(null);
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

  if (capturedImage) {
    return (
      <View style={styles.container}>
        <Text size="xl" bold style={styles.title}>Review Document</Text>
        <View style={styles.previewContainer}>
          <Image 
            source={{ uri: capturedImage }} 
            style={styles.previewImage} 
            resizeMode="cover"
          />
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
      
      <View 
        style={styles.cameraContainer}
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
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
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

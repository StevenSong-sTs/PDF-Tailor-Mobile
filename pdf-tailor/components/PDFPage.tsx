import React, { useState } from "react";
import { View, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import Pdf from 'react-native-pdf';

interface PDFPageProps {
  uri: string;
  pageNumber: number;
  isSelected: boolean;
  onPress: (pageNumber: number) => void;
}

export function PDFPage({ uri, pageNumber, isSelected, onPress }: PDFPageProps) {
  // Add state to track PDF dimensions for responsive sizing
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const screenWidth = Dimensions.get('window').width - 40; // Subtract padding
  
  return (
    <View 
      style={[styles.container, isSelected && styles.selected]} 
      // Using View with onStartShouldSetResponder to better control touch handling
      onStartShouldSetResponder={() => false}
      onMoveShouldSetResponder={() => false}
    >
      <Pdf
        source={{ uri }}
        page={pageNumber}
        singlePage={true}
        style={[
          styles.pdf,
          // Dynamically calculate height based on PDF aspect ratio
          pdfDimensions.width > 0 ? {
            height: (pdfDimensions.height / pdfDimensions.width) * screenWidth
          } : { height: 300 } // Default height until PDF loads
        ]}
        enablePaging={false}
        onLoadComplete={(numberOfPages, filePath, { width, height }) => {
          console.log(`PDF loaded: Page ${pageNumber} of ${numberOfPages}, dimensions: ${width}x${height}`);
          setPdfDimensions({ width, height });
        }}
        onError={(error) => {
          console.error(`PDF loading error on page ${pageNumber}:`, error);
        }}
      />
      {/* Overlay for handling selection */}
      <TouchableOpacity 
        style={styles.touchOverlay}
        onPress={() => onPress(pageNumber)}
        activeOpacity={1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    // Remove any fixed height constraints
    width: Dimensions.get('window').width - 40,
    position: 'relative', // For positioning the overlay
  },
  selected: {
    borderWidth: 2,
    borderColor: 'green',
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
  },
  pdf: {
    width: Dimensions.get('window').width - 40,
    // Height will be set dynamically based on PDF dimensions
  },
  touchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  }
});

import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Text, ActivityIndicator } from "react-native";
import { PDFPage } from "./PDFPage";
import * as FileSystem from 'expo-file-system';
import { PDFDocument } from 'pdf-lib';

interface PDFViewerProps {
  uri: string;
  style?: object;
  onPageCountChange?: (pageCount: number) => void;
  renderPageIndicator?: (pageNumber: number) => React.ReactNode;
  onPagePress?: (pageNumber: number) => void;
  highlightedPages?: number[];
}

export function PDFViewer({
  uri,
  style,
  onPageCountChange,
  renderPageIndicator,
  onPagePress,
  highlightedPages = []
}: PDFViewerProps) {
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getPageCount() {
      if (!uri) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Get PDF data
        const pdfBytes = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64
        });
        
        // Load the PDF document to get page count
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const count = pdfDoc.getPageCount();
        
        setPageCount(count);
        onPageCountChange?.(count);
        setLoading(false);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError("Failed to load PDF document. Please try another file.");
        setLoading(false);
      }
    }
    
    getPageCount();
  }, [uri]);

  if (!uri) {
    return (
      <View style={[styles.container, style]}>
        <Text>No PDF document selected</Text>
      </View>
    );
  }
  
  if (loading) {
    return (
      <View style={[styles.container, style, styles.centerContent]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading PDF...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={[styles.container, style, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Create a data array for FlatList
  const pagesData = Array.from({ length: pageCount }, (_, i) => ({ id: i + 1 }));

  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={pagesData}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={true}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <View style={styles.pageWrapper}>
            {renderPageIndicator && (
              <View style={styles.pageIndicator}>
                {renderPageIndicator(item.id)}
              </View>
            )}
            <PDFPage
              uri={uri}
              pageNumber={item.id}
              isSelected={highlightedPages.includes(item.id)}
              onPress={onPagePress || (() => {})}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  pageWrapper: {
    position: 'relative',
    alignItems: 'center',
    width: '100%',
  },
  separator: {
    height: 20, // Larger space between pages
  },
  pageIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 20,
  }
});

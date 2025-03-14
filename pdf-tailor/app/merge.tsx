import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import * as DocumentPicker from 'expo-document-picker';
import { useState, useRef } from "react";
import { FileText, X, Eye, FileDown, Trash2, ArrowLeft } from "lucide-react-native";
import { Toast, ToastDescription, useToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { PDFDocument } from 'pdf-lib';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler';
import SwipeableItem, { useSwipeableItemParams } from 'react-native-swipeable-item';
import { PDFViewer } from "@/components/PDFViewer";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {useFonts, Orbitron_600SemiBold} from "@expo-google-fonts/orbitron";

// Interface to represent a PDF file in our merge list
interface PDFFile {
  id: string;
  uri: string;
  name: string;
  pageCount: number;
}

export default function Merge() {
  const [selectedFiles, setSelectedFiles] = useState<PDFFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [mergedPdfUri, setMergedPdfUri] = useState<string | null>(null);
  const toast = useToast();
  const [titleFontLoaded] = useFonts({
    Orbitron_600SemiBold,
  });

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      
      if (result.assets && result.assets[0]) {
        // Get page count of the PDF
        setIsLoading(true);
        try {
          const pdfBytes = await FileSystem.readAsStringAsync(result.assets[0].uri, {
            encoding: FileSystem.EncodingType.Base64
          });
          
          const pdfDoc = await PDFDocument.load(pdfBytes);
          const pageCount = pdfDoc.getPageCount();
          
          // Add the file to the selected files
          const newFile: PDFFile = {
            id: Date.now().toString(),
            uri: result.assets[0].uri,
            name: result.assets[0].name,
            pageCount: pageCount
          };
          
          setSelectedFiles(prev => [...prev, newFile]);
        } catch (error) {
          console.error("Error processing PDF:", error);
          toast.show({
            render: () => (
              <Toast action="error">
                <ToastDescription>Failed to process PDF. Please try again.</ToastDescription>
              </Toast>
            )
          });
        } finally {
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== id));
  };

  const previewMergedPdf = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsLoading(true);
    try {
      // Create a new PDF document
      const mergedPdfDoc = await PDFDocument.create();
      
      // Add pages from each selected file
      for (const file of selectedFiles) {
        const pdfBytes = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64
        });
        
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = await mergedPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
        
        // Add all pages to merged document
        pages.forEach(page => {
          mergedPdfDoc.addPage(page);
        });
      }
      
      // Save the merged PDF
      const mergedPdfBytes = await mergedPdfDoc.saveAsBase64();
      
      // Write to a temporary file
      const tempFileName = `merged_preview_${Date.now()}.pdf`;
      const tempFilePath = `${FileSystem.cacheDirectory}${tempFileName}`;
      await FileSystem.writeAsStringAsync(tempFilePath, mergedPdfBytes, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      setMergedPdfUri(tempFilePath);
      setShowPreview(true);
    } catch (error) {
      console.error("Error previewing merged PDF:", error);
      toast.show({
        render: () => (
          <Toast action="error">
            <ToastDescription>Failed to create preview. Please try again.</ToastDescription>
          </Toast>
        )
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportMergedPdf = async () => {
    if (!mergedPdfUri) {
      // If no preview has been generated yet, create one
      await previewMergedPdf();
      if (!mergedPdfUri) return;
    }
    
    try {
      // Share the file, allowing user to choose where to save it
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(mergedPdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Save your merged PDF',
          UTI: 'com.adobe.pdf',
        });
      } else {
        throw new Error("Sharing is not available on this platform");
      }
    } catch (error) {
      console.error("Error exporting merged PDF:", error);
      toast.show({
        render: () => (
          <Toast action="error">
            <ToastDescription>Failed to export merged PDF. Please try again.</ToastDescription>
          </Toast>
        )
      });
    }
  };

  const UnderlayLeft = ({ onDelete, id }: { onDelete: (id: string) => void, id: string }) => {
    const { close } = useSwipeableItemParams<PDFFile>();
    return (
      <Box className="absolute right-0 h-full justify-center">
        <Button
          variant="solid"
          action="negative"
          className="h-20 w-20 rounded-lg"
          onPress={() => {
            onDelete(id);
            close();
          }}
        >
          <Trash2 size={20} color="white" />
        </Button>
      </Box>
    );
  };

  const renderPDFFile = ({ item, drag, isActive }: { 
    item: PDFFile; 
    drag: () => void; 
    isActive: boolean 
  }) => {
    return (
      <ScaleDecorator activeScale={0.95}>
        <SwipeableItem
          key={item.id}
          item={item}
          renderUnderlayLeft={() => <UnderlayLeft onDelete={removeFile} id={item.id} />}
          snapPointsLeft={[80]}
        >
          <View
            style={[
              styles.fileItem,
              { opacity: isActive ? 0.7 : 1 }
            ]}
          >
            <TouchableOpacity
              onLongPress={drag}
              delayLongPress={150}
              style={styles.fileContent}
            >
              <View style={styles.fileInfo}>
                <View style={styles.fileIconContainer}>
                  <FileText size={40} color="#333" />
                </View>
                <View style={styles.fileDetails}>
                  <View style={styles.pageBadge}>
                    <Text style={styles.pageCount}>{item.pageCount} pages</Text>
                  </View>
                  <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </SwipeableItem>
      </ScaleDecorator>
    );
  };

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
                Merge PDF
              </Heading>
              <Box className="w-20">
                <Text className="hidden">Spacer for centering</Text>
              </Box>
            </Box>
            <Text className="text-gray-600 text-center">Combine multiple PDFs into one file</Text>
          </Box>

          <Box className="p-6 flex-1 bg-background-50">
            {showPreview && mergedPdfUri ? (
              <VStack space="md" className="flex-1">
                <Card size="md" variant="elevated" className="bg-white p-4 rounded-xl">
                  <Box className="flex-row justify-between items-center">
                    <Text size="lg" bold>Preview</Text>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="rounded-lg"
                      onPress={() => setShowPreview(false)}
                    >
                      <ButtonText>Back</ButtonText>
                    </Button>
                  </Box>
                </Card>
                
                <Box className="flex-1 bg-white rounded-xl overflow-hidden">
                  <PDFViewer 
                    uri={mergedPdfUri} 
                    renderPageIndicator={(pageNumber) => (
                      <Box className="absolute top-2 right-2 bg-white/70 px-3 py-1 rounded-full">
                        <Text className="text-gray-600">Page {pageNumber}</Text>
                      </Box>
                    )}
                  />
                </Box>
                
                <Button 
                  size="lg" 
                  variant="solid"
                  action="primary"
                  className="rounded-xl"
                  onPress={exportMergedPdf}
                >
                  <FileDown size={24} />
                  <ButtonText>Export Merged PDF</ButtonText>
                </Button>
              </VStack>
            ) : (
              <VStack space="md" className="flex-1">
                {selectedFiles.length === 0 ? (
                  <Card 
                    size="md" 
                    variant="elevated" 
                    className="bg-white p-6 rounded-2xl items-center justify-center"
                  >
                    <VStack space="md" className="items-center">
                      <Box className="w-16 h-16 rounded-full bg-background-100 items-center justify-center">
                        <FileText size={32} color="#64748b" />
                      </Box>
                      <Text className="text-gray-600 text-center mb-4">
                        Start by adding PDF files to merge
                      </Text>
                      <Button 
                        size="lg" 
                        variant="solid"
                        action="primary"
                        className="rounded-xl"
                        onPress={pickDocument}
                      >
                        <FileText size={24} />
                        <ButtonText className="ml-2">Add PDF to Merge</ButtonText>
                      </Button>
                    </VStack>
                  </Card>
                ) : (
                  <>
                    <Card size="md" variant="elevated" className="bg-white p-4 rounded-xl">
                      <Box className="flex-row justify-between items-center">
                        <Text size="md" className="text-gray-600">
                          Files to merge ({selectedFiles.length})
                        </Text>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="rounded-lg"
                          onPress={pickDocument}
                        >
                          <ButtonText>Add More</ButtonText>
                        </Button>
                      </Box>
                      <Text size="sm" className="text-gray-500 mt-2 italic">
                        Long press and drag to reorder files
                      </Text>
                    </Card>

                    <Box className="flex-1 bg-white rounded-xl overflow-hidden">
                      <DraggableFlatList
                        data={selectedFiles}
                        keyExtractor={(item) => item.id}
                        renderItem={renderPDFFile}
                        onDragEnd={({ data }) => {setSelectedFiles(data);}}
                        horizontal={false}
                        numColumns={1}
                        contentContainerStyle={[styles.fileList, { padding: 16 }]}
                        activationDistance={10}
                        dragItemOverflow={true}
                      />
                    </Box>

                    <Button 
                      size="lg"
                      variant="solid"
                      action="primary"
                      className="rounded-xl"
                      onPress={previewMergedPdf}
                    >
                      <Eye size={24} />
                      <ButtonText>Preview Merged PDF</ButtonText>
                    </Button>
                  </>
                )}
                {isLoading && (
                  <Box className="absolute inset-0 bg-black/10 items-center justify-center">
                    <Spinner size="large" />
                  </Box>
                )}
              </VStack>
            )}
          </Box>
        </Box>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fileList: {
    width: '100%',
  },
  fileItem: {
    width: '100%',
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    overflow: 'hidden',
  },
  fileContent: {
    width: '100%',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  fileDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  pageBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  pageCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fileName: {
    fontSize: 14,
    flex: 1,
  },
});
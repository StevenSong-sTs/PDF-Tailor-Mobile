import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import * as DocumentPicker from 'expo-document-picker';
import { useState, useRef } from "react";
import { FileText, X, Eye, FileDown, Trash2 } from "lucide-react-native";
import { Toast, ToastDescription, useToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { PDFDocument } from 'pdf-lib';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler';
import SwipeableItem, { useSwipeableItemParams } from 'react-native-swipeable-item';
import { PDFViewer } from "@/components/PDFViewer";

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
        
        // Show success toast
        toast.show({
          render: () => (
            <Toast action="success">
              <ToastDescription>PDF merged and exported successfully!</ToastDescription>
            </Toast>
          )
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
      <View style={styles.deleteButton}>
        <TouchableOpacity 
          onPress={() => {
            onDelete(id);
            close();
          }}
        >
          <Trash2 size={24} color="white" />
        </TouchableOpacity>
      </View>
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text size="xl" bold>Merge PDF</Text>
        
        {showPreview && mergedPdfUri ? (
          <View style={styles.previewContainer}>
            <View style={styles.previewHeader}>
              <Text size="lg" bold>Preview</Text>
              <Button 
                size="sm" 
                onPress={() => setShowPreview(false)}
                variant="link"
              >
                <ButtonText>Back</ButtonText>
              </Button>
            </View>
            
            <PDFViewer 
              uri={mergedPdfUri} 
              renderPageIndicator={(pageNumber) => (
                <View style={styles.pageIndicator}>
                  <Text>Page {pageNumber}</Text>
                </View>
              )}
            />
            
            <Button 
              size="lg" 
              onPress={exportMergedPdf}
              style={styles.exportButton}
            >
              <FileDown size={24} />
              <ButtonText>Export Merged PDF</ButtonText>
            </Button>
          </View>
        ) : (
          <>
            <Button 
              size="lg" 
              variant="outline" 
              onPress={pickDocument}
            >
              <FileText size={24} />
              <ButtonText>Add PDF to Merge</ButtonText>
            </Button>
            
            {isLoading && <Spinner size="large" />}
            
            {selectedFiles.length > 0 && (
              <>
                <Text size="md" style={styles.sectionTitle}>
                  Files to merge ({selectedFiles.length})
                </Text>
                <Text size="sm" style={styles.instructions}>
                  Long press and drag to reorder files
                </Text>
                
                <View style={styles.fileListContainer}>
                  <DraggableFlatList
                    data={selectedFiles}
                    keyExtractor={(item) => item.id}
                    renderItem={renderPDFFile}
                    onDragEnd={({ data }) => {setSelectedFiles(data);}}
                    horizontal={false}
                    numColumns={1}
                    contentContainerStyle={styles.fileList}
                    activationDistance={10}
                    dragItemOverflow={true}
                  />
                </View>
                
                <Button 
                  size="lg" 
                  onPress={previewMergedPdf}
                  style={styles.previewButton}
                >
                  <Eye size={24} />
                  <ButtonText>Preview Merged PDF</ButtonText>
                </Button>
              </>
            )}
          </>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  fileListContainer: {
    flex: 1,
    width: '100%',
  },
  fileList: {
    paddingVertical: 10,
    width: '100%',
  },
  fileItem: {
    width: '100%',
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
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
  sectionTitle: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  instructions: {
    fontStyle: 'italic',
    color: '#666',
  },
  previewButton: {
    marginTop: 10,
  },
  previewContainer: {
    flex: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pageIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 5,
    borderRadius: 5,
  },
  exportButton: {
    marginTop: 10,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    position: 'absolute',
    right: 0,
  },
});
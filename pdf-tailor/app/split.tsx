import { View } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import * as DocumentPicker from 'expo-document-picker';
import { useState } from "react";
import { FileText, Check, CheckCircle2, ArrowLeft, ScissorsLineDashed } from "lucide-react-native";
import { PDFViewer } from "@/components/PDFViewer";
import { Spinner } from "@/components/ui/spinner";
import * as FileSystem from 'expo-file-system';
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Toast, ToastDescription, useToast } from "@/components/ui/toast";
import { PDFDocument } from 'pdf-lib';
import * as Sharing from 'expo-sharing';
import { router } from "expo-router";

export default function Split() {
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const toast = useToast();

  const pickDocument = async () => {
    setIsLoading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      
      if (result.assets && result.assets[0]) {
        console.log("Selected file:", result.assets[0].uri);
        setSelectedFile(result);
        setSelectedPages([]);
      }
    } catch (err) {
      console.error('Error picking document:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePageSelection = (pageNumber: number) => {
    setSelectedPages(prev => {
      if (prev.includes(pageNumber)) {
        return prev.filter(p => p !== pageNumber);
      } else {
        return [...prev, pageNumber];
      }
    });
  };

  const selectAllPages = () => {
    if (totalPages > 0) {
      setSelectedPages(Array.from({ length: totalPages }, (_, i) => i + 1));
    }
  };

  const deselectAllPages = () => {
    setSelectedPages([]);
  };

  const areAllPagesSelected = () => {
    return totalPages > 0 && selectedPages.length === totalPages;
  };

  const toggleAllPages = () => {
    if (areAllPagesSelected()) {
      deselectAllPages();
    } else {
      selectAllPages();
    }
  };

  const handleExport = async () => {
    if (selectedPages.length === 0 || !selectedFile?.assets?.[0]) return;
    
    setIsLoading(true);
    try {
      // Get the PDF file as a Uint8Array
      const fileUri = selectedFile.assets[0].uri;
      const originalFileName = selectedFile.assets[0].name;
      const baseFileName = originalFileName.replace(/\.pdf$/i, ''); // Remove .pdf extension if present
      const pdfBytes = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      // Load the PDF document
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      // Create a new PDF document
      const newPdfDoc = await PDFDocument.create();
      
      // Copy selected pages to the new document
      for (const pageNumber of selectedPages) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNumber - 1]);
        newPdfDoc.addPage(copiedPage);
      }
      
      // Serialize the new PDF document
      const newPdfBytes = await newPdfDoc.saveAsBase64();
      
      // Create a temporary file with a name based on the original file
      const tempFileName = `${baseFileName}_split_${Date.now()}.pdf`;
      const tempFilePath = `${FileSystem.cacheDirectory}${tempFileName}`;
      await FileSystem.writeAsStringAsync(tempFilePath, newPdfBytes, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      // Share the file, allowing user to choose where to save it
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        setIsLoading(false);
        await Sharing.shareAsync(tempFilePath, {
          mimeType: 'application/pdf',
          dialogTitle: 'Save your split PDF',
          UTI: 'com.adobe.pdf',
        });
        
        // Show success toast
        toast.show({
          render: () => (
            <Toast action="success">
              <ToastDescription>PDF exported successfully!</ToastDescription>
            </Toast>
          )
        });
        
        setSelectedPages([]);
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
      setIsLoading(false);
    }
  };

  return (
    <Box className="flex-1 bg-background-50">
      {/* Header */}
      <Box className="p-4 bg-background-100 pt-16">
        <Box className="flex-row items-center justify-between mb-4">
          <Button
            size="sm"
            variant="link"
            onPress={() => router.back()}
            className="self-start"
          >
            <ArrowLeft size={24} color="#64748b" />
            <ButtonText className="text-gray-600 ml-1">Back</ButtonText>
          </Button>
          <Heading size="2xl">Split PDF</Heading>
          <Box className="w-20">
            <Text className="hidden">Spacer for centering</Text>
          </Box>
        </Box>
        <Text className="text-gray-600 text-center">Select pages to create a new PDF document</Text>
      </Box>

      <Box className="p-6 flex-1 bg-background-50">
        {!selectedFile ? (
          <Card 
            size="md" 
            variant="elevated" 
            className="bg-white p-6 rounded-2xl items-center justify-center"
          >
            <VStack space="md" className="items-center">
              <Box className="w-16 h-16 rounded-full bg-background-100 items-center justify-center mb-4">
                <ScissorsLineDashed size={32} color="#64748b" />
              </Box>
              <Text className="text-gray-600 text-center mb-4">
                Start by selecting a PDF file to split
              </Text>
              <Button 
                size="lg" 
                variant="solid"
                action="primary"
                className="rounded-xl"
                onPress={pickDocument}
              >
                <FileText size={24} />
                <ButtonText className="ml-2">Select PDF</ButtonText>
              </Button>
            </VStack>
          </Card>
        ) : (
          <VStack space="md" className="flex-1">
            <Card size="md" variant="elevated" className="bg-white p-4 rounded-xl">
              <Text size="md" className="text-gray-600">
                Selected: {selectedFile?.assets?.[0].name}
              </Text>
              <Button 
                size="sm" 
                variant="outline"
                className="self-start mt-2"
                onPress={pickDocument}
              >
                <ButtonText>Change File</ButtonText>
              </Button>
            </Card>

            <Box className="flex-row justify-between mb-2">
              <Button 
                size="sm" 
                variant="outline"
                onPress={toggleAllPages}
                className="rounded-lg"
              >
                <ButtonText>{areAllPagesSelected() ? "Deselect All" : "Select All"}</ButtonText>
              </Button>
              
              {selectedPages.length > 0 && (
                <Text className="text-gray-600">
                  {selectedPages.length} pages selected
                </Text>
              )}
            </Box>

            <Box className="flex-1 bg-white rounded-xl overflow-hidden">
              {isLoading ? (
                <Box className="flex-1 items-center justify-center">
                  <Spinner size="large" />
                </Box>
              ) : selectedFile?.assets?.[0]?.uri ? (
                <PDFViewer 
                  uri={selectedFile.assets[0].uri} 
                  onPageCountChange={setTotalPages}
                  renderPageIndicator={(pageNumber) => (
                    <Box className="absolute top-2 right-2 flex-row items-center bg-white/70 px-3 py-1 rounded-full">
                      <Text className="text-gray-600">Page {pageNumber}</Text>
                      {selectedPages.includes(pageNumber) && (
                        <CheckCircle2 size={20} color="green" style={{ marginLeft: 5 }} />
                      )}
                    </Box>
                  )}
                  onPagePress={togglePageSelection}
                  highlightedPages={selectedPages}
                />
              ) : null}
            </Box>

            {selectedPages.length > 0 && (
              <Button 
                size="lg"
                variant="solid"
                action="primary"
                className="rounded-xl"
                onPress={handleExport}
              >
                <ButtonText>Export {selectedPages.length} Pages</ButtonText>
              </Button>
            )}
          </VStack>
        )}
      </Box>
    </Box>
  );
}

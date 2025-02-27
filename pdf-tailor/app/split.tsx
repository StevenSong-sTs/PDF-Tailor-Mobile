import { View } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import * as DocumentPicker from 'expo-document-picker';
import { useState } from "react";
import { FileText, Check, CheckCircle2 } from "lucide-react-native";
import { PDFViewer } from "@/components/PDFViewer";
import { Spinner } from "@/components/ui/spinner";
import * as FileSystem from 'expo-file-system';
import { Input, InputField } from "@/components/ui/input";
import { Toast, ToastDescription, useToast } from "@/components/ui/toast";
import { PDFDocument } from 'pdf-lib';

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

  const handleExport = () => {
    setShowExportDialog(true);
  };

  const exportPDF = async () => {
    if (selectedPages.length === 0 || !newFileName || !selectedFile?.assets?.[0]) return;
    
    setIsLoading(true);
    try {
      // Get the PDF file as a Uint8Array
      const fileUri = selectedFile.assets[0].uri;
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
      
      // Save the new PDF document
      const documentsDir = FileSystem.documentDirectory;
      const newFilePath = `${documentsDir}${newFileName}${newFileName.endsWith('.pdf') ? '' : '.pdf'}`;
      await FileSystem.writeAsStringAsync(newFilePath, newPdfBytes, {
        encoding: FileSystem.EncodingType.Base64
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
      setShowExportDialog(false);
      setNewFileName("");
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
    <View
      style={{
        flex: 1,
        padding: 20,
        gap: 20,
      }}
    >
      <Text size="xl" bold>Split PDF</Text>
      
      <Button 
        size="lg" 
        variant="outline" 
        onPress={pickDocument}
      >
        <FileText size={24} />
        <ButtonText>{selectedFile ? "Select a new file" : "Select PDF"}</ButtonText>
      </Button>

      {isLoading && <Spinner size="large" />}

      {selectedFile?.assets && (
        <View style={{ flex: 1 }}>
          <Text size="md" style={{ marginBottom: 10 }}>
            Selected: {selectedFile.assets[0].name}
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Button size="sm" onPress={selectAllPages}>
              <ButtonText>Select All</ButtonText>
            </Button>
            <Button size="sm" onPress={deselectAllPages}>
              <ButtonText>Deselect All</ButtonText>
            </Button>
          </View>
          
          <PDFViewer 
            uri={selectedFile.assets[0].uri} 
            onPageCountChange={setTotalPages}
            renderPageIndicator={(pageNumber) => (
              <View style={{ 
                position: 'absolute', 
                top: 10, 
                right: 10, 
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.7)',
                padding: 5,
                borderRadius: 5
              }}>
                <Text>Page {pageNumber}</Text>
                {selectedPages.includes(pageNumber) && (
                  <CheckCircle2 size={20} color="green" style={{ marginLeft: 5 }} />
                )}
              </View>
            )}
            onPagePress={togglePageSelection}
            highlightedPages={selectedPages}
          />
          
          {selectedPages.length > 0 && (
            <Button 
              style={{ marginTop: 10 }} 
              onPress={handleExport}
            >
              <ButtonText>Export Selected Pages ({selectedPages.length})</ButtonText>
            </Button>
          )}
        </View>
      )}

      {showExportDialog && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <View style={{
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 10,
            width: '100%',
            maxWidth: 400,
          }}>
            <Text size="lg" bold style={{ marginBottom: 10 }}>Export PDF</Text>
            <Input
              style={{ marginBottom: 15 }}
            >
              <InputField
                placeholder="Enter file name"
                value={newFileName}
                onChangeText={setNewFileName}
              />
            </Input>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button variant="outline" onPress={() => setShowExportDialog(false)}>
                <ButtonText>Cancel</ButtonText>
              </Button>
              <Button onPress={exportPDF} disabled={!newFileName || isLoading}>
                <ButtonText>Export</ButtonText>
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { View, Dimensions, Text, TouchableOpacity, StyleSheet } from "react-native";
import { WebView } from 'react-native-webview';
import { DocumentPickerAsset } from 'expo-document-picker';

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
  const webViewRef = useRef<WebView>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagesLoaded, setPagesLoaded] = useState<boolean[]>([]);

  // Check if the URI is valid
  if (!uri) {
    return (
      <View style={[{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }, style]}>
        <Text>No PDF document selected</Text>
      </View>
    );
  }

  // Inject JavaScript to get PDF information and handle page interactions
  const injectedJavaScript = `
    // Function to get PDF document information
    async function getPdfInfo() {
      try {
        const loadingTask = pdfjsLib.getDocument('${uri}');
        const pdf = await loadingTask.promise;
        const pageCount = pdf.numPages;
        
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'pdfInfo',
          pageCount: pageCount
        }));

        // Load each page for rendering
        for (let i = 1; i <= pageCount; i++) {
          const page = await pdf.getPage(i);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'pageLoaded',
            pageNumber: i
          }));
        }
      } catch (error) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'error',
          message: error.toString()
        }));
      }
    }

    // Add click event listeners to pages
    document.addEventListener('click', function(e) {
      const pageElement = e.target.closest('.page');
      if (pageElement) {
        const pageNumber = parseInt(pageElement.dataset.pageNumber);
        if (!isNaN(pageNumber)) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'pageClicked',
            pageNumber: pageNumber
          }));
        }
      }
    });

    // Track current visible page
    function checkVisiblePage() {
      const pages = document.querySelectorAll('.page');
      let mostVisiblePage = 1;
      let maxVisibility = 0;
      
      pages.forEach(page => {
        const rect = page.getBoundingClientRect();
        const pageHeight = rect.height;
        const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
        const visibility = visibleHeight / pageHeight;
        
        if (visibility > maxVisibility) {
          maxVisibility = visibility;
          mostVisiblePage = parseInt(page.dataset.pageNumber);
        }
      });
      
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'currentPage',
        pageNumber: mostVisiblePage
      }));
    }

    // Add scroll event listener
    document.addEventListener('scroll', checkVisiblePage);
    
    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
      // Load PDF.js if not already loaded
      if (typeof pdfjsLib === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/build/pdf.min.js';
        script.onload = getPdfInfo;
        document.head.appendChild(script);
      } else {
        getPdfInfo();
      }
      
      // Add styling for highlighted pages
      const style = document.createElement('style');
      style.textContent = \`
        .page-highlight {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 255, 0, 0.1);
          pointer-events: none;
          z-index: 1;
        }
      \`;
      document.head.appendChild(style);
    });

    // Function to highlight pages
    function highlightPages(pageNumbers) {
      // Remove existing highlights
      document.querySelectorAll('.page-highlight').forEach(el => el.remove());
      
      // Add new highlights
      pageNumbers.forEach(pageNumber => {
        const pageElement = document.querySelector(\`.page[data-page-number="\${pageNumber}"]\`);
        if (pageElement) {
          const highlight = document.createElement('div');
          highlight.className = 'page-highlight';
          pageElement.appendChild(highlight);
        }
      });
    }

    true;
  `;

  // Handle messages from WebView
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'pdfInfo':
          setPageCount(data.pageCount);
          onPageCountChange?.(data.pageCount);
          break;
        case 'pageLoaded':
          setPagesLoaded(prev => {
            const newLoaded = [...prev];
            newLoaded[data.pageNumber - 1] = true;
            return newLoaded;
          });
          break;
        case 'currentPage':
          setCurrentPage(data.pageNumber);
          break;
        case 'pageClicked':
          onPagePress?.(data.pageNumber);
          break;
        case 'error':
          console.error('PDF Viewer error:', data.message);
          break;
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  // Update highlighted pages when they change
  useEffect(() => {
    if (webViewRef.current && highlightedPages.length > 0) {
      webViewRef.current.injectJavaScript(`
        highlightPages(${JSON.stringify(highlightedPages)});
        true;
      `);
    }
  }, [highlightedPages]);

  // Create HTML content for the WebView
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        body { margin: 0; padding: 0; background-color: #f0f0f0; }
        .page { position: relative; margin: 10px auto; background-color: white; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
        .page-container { padding: 10px; }
      </style>
    </head>
    <body>
      <div id="viewer" class="page-container"></div>
      <script src="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/build/pdf.min.js"></script>
      <script>
        // PDF.js viewer implementation
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/build/pdf.worker.min.js';
        
        async function renderPdf(url) {
          try {
            const loadingTask = pdfjsLib.getDocument(url);
            const pdf = await loadingTask.promise;
            const pageCount = pdf.numPages;
            const viewer = document.getElementById('viewer');
            
            for (let i = 1; i <= pageCount; i++) {
              const page = await pdf.getPage(i);
              const scale = 1.5;
              const viewport = page.getViewport({ scale });
              
              const pageDiv = document.createElement('div');
              pageDiv.className = 'page';
              pageDiv.dataset.pageNumber = i;
              pageDiv.style.width = viewport.width + 'px';
              pageDiv.style.height = viewport.height + 'px';
              
              const canvas = document.createElement('canvas');
              pageDiv.appendChild(canvas);
              viewer.appendChild(pageDiv);
              
              const context = canvas.getContext('2d');
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              
              await page.render({
                canvasContext: context,
                viewport: viewport
              }).promise;
            }
          } catch (error) {
            console.error('Error rendering PDF:', error);
          }
        }
        
        renderPdf('${uri}');
      </script>
    </body>
    </html>
  `;

  return (
    <View style={[{ flex: 1, width: '100%' }, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={{
          flex: 1,
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height,
        }}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        injectedJavaScript={injectedJavaScript}
        onMessage={handleMessage}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView HTTP error:', nativeEvent);
        }}
      />
      
      {/* Render page indicators */}
      {renderPageIndicator && (
        <View style={styles.pageIndicatorContainer}>
          {renderPageIndicator(currentPage)}
        </View>
      )}
      
      {/* Page navigation controls */}
      <View style={styles.navigationContainer}>
        <Text style={styles.pageInfo}>
          Page {currentPage} of {pageCount}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageIndicatorContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  navigationContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  pageInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 5,
    borderRadius: 5,
  }
});

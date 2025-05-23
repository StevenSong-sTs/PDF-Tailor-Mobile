# PDF Tailor - Mobile App Design Document

## Overview
PDF Tailor is a cross-platform mobile application built with Expo that allows users to manipulate PDF files on their iOS and Android devices. The app provides essential PDF management features including splitting, merging, and format conversion.

## Core Features
1. PDF Splitting
   - Import single PDF file from device storage
   - Preview PDF contents
   - Select pages to split
   - Create multiple PDF files from selections
   - Save split files to device storage

2. PDF Merging
   - Import multiple PDF files from device storage
   - Reorder files before merging
   - Preview selected files
   - Combine into single PDF
   - Save merged file to device storage

3. Scan to PDF
   - Scan the document using the camera
   - Use some image processing to improve the quality by shadow removal and crop and rotate the image to get the best result
   - Save the scanned document as a PDF
   - Preview the scanned document
   - Save the scanned document to device storage

## Technical Architecture

### Frontend Components
1. Navigation
   - Tab-based navigation
   - File picker screens
   - Preview screens
   - Processing screens

2. UI Components
   - File selection interface
   - PDF preview component
   - Page selection interface
   - Progress indicators
   - Success/error notifications

## Interface Design

### Main Screen

### Split Screen
- A button to select the PDF from file system to split
- After the pdf is loaded, It should show the preview of the pdf
- After the pdf is loaded, the `Select File` button should become `Select a new file` button
- The loaded pdf should show the page number at each page
- Each page of the pdf should be able to select and unselected
- The selected page should have a green checkmark icon at the corner and the page should be highlighted
- There should be a button to select all pages and deselect all pages
- There should be a button to export the selected pages as a new PDF
- After the export button is clicked, it should allow user to name the new PDF file
- After the file is exported, it should show the success message
- After the file is exported, the selection should be cleared

### Merge Screen
- A button to add the PDF from file system to merge
- User can add multiple pdfs to merge
- For each added pdf, it should be shown as icon of a stack of files with a badge on the top left corner showing the page number and a cross icon to remove the file at the top right corner
- User can drag each file to reorder the files
- After user finished its selection and adjustment, there should be a button to show the preview of the merged pdf
- The preview should show the merged pdf page by page with page number
- After preview is shown, there should be a button to export the merged pdf
- The export should follow the same logic as the split screen where we use the share function to export the pdf

### Scan to PDF Screen
- Implement the scan to pdf functionality
- The interface should have a border to highlight where the user should scan the document
- If the user scaned the document at an angle, the app should rotate the image to get the best result
- The app should make some image processing to enhance the quality of the image
- After the page is scanned and processed, ask user to confirm if the page is good to use
- If the user confirm the page is good to use, add the page to the list of pages and continue scanning the next page
- If the user confirm the page is not good to use, ask user to scan the page again
- After user scaned all the pages, there should be a button to preview the scanned document
- Last a button to export the scanned document as pdf same as how split and merge works.

Step to implement the scan to pdf functionality:
1. Use expo camera to show the camera view in the page with a border to highlight where the user should scan the document
2. When the physical file's border is detected tocuhing the defined border, the camera should trigger the capture image function
3. show the captured image to user for confirmation 
4. if the user confirm the page is good to use, add the page to the list of pages and continue scanning the next page
6. show the list a small thumnails that user can swap horizontally to see the page they already scaned
7. A button to preview all the pages
8. In the preview page, user can export the pdf file as the split and merge functionality.

## Implementation Phases

### Phase 1: Basic Setup and PDF Viewing (Done✅)
- Set up Expo project
- Implement basic navigation
- Create file picker functionality
- Implement PDF viewer component

### Phase 2: PDF Splitting (Done✅)
- Implement page selection interface
- Develop PDF splitting logic
- Add file saving functionality
- Test split operation

### Phase 3: PDF Merging (Done✅)
- Create multiple file selection
- Implement file reordering
- Develop PDF merging logic
- Test merge operation

### Phase 4: Scan to pdf (Done✅)
- Implement the scan to pdf functionality
- Use some image processing to improve the quality by shadow removal and crop and rotate the image to get the best result
- Save the scanned document as a PDF
- Preview the scanned document
- Save the scanned document to device storage

### Phase 5: Polish and Testing (On going)
- UI/UX improvements (Done✅)
- Add AD Net work (To do)
- Error handling (To do)
- Performance optimization (To do)
- Cross-platform testing (To do)

## Technical Considerations
1. File Size Limitations
   - Implement file size checks
   - Handle large PDF files efficiently

2. Storage Management
   - Request appropriate permissions
   - Implement cleanup mechanisms
   - Handle storage space issues

3. Error Handling
   - Network errors
   - File format issues
   - Storage permission errors
   - Conversion failures

4. Performance
   - Optimize large file processing
   - Implement background processing for heavy operations
   - Cache management

## Future Enhancements
1. Additional Features
   - PDF compression
   - Password protection
   - Cloud storage integration
   - Batch processing

2. UI Improvements
   - Dark mode support
   - Custom themes
   - Gesture controls
   - Accessibility features

# Improvement List:
- Add full page ads when click using tool.
- Create an option in the page to purchase to get ads free experience
- Make Splash screen display longer
- Update PDF-Tailor README

## In app Purchase

UI requirements:

1. Index.tsx:
   - Add another card with the eye-cathing grident color backgournd. It should have a large title: "Unlock Ads Free Experience" with an icon. 
   - This card does not need to have a `Open Tool` button like other cards
   - Clicking any part of this card should link to a new page: `RemoveAdPage.tsx`
2. RemoveAdPage.tsx:
   - This page should be a new componment. Add this component to the /components folder
   - The layour should follow the attached image 
   - The Top shows a title, below shows a short description
   - Below that show a attractive image, use a place holder image for now
   - Below that show the Price 
   - Below that show two buttons in a column: Unlock Now and restore purchase
   - Just add the UI component, we will implement the function later.

Function Requirement:
Now, let's implment the In-app purcahse function in the @remove-ads.tsx with the following requirements:
- Let's use the expo-in-app-purcahse library
- An in-app purchase item has already been created in the app store connect with product ID:com.sts.build.pdftailor.removeads
- When the app starts, we should connect to the IAP service and check if this user has already purcahsed the product. If so, display a `ad free` badge next to big heading PDF Tailor in @index.tsx
- in the @remove-ads.tsx: When user clicked the `Unlock Now` button, we should trigger a purchase to let user purchase the product.
- in the @remove-ads.tsx: When user clicked the `Restore Purchase` button, we should check if user has purchased the product from IAP service and update the state in our app. 
- If user has purchased the product, Do NOT show the Banner AD and the Interstitial Ad
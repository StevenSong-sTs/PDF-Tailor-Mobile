import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as InAppPurchases from 'expo-in-app-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Product ID for removing ads
const REMOVE_ADS_PRODUCT_ID = 'com.sts.build.pdftailor.removeads';

// Type for the context
type InAppPurchaseContextType = {
  isAdFree: boolean;
  isPurchaseLoading: boolean;
  purchaseError: string | null;
  purchaseRemoveAds: () => Promise<void>;
  restorePurchases: () => Promise<void>;
};

// Create context with default values
const InAppPurchaseContext = createContext<InAppPurchaseContextType>({
  isAdFree: false,
  isPurchaseLoading: false,
  purchaseError: null,
  purchaseRemoveAds: async () => {},
  restorePurchases: async () => {},
});

// Storage key for persisting purchase state
const REMOVE_ADS_STORAGE_KEY = '@pdftailor:removeads';

// Provider component
export const InAppPurchaseProvider = ({ children }: { children: ReactNode }) => {
  const [isAdFree, setIsAdFree] = useState(false);
  const [isPurchaseLoading, setIsPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  // Initialize IAP
  useEffect(() => {
    const initializeIAP = async () => {
      try {
        // Connect to the store
        await InAppPurchases.connectAsync();
        
        // Load stored purchase status
        const storedPurchaseStatus = await AsyncStorage.getItem(REMOVE_ADS_STORAGE_KEY);
        if (storedPurchaseStatus === 'true') {
          setIsAdFree(true);
        } else {
          // Verify purchase status
          await verifyPurchases();
        }
      } catch (error) {
        console.error('Failed to initialize IAP:', error);
      }
    };

    initializeIAP();

    // Cleanup when component unmounts
    return () => {
      try {
        InAppPurchases.disconnectAsync();
      } catch (error) {
        console.error('Failed to disconnect IAP:', error);
      }
    };
  }, []);

  // Function to verify existing purchases
  const verifyPurchases = async () => {
    try {
      setIsPurchaseLoading(true);
      setPurchaseError(null);

      // Get available purchases
      const history = await InAppPurchases.getPurchaseHistoryAsync();
      
      const hasRemoveAdsPurchase = history.results?.some(
        purchase => purchase.productId === REMOVE_ADS_PRODUCT_ID
      ) || false;

      if (hasRemoveAdsPurchase) {
        setIsAdFree(true);
        await AsyncStorage.setItem(REMOVE_ADS_STORAGE_KEY, 'true');
      }
    } catch (error) {
      console.error('Failed to verify purchases:', error);
    } finally {
      setIsPurchaseLoading(false);
    }
  };

  // Function to purchase the remove ads product
  const purchaseRemoveAds = async () => {
    try {
      setIsPurchaseLoading(true);
      setPurchaseError(null);

      // Set up purchase listener
      InAppPurchases.setPurchaseListener(({ responseCode, results, errorCode }) => {
        // Handle purchase result
        if (responseCode === InAppPurchases.IAPResponseCode.OK) {
          if (results && results.length) {
            // Purchase was successful
            setIsAdFree(true);
            AsyncStorage.setItem(REMOVE_ADS_STORAGE_KEY, 'true');
          }
        } else if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
          // Purchase was canceled by user
          setPurchaseError('Purchase was canceled');
        } else {
          // Purchase failed with another error
          setPurchaseError(`Purchase failed: ${errorCode}`);
        }
        
        setIsPurchaseLoading(false);
      });

      // Load product details
      const { responseCode, results } = await InAppPurchases.getProductsAsync([REMOVE_ADS_PRODUCT_ID]);
      
      if (responseCode === InAppPurchases.IAPResponseCode.OK && results && results.length) {
        // Request purchase
        await InAppPurchases.purchaseItemAsync(REMOVE_ADS_PRODUCT_ID);
      } else {
        setPurchaseError('Failed to load product details');
        setIsPurchaseLoading(false);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setPurchaseError('An error occurred during purchase');
      setIsPurchaseLoading(false);
    }
  };

  // Function to restore purchases
  const restorePurchases = async () => {
    try {
      setIsPurchaseLoading(true);
      setPurchaseError(null);
      
      await verifyPurchases();
    } catch (error) {
      console.error('Restore purchases error:', error);
      setPurchaseError('Failed to restore purchases');
    } finally {
      setIsPurchaseLoading(false);
    }
  };

  return (
    <InAppPurchaseContext.Provider
      value={{
        isAdFree,
        isPurchaseLoading,
        purchaseError,
        purchaseRemoveAds,
        restorePurchases,
      }}
    >
      {children}
    </InAppPurchaseContext.Provider>
  );
};

// Custom hook to use the context
export const useInAppPurchase = () => useContext(InAppPurchaseContext); 
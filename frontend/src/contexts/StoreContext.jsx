import { createContext, useContext, useState, useEffect } from 'react';
import { settingsAPI, getImageUrl } from '../services/api';

const StoreContext = createContext(null);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export const StoreProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    storeName: 'My Store',
    tagline: '',
    logoUrl: null,
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    alternatePhone: '',
    email: '',
    whatsapp: '',
    gstin: '',
    proprietorName: '',
    proprietorPhone: '',
    website: '',
    facebook: '',
    instagram: '',
    workingHours: '',
    aboutText: '',
    footerText: '',
    primaryColor: '#4F46E5'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.getStoreSettings();
      if (response.data.settings) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      console.error('Error fetching store settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLogoUrl = () => {
    if (!settings.logoUrl) return null;
    return getImageUrl(settings.logoUrl);
  };

  const getFullAddress = () => {
    const parts = [
      settings.address,
      settings.city,
      settings.state,
      settings.pincode
    ].filter(Boolean);
    return parts.join(', ');
  };

  const value = {
    ...settings,
    loading,
    refreshSettings: fetchSettings,
    getLogoUrl,
    getFullAddress
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

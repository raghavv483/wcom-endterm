import React, { createContext, useContext, useState, useEffect } from 'react';

interface ApiKeyContextType {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  isUsingDefaultKey: boolean;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isUsingDefaultKey, setIsUsingDefaultKey] = useState(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('groq_api_key');
    if (storedKey) {
      setApiKeyState(storedKey);
      setIsUsingDefaultKey(false);
    } else {
      // Use default key from environment
      const defaultKey = import.meta.env.VITE_GROQ_API_KEY;
      if (defaultKey) {
        setApiKeyState(defaultKey);
        setIsUsingDefaultKey(true);
      }
    }
  }, []);

  const setApiKey = (key: string) => {
    try {
      localStorage.setItem('groq_api_key', key);
      setApiKeyState(key);
      setIsUsingDefaultKey(false);
      console.log('✅ API Key saved successfully');
    } catch (err) {
      console.error('❌ Error saving API key:', err);
    }
  };

  const clearApiKey = () => {
    localStorage.removeItem('groq_api_key');
    const defaultKey = import.meta.env.VITE_GROQ_API_KEY;
    if (defaultKey) {
      setApiKeyState(defaultKey);
      setIsUsingDefaultKey(true);
    } else {
      setApiKeyState(null);
      setIsUsingDefaultKey(false);
    }
  };

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey, clearApiKey, isUsingDefaultKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = () => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within ApiKeyProvider');
  }
  return context;
};

import { useApiKey } from '@/context/ApiKeyContext';

/**
 * Hook to get the current Groq API key for making requests
 * Returns either the user's custom key or the default key from environment
 */
export const useGroqApiKey = () => {
  const { apiKey } = useApiKey();
  return apiKey;
};

/**
 * Hook to check if using default API key
 */
export const useIsDefaultApiKey = () => {
  const { isUsingDefaultKey } = useApiKey();
  return isUsingDefaultKey;
};

/**
 * Example usage in a component:
 * 
 * const MyComponent = () => {
 *   const apiKey = useGroqApiKey();
 *   const isDefault = useIsDefaultApiKey();
 *   
 *   useEffect(() => {
 *     if (apiKey) {
 *       // Make API call with apiKey
 *     }
 *   }, [apiKey]);
 * };
 */

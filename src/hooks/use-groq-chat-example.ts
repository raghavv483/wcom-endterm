/**
 * Example Usage of API Key in AIChat Component
 * 
 * This file shows how to integrate the Groq API key management
 * into your AI chat functionality.
 * 
 * Copy and adapt these patterns to your actual AIChat.tsx component
 */

import { useGroqApiKey, useIsDefaultApiKey } from '@/hooks/use-groq-api-key';
import { useEffect, useState } from 'react';

// Example: Making a Groq API call
export const useGroqChat = () => {
  const apiKey = useGroqApiKey();
  const isDefault = useIsDefaultApiKey();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (message: string, model: string = 'mixtral-8x7b-32768') => {
    if (!apiKey) {
      setError('No API key available');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: message,
            },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'API Error');
      }

      const data = await response.json();
      return data.choices[0]?.message?.content;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading,
    error,
    apiKey,
    isUsingDefaultKey: isDefault,
  };
};

/**
 * Example: Component using the hook (JSX version)
 * 
 * To use this in a React component file (.tsx), import and use like:
 * 
 * import { useGroqChat } from '@/hooks/use-groq-chat-example';
 * 
 * export const ExampleAIChatUsage = () => {
 *   const { sendMessage, isLoading, error, isUsingDefaultKey } = useGroqChat();
 * 
 *   const handleSendMessage = async () => {
 *     const response = await sendMessage('Hello, how are you?');
 *     if (response) {
 *       console.log('AI Response:', response);
 *     }
 *   };
 * 
 *   return (
 *     <div>
 *       {isUsingDefaultKey && (
 *         <p style={{ fontSize: '0.875rem', color: '#888' }}>
 *           Using default API key (limited rate)
 *         </p>
 *       )}
 *       <button
 *         onClick={handleSendMessage}
 *         disabled={isLoading}
 *       >
 *         {isLoading ? 'Loading...' : 'Send Message'}
 *       </button>
 *       {error && <p style={{ color: 'red' }}>Error: {error}</p>}
 *     </div>
 *   );
 * };
 */

/**
 * GROQ API ENDPOINTS & MODELS
 * 
 * Available Models:
 * - mixtral-8x7b-32768 (Default, fastest)
 * - llama-2-70b-chat
 * - llama-2-13b-chat
 * - gemma-7b-it
 * 
 * API Endpoint: https://api.groq.com/openai/v1/chat/completions
 * 
 * Features:
 * - Free tier available
 * - No rate limiting for free users
 * - Very fast inference
 * - OpenAI compatible API
 */

/**
 * INTEGRATION CHECKLIST
 * 
 * ✅ Import useGroqApiKey from '@/hooks/use-groq-api-key'
 * ✅ Get API key in your component
 * ✅ Check for null/undefined before making API calls
 * ✅ Use Bearer token authentication in headers
 * ✅ Handle errors gracefully
 * ✅ Show indicator when using default key
 * ✅ Set proper timeout for requests
 * ✅ Cache responses if needed
 * ✅ Implement loading states
 * ✅ Log API usage for debugging
 */

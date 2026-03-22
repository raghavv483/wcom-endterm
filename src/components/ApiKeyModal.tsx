import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { useApiKey } from '@/context/ApiKeyContext';

interface ApiKeyModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isManualTrigger?: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ 
  open: externalOpen, 
  onOpenChange: externalOnOpenChange,
  isManualTrigger = false 
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [error, setError] = useState('');
  const { setApiKey, isUsingDefaultKey } = useApiKey();

  // Use external control if provided, otherwise use internal state
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = (value: boolean | ((prev: boolean) => boolean)) => {
    if (externalOnOpenChange) {
      const newValue = typeof value === 'function' ? value(isOpen) : value;
      externalOnOpenChange(newValue);
    } else {
      setInternalOpen(value);
    }
  };

  // Show modal on first load (only if not manually triggered)
  useEffect(() => {
    if (isManualTrigger) return; // Skip auto-show if manually triggered
    
    const hasSeenModal = localStorage.getItem('api_key_modal_seen');
    const storedKey = localStorage.getItem('groq_api_key');
    
    if (!hasSeenModal && !storedKey) {
      setIsOpen(true);
      localStorage.setItem('api_key_modal_seen', 'true');
    }
  }, [isManualTrigger, setIsOpen]);

  const validateGroqApiKey = (key: string): boolean => {
    // Groq API keys start with 'gsk_'
    return key.trim().startsWith('gsk_') && key.trim().length > 10;
  };

  const handleSubmit = () => {
    const trimmedKey = apiKeyInput.trim();
    
    if (!trimmedKey) {
      setError('Please enter your API key');
      return;
    }

    if (!validateGroqApiKey(trimmedKey)) {
      setError('Invalid Groq API key format. Must start with "gsk_"');
      return;
    }

    try {
      console.log('📝 Submitting API key...');
      setApiKey(trimmedKey);
      console.log('✅ API key submitted and saved');
      setApiKeyInput('');
      setError('');
      setIsOpen(false);
      console.log('✅ Modal closed');
    } catch (err) {
      console.error('❌ Error during submission:', err);
      setError('Failed to save API key. Please try again.');
    }
  };

  const handleOpenGroqConsole = () => {
    window.open('https://console.groq.com/keys', '_blank');
  };

  const handleSkip = () => {
    setIsOpen(false);
    // Modal will not show again unless they clear localStorage
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Your Groq API Key</DialogTitle>
          <DialogDescription>
            Provide your own Groq API key to use advanced AI features. Your key will be stored locally in your browser.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium">API Key</label>
            <Input
              type="password"
              placeholder="gsk_..."
              value={apiKeyInput}
              onChange={(e) => {
                setApiKeyInput(e.target.value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Your API key will be stored securely in your browser and never sent to our servers.
            </p>
          </div>

          {isUsingDefaultKey && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Currently using default API key. Enter your own key for better performance and limits.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleOpenGroqConsole}
              className="flex items-center gap-2"
            >
              Get API Key
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
            >
              Skip for Now
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
            >
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

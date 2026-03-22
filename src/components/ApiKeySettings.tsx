import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useApiKey } from '@/context/ApiKeyContext';

export const ApiKeySettings: React.FC = () => {
  const { apiKey, setApiKey, clearApiKey, isUsingDefaultKey } = useApiKey();
  const [newKey, setNewKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateGroqApiKey = (key: string): boolean => {
    return key.trim().startsWith('gsk_') && key.trim().length > 10;
  };

  const handleUpdateKey = () => {
    if (!newKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    if (!validateGroqApiKey(newKey)) {
      setError('Invalid Groq API key format. Must start with "gsk_"');
      return;
    }

    setApiKey(newKey);
    setNewKey('');
    setError('');
    setSuccess('API key updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleClearKey = () => {
    if (confirm('Are you sure? You will revert to using the default API key.')) {
      clearApiKey();
      setError('');
      setSuccess('API key cleared. Using default key.');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleOpenGroqConsole = () => {
    window.open('https://console.groq.com/keys', '_blank');
  };

  const maskedKey = apiKey
    ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`
    : 'None';

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>API Key Settings</CardTitle>
        <CardDescription>Manage your Groq API key for AI features</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Current Status</label>
          <Alert variant={isUsingDefaultKey ? "default" : "default"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {isUsingDefaultKey
                ? 'Using default API key'
                : 'Using custom API key'}
            </AlertDescription>
          </Alert>
        </div>

        {/* Current Key Display */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Current Key</label>
          <div className="flex items-center gap-2 p-2 bg-muted rounded border">
            <code className="text-sm flex-1">{showKey ? apiKey || 'None' : maskedKey}</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowKey(!showKey)}
              className="h-8 w-8 p-0"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Update Key Form */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Update API Key</label>
          <Input
            type="password"
            placeholder="gsk_..."
            value={newKey}
            onChange={(e) => {
              setNewKey(e.target.value);
              setError('');
            }}
            className="font-mono"
          />
        </div>

        {/* Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            onClick={handleOpenGroqConsole}
            className="flex-1 text-xs"
          >
            Get New Key
          </Button>
          <Button
            onClick={handleUpdateKey}
            className="flex-1"
          >
            Update
          </Button>
        </div>

        {!isUsingDefaultKey && (
          <Button
            variant="destructive"
            onClick={handleClearKey}
            className="w-full"
          >
            Use Default Key
          </Button>
        )}

        {/* Help Text */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p>• Keys are stored locally in your browser</p>
          <p>• Never shared with our servers</p>
          <p>• Get free keys at console.groq.com</p>
        </div>
      </CardContent>
    </Card>
  );
};

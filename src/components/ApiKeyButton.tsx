import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Key } from 'lucide-react';
import { ApiKeyModal } from './ApiKeyModal';

export const ApiKeyButton: React.FC<{ className?: string }> = ({ className }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowModal(true)}
        className={className}
        title="Enter or update your Groq API key"
      >
        <Key className="w-4 h-4 mr-2" />
        API Key
      </Button>
      
      <ApiKeyModal 
        open={showModal} 
        onOpenChange={setShowModal}
        isManualTrigger={true}
      />
    </>
  );
};

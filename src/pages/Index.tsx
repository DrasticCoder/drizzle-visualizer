import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Code, Database, FileUp, FolderUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Landing from '@/components/Landing';
import { useToast } from '@/hooks/use-toast';
import { encodeState } from '@/lib/stateUtils';

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const { toast } = useToast();

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);

    // Process files
    const fileReaders: Promise<{ name: string; content: string }>[] = [];

    Array.from(files).forEach((file) => {
      fileReaders.push(
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              name: file.name,
              content: e.target?.result as string,
            });
          };
          reader.readAsText(file);
        }),
      );
    });

    Promise.all(fileReaders)
      .then((fileContents) => {
        // Create app state with uploaded files
        const appState = {
          files: fileContents,
          activeFile: fileContents[0]?.name || null,
          canvasState: { zoom: 1, position: { x: 0, y: 0 } },
        };

        // Encode state and navigate to editor
        const encodedState = encodeState(appState);
        navigate(`/editor?state=${encodedState}`);
      })
      .catch((error) => {
        console.error('Error reading files:', error);
        toast({
          title: 'Error reading files',
          description: 'There was an error processing your files.',
          variant: 'destructive',
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handlePasteCode = (code: string) => {
    if (!code.trim()) {
      toast({
        title: 'Empty code',
        description: 'Please paste some schema code first.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    // Create app state with pasted code
    const appState = {
      files: [{ name: 'schema.ts', content: code }],
      activeFile: 'schema.ts',
      canvasState: { zoom: 1, position: { x: 0, y: 0 } },
    };

    // Encode state and navigate to editor
    const encodedState = encodeState(appState);
    navigate(`/editor?state=${encodedState}`);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Landing
        selectedMethod={selectedMethod}
        onMethodSelect={handleMethodSelect}
        onFileUpload={handleFileUpload}
        onPasteCode={handlePasteCode}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Index;

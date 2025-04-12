import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { decodeState } from '@/lib/stateUtils';
import EditorLayout from '@/components/editor/EditorLayout';
import Sidebar from '@/components/editor/Sidebar';
import CodeEditor from '@/components/editor/CodeEditor';
import CanvasView from '@/components/editor/CanvasView';
import CanvasControls from '@/components/editor/CanvasControls';
import { toast } from 'sonner';
import { parseSchemaFromCode } from '@/lib/schemaParser';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';

export interface AppFile {
  name: string;
  content: string;
}

export interface AppState {
  files: AppFile[];
  activeFile: string | null;
  canvasState: {
    zoom: number;
    position: { x: number; y: number };
  };
}

export interface SchemaTable {
  name: string;
  columns: {
    name: string;
    type: string;
    isPrimary: boolean;
    isForeign: boolean;
    references?: string;
  }[];
}

const Editor = () => {
  const [searchParams] = useSearchParams();
  const [appState, setAppState] = useState<AppState | null>(null);
  const [tables, setTables] = useState<SchemaTable[]>([]);
  const [showVisualizer, setShowVisualizer] = useState(true);

  useEffect(() => {
    const stateParam = searchParams.get('state');

    if (stateParam) {
      try {
        const decodedState = decodeState<AppState>(stateParam);
        setAppState(decodedState);
      } catch (error) {
        console.error('Failed to decode state:', error);
        toast('Error loading data', {
          description:
            'Failed to load the shared schema. The URL might be corrupted.',
        });
      }
    }
  }, [searchParams]);

  // Visualize schema when actively triggered by user
  const handleVisualize = () => {
    if (!appState) return;

    const parsedTables = parseSchemaFromCode(appState.files);
    console.log('Visualizing tables:', parsedTables);
    setTables(parsedTables);

    // Show visualizer if hidden
    setShowVisualizer(true);

    // Give feedback to user
    if (parsedTables.length === 0) {
      toast('No tables found', {
        description:
          'No valid Drizzle schema tables were detected in your code.',
      });
    } else {
      toast(`Visualization updated`, {
        description: `Found ${parsedTables.length} tables in your schema.`,
      });
    }
  };

  const handleFileSelect = (fileName: string) => {
    if (!appState) return;

    setAppState({
      ...appState,
      activeFile: fileName,
    });
  };

  const handleFileContentChange = (fileName: string, newContent: string) => {
    if (!appState) return;

    const updatedFiles = appState.files.map((file) =>
      file.name === fileName ? { ...file, content: newContent } : file,
    );

    const updatedState = {
      ...appState,
      files: updatedFiles,
    };

    setAppState(updatedState);
  };

  const handleCreateNewFile = (fileName: string) => {
    if (!appState) return;

    // Check if file already exists
    if (appState.files.some((file) => file.name === fileName)) {
      toast('File already exists', {
        description: `The file ${fileName} already exists.`,
      });
      return;
    }

    const updatedFiles = [
      ...appState.files,
      { name: fileName, content: '// Add your schema here' },
    ];

    setAppState({
      ...appState,
      files: updatedFiles,
      activeFile: fileName,
    });
  };

  const handleCanvasStateChange = (newCanvasState: AppState['canvasState']) => {
    if (!appState) return;

    setAppState({
      ...appState,
      canvasState: newCanvasState,
    });
  };

  const toggleVisualizer = () => {
    if (!showVisualizer) {
      handleVisualize(); // Visualize data when showing
    } else {
      setShowVisualizer(false);
    }
  };

  if (!appState) {
    return (
      <div className="h-screen flex items-center justify-center bg-muted">
        <div className="animate-pulse text-muted-foreground">
          Loading editor...
        </div>
      </div>
    );
  }

  return (
    <EditorLayout
      sidebar={
        <Sidebar
          files={appState.files}
          activeFile={appState.activeFile}
          onFileSelect={handleFileSelect}
          onCreateNewFile={handleCreateNewFile}
        />
      }
      editor={
        <div className="flex flex-col h-full">
          <div className="border-b p-2 flex justify-between items-center">
            <Button
              onClick={handleVisualize}
              size="sm"
              className="flex items-center gap-1"
            >
              <Database className="h-4 w-4" />
              Visualize Schema
            </Button>

            <Button variant="outline" size="sm" onClick={toggleVisualizer}>
              {showVisualizer ? 'Hide Visualizer' : 'Show Visualizer'}
            </Button>
          </div>

          <CodeEditor
            files={appState.files}
            activeFile={appState.activeFile}
            onContentChange={handleFileContentChange}
          />
        </div>
      }
      canvas={
        showVisualizer ? (
          <CanvasView
            tables={tables}
            canvasState={appState.canvasState}
            onCanvasStateChange={handleCanvasStateChange}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-muted">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Visualizer is hidden</p>
              <Button onClick={toggleVisualizer}>Show Visualizer</Button>
            </div>
          </div>
        )
      }
      controls={
        showVisualizer ? (
          <CanvasControls
            canvasState={appState.canvasState}
            onCanvasStateChange={handleCanvasStateChange}
            appState={appState}
          />
        ) : null
      }
    />
  );
};

export default Editor;

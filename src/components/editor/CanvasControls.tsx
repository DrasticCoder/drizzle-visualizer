import {
  Download,
  Maximize,
  Minimize,
  RotateCcw,
  Share2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppState } from '@/pages/Editor';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { encodeState } from '@/lib/stateUtils';
import { toast } from 'sonner';

interface CanvasControlsProps {
  canvasState: AppState['canvasState'];
  onCanvasStateChange: (newState: AppState['canvasState']) => void;
  appState: AppState;
}

const CanvasControls: React.FC<CanvasControlsProps> = ({
  canvasState,
  onCanvasStateChange,
  appState,
}) => {
  const handleZoomIn = () => {
    onCanvasStateChange({
      ...canvasState,
      zoom: Math.min(canvasState.zoom + 0.1, 2.0),
    });
  };

  const handleZoomOut = () => {
    onCanvasStateChange({
      ...canvasState,
      zoom: Math.max(canvasState.zoom - 0.1, 0.5),
    });
  };

  const handleReset = () => {
    onCanvasStateChange({
      zoom: 1,
      position: { x: 0, y: 0 },
    });
  };

  const handleShare = () => {
    const encodedState = encodeState(appState);
    const shareUrl = `${window.location.origin}/editor?state=${encodedState}`;

    // Copy to clipboard
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        toast('Share link copied to clipboard', {
          description:
            'You can now share this URL with others to share your schema visualization.',
        });
      })
      .catch(() => {
        toast('Failed to copy link', {
          description: 'Please try again or manually copy the URL.',
        });
      });
  };

  const handleDownloadPng = () => {
    toast('This functionality is not implemented yet', {
      description:
        'The PNG download feature will be available in a future update.',
    });
  };

  return (
    <div className="flex flex-col bg-card shadow-lg rounded-md border p-2 space-y-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom In</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom Out</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset View</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share Diagram</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleDownloadPng}>
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download as PNG</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default CanvasControls;

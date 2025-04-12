import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { File, FolderOpen, Plus } from 'lucide-react';
import { AppFile } from '@/pages/Editor';

interface SidebarProps {
  files: AppFile[];
  activeFile: string | null;
  onFileSelect: (fileName: string) => void;
  onCreateNewFile: (fileName: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  files,
  activeFile,
  onFileSelect,
  onCreateNewFile,
}) => {
  const [newFileName, setNewFileName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      // Add .ts extension if not present
      const fileName = newFileName.endsWith('.ts')
        ? newFileName
        : `${newFileName}.ts`;

      onCreateNewFile(fileName);
      setNewFileName('');
      setDialogOpen(false);
    }
  };

  return (
    <>
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4" />
          <span className="font-medium">Files</span>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New File</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="filename.ts"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleCreateFile} disabled={!newFileName.trim()}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-2">
          {files.map((file) => (
            <div
              key={file.name}
              className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer ${
                activeFile === file.name
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-muted'
              }`}
              onClick={() => onFileSelect(file.name)}
            >
              <File className="w-4 h-4" />
              <span className="text-sm truncate">{file.name}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;

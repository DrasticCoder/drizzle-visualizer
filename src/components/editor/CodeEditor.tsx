import { useEffect, useState } from 'react';
import { AppFile } from '@/pages/Editor';

interface CodeEditorProps {
  files: AppFile[];
  activeFile: string | null;
  onContentChange: (fileName: string, content: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  files,
  activeFile,
  onContentChange,
}) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (activeFile) {
      const file = files.find((f) => f.name === activeFile);
      if (file) {
        setContent(file.content);
      }
    }
  }, [activeFile, files]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    if (activeFile) {
      onContentChange(activeFile, newContent);
    }
  };

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center p-4 text-muted-foreground">
        <p>Select a file from the sidebar or create a new one</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b border-gray-800 bg-[#1e1e1e] text-sm">
        {activeFile}
      </div>
      <div className="flex-1 overflow-auto">
        <textarea
          className="w-full h-full p-4 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm resize-none outline-none code-editor"
          value={content}
          onChange={handleContentChange}
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default CodeEditor;

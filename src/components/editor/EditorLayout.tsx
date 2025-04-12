import React from 'react';

interface EditorLayoutProps {
  sidebar: React.ReactNode;
  editor: React.ReactNode;
  canvas: React.ReactNode;
  controls: React.ReactNode;
}

const EditorLayout: React.FC<EditorLayoutProps> = ({
  sidebar,
  editor,
  canvas,
  controls,
}) => {
  return (
    <div className="h-screen w-full flex flex-col">
      <div className="w-full h-14 border-b bg-background flex items-center px-4">
        <a href="/" className="flex items-center gap-2">
          <span className="font-semibold text-primary">
            Drizzle Schema Vision
          </span>
        </a>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r bg-background flex flex-col">
          {sidebar}
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Code Editor */}
          <div className="md:w-1/2 h-full md:h-full bg-editor-bg text-editor-text overflow-hidden flex flex-col border-r">
            {editor}
          </div>

          {/* Visualization Canvas */}
          <div className="md:w-1/2 h-full md:h-full relative">
            <div className="h-full w-full overflow-hidden">{canvas}</div>
            <div className="absolute bottom-4 left-4 z-10">{controls}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorLayout;

import React, { useState, useRef } from 'react';
import {
  ArrowRight,
  Code,
  Database,
  FileUp,
  FolderUp,
  Github,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface LandingProps {
  selectedMethod: string | null;
  onMethodSelect: (method: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPasteCode: (code: string) => void;
  isLoading: boolean;
}

const Landing: React.FC<LandingProps> = ({
  selectedMethod,
  onMethodSelect,
  onFileUpload,
  onPasteCode,
  isLoading,
}) => {
  const [pastedCode, setPastedCode] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFolderInputClick = () => {
    if (folderInputRef.current) {
      folderInputRef.current.click();
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="text-center mb-16 animate-in">
        <div className="inline-block p-2 bg-accent/10 rounded-xl mb-4">
          <Database className="w-8 h-8 text-accent" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Drizzle Schema Vision
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Visualize your Drizzle ORM schema definitions with an interactive,
          shareable diagram
        </p>

        <div className="mt-4 flex items-center justify-center gap-4">
          <a
            href="https://github.com/drizzle-team/drizzle-orm"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>Drizzle ORM</span>
          </a>
        </div>
      </div>

      <div
        className="max-w-3xl mx-auto bg-card rounded-xl shadow-lg border animate-in"
        style={{ animationDelay: '0.1s' }}
      >
        <div className="p-6 md:p-8">
          <h2 className="text-2xl font-semibold mb-6">Get Started</h2>

          <Tabs defaultValue="upload-file" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger
                value="upload-file"
                onClick={() => onMethodSelect('upload-file')}
              >
                <FileUp className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Upload File</span>
                <span className="sm:hidden">File</span>
              </TabsTrigger>
              <TabsTrigger
                value="upload-folder"
                onClick={() => onMethodSelect('upload-folder')}
              >
                <FolderUp className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Upload Folder</span>
                <span className="sm:hidden">Folder</span>
              </TabsTrigger>
              <TabsTrigger
                value="paste-code"
                onClick={() => onMethodSelect('paste-code')}
              >
                <Code className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Paste Code</span>
                <span className="sm:hidden">Paste</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload-file" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Upload Schema File</CardTitle>
                  <CardDescription>
                    Upload a single TypeScript file containing your Drizzle
                    schema definitions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={handleFileInputClick}
                  >
                    <FileUp className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground mb-2">
                      Click to browse or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports .ts files
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={onFileUpload}
                      accept=".ts,.js,.tsx,.jsx"
                      className="hidden"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleFileInputClick}
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Select File'}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="upload-folder" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Upload Schema Folder</CardTitle>
                  <CardDescription>
                    Upload multiple TypeScript files from your schema folder
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={handleFolderInputClick}
                  >
                    <FolderUp className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground mb-2">
                      Click to browse for multiple files
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Select multiple .ts files
                    </p>
                    <input
                      type="file"
                      ref={folderInputRef}
                      onChange={onFileUpload}
                      accept=".ts,.js,.tsx,.jsx"
                      multiple
                      className="hidden"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleFolderInputClick}
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Select Files'}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="paste-code" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Paste Schema Code</CardTitle>
                  <CardDescription>
                    Paste your Drizzle schema code directly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Paste your Drizzle schema code here..."
                    className="min-h-[200px] font-mono text-sm"
                    value={pastedCode}
                    onChange={(e) => setPastedCode(e.target.value)}
                  />
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => onPasteCode(pastedCode)}
                    className="w-full"
                    disabled={isLoading || !pastedCode.trim()}
                  >
                    {isLoading ? 'Processing...' : 'Visualize Schema'}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div
        className="mt-16 text-center text-muted-foreground text-sm animate-in"
        style={{ animationDelay: '0.2s' }}
      >
        <p>
          Drizzle Schema Vision helps you visualize your database structure
          defined with Drizzle ORM
        </p>
      </div>
    </div>
  );
};

export default Landing;

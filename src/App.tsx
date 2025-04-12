import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import Editor from './pages/Editor';
import NotFound from './pages/NotFound';
import { useSearchParams } from 'react-router-dom';
import { encodeState } from './lib/stateUtils';

const queryClient = new QueryClient();

// Example schema to show when no schema is provided
const defaultAppState = {
  files: [
    {
      name: 'schema.ts',
      content: `import { pgTable, text, integer, serial, boolean, primaryKey } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  isAdmin: boolean('is_admin').default(false),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  authorId: integer('author_id').references(() => users.id),
});

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  postId: integer('post_id').references(() => posts.id),
  userId: integer('user_id').references(() => users.id),
});`,
    },
  ],
  activeFile: 'schema.ts',
  canvasState: {
    zoom: 1,
    position: { x: 0, y: 0 },
  },
};

const EditorWithDefaultState = () => {
  const [searchParams] = useSearchParams();
  const hasState = searchParams.has('state');

  if (!hasState) {
    // Use default state if no state param is provided
    const encodedState = encodeState(defaultAppState);
    return <Navigate to={`/editor?state=${encodedState}`} replace />;
  }

  return <Editor />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/editor" element={<EditorWithDefaultState />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

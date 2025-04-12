# Drizzle Schema Vision

A powerful web-based tool for visualizing Drizzle ORM schema definitions. This application allows you to upload or paste your schema code and interactively explore the database structure.

## Features

- **Multiple Input Methods**: Upload files, upload a folder of files, or paste code directly
- **Split Interface**: Code editor on the left, visualization canvas on the right
- **Interactive Canvas**: Drag tables, zoom in/out, and reset view
- **Shareable Diagrams**: Generate a shareable URL that encodes the application state
- **Client-side Only**: No backend or database required

## Getting Started

1. Visit the landing page and choose how to input your schema:

   - Upload a single schema file
   - Upload multiple schema files
   - Paste schema code directly

2. Once your schema is loaded, you can:
   - View and edit the code in the left panel
   - Explore the visualization in the right panel
   - Use the controls to zoom, reset, and share your diagram

## Technology

- React
- TypeScript
- Tailwind CSS
- shadcn UI

## Schema Format

The visualizer is designed to work with Drizzle ORM schema definitions. Here's a simple example:

```typescript
import { pgTable, text, integer, serial } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id', { primaryKey: true }),
  name: text('name'),
  email: text('email'),
});

export const posts = pgTable('posts', {
  id: serial('id', { primaryKey: true }),
  title: text('title'),
  content: text('content'),
  authorId: integer('author_id', {
    references: () => users.id,
  }),
});
```

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

MIT

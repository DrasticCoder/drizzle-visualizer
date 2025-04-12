import { AppFile } from '@/pages/Editor';
import { SchemaTable } from '@/pages/Editor';

// Enhanced parser to extract schema information from Drizzle code
export function parseSchemaFromCode(files: AppFile[]): SchemaTable[] {
  const tables: SchemaTable[] = [];

  // Improved regex patterns to match different parts of Drizzle schema
  const tableRegex =
    /export\s+const\s+(\w+)\s*=\s*(\w+)(?:Table|(?:\.pgTable))\s*\(\s*["'](\w+)["']/g;
  const columnRegex =
    /(\w+)\s*:\s*(?:t\.)?(\w+)\s*\([^)]*\)(?:\.(\w+)\([^)]*\))*(?:\.notNull\(\))?(?:\.\w+\([^)]*\))*/g;
  const primaryKeyRegex = /primaryKey|primary/i;
  const referencesRegex =
    /references\s*\(\s*\(\)\s*=>\s*(?:[\w.]+\.)?(\w+)(?:\.(\w+))?\s*\)/;

  // Track relations for post-processing
  const relations: {
    sourceTable: string;
    sourceColumn: string;
    targetTable: string;
    targetColumn: string;
  }[] = [];

  // First pass: extract all tables and their columns
  files.forEach((file) => {
    const content = file.content;
    let tableMatch;

    // Reset the regex lastIndex to start from the beginning of the string
    tableRegex.lastIndex = 0;

    // Find all table definitions
    while ((tableMatch = tableRegex.exec(content)) !== null) {
      const variableName = tableMatch[1];
      const tableType = tableMatch[2]; // pgTable, sqliteTable, etc.
      const tableName = tableMatch[3] || variableName; // Use explicit table name from string or fall back to variable name

      console.log(
        `Found table: ${tableName}, variable: ${variableName}, type: ${tableType}`,
      );

      // Extract table definition content
      const tableStartIndex = tableMatch.index;
      let braceCount = 0;
      let foundOpeningBrace = false;
      let tableEndIndex = content.length;

      for (let i = tableStartIndex; i < content.length; i++) {
        if (content[i] === '{' && !foundOpeningBrace) {
          foundOpeningBrace = true;
          braceCount++;
        } else if (foundOpeningBrace) {
          if (content[i] === '{') braceCount++;
          else if (content[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
              tableEndIndex = i + 1;
              break;
            }
          }
        }
      }

      // Extract the table definition
      const tableDefinition = content.substring(tableStartIndex, tableEndIndex);
      console.log(`Table definition length: ${tableDefinition.length} chars`);

      // Parse columns
      const columns: SchemaTable['columns'] = [];

      // Look for columns in the table definition
      const columnMatches = [...tableDefinition.matchAll(columnRegex)];

      columnMatches.forEach((match) => {
        const columnName = match[1]; // name
        const columnType = match[2]; // varchar, integer, etc.
        const columnModifiers = match[0]; // full match for additional checks

        console.log(`Found column: ${columnName}, type: ${columnType}`);

        // Check if this is a primary key
        const isPrimary = primaryKeyRegex.test(columnModifiers);

        // Check if this is a foreign key
        const referenceMatch = referencesRegex.exec(columnModifiers);
        const isForeign = !!referenceMatch;

        if (isForeign && referenceMatch) {
          // Store the relation for post-processing
          relations.push({
            sourceTable: tableName,
            sourceColumn: columnName,
            targetTable: referenceMatch[1],
            targetColumn: referenceMatch[2] || 'id', // Default to 'id' if not specified
          });
        }

        // Add the column to our collection
        columns.push({
          name: columnName,
          type: columnType,
          isPrimary,
          isForeign,
          references: isForeign ? referenceMatch![1] : undefined,
        });
      });

      // Only add the table if we found columns for it
      if (columns.length > 0) {
        tables.push({
          name: tableName,
          columns,
        });
      }
    }
  });

  // Also look for explicit relation tables (many-to-many)
  files.forEach((file) => {
    const content = file.content;

    // Simple regex to find relation declarations
    const relationRegex =
      /relations\s*\(\s*(\w+)\s*,.*?fields\s*:\s*\[\s*(\w+)\.(\w+)\s*\].*?references\s*:\s*\[\s*(\w+)\.(\w+)\s*\]/gs;

    let relationMatch;
    while ((relationMatch = relationRegex.exec(content)) !== null) {
      const sourceTable = relationMatch[1];
      const targetVariable = relationMatch[2];
      const sourceColumn = relationMatch[3];
      const targetTable = relationMatch[4];
      const targetColumn = relationMatch[5];

      // Add to relations if not already captured
      const exists = relations.some(
        (r) =>
          r.sourceTable === sourceTable &&
          r.sourceColumn === sourceColumn &&
          r.targetTable === targetTable &&
          r.targetColumn === targetColumn,
      );

      if (!exists) {
        relations.push({
          sourceTable,
          sourceColumn,
          targetTable,
          targetColumn,
        });
      }
    }
  });

  // Update tables with relation information
  relations.forEach((relation) => {
    // Find source table
    const sourceTable = tables.find((t) => t.name === relation.sourceTable);
    if (sourceTable) {
      // Find source column
      const sourceColumn = sourceTable.columns.find(
        (c) => c.name === relation.sourceColumn,
      );
      if (sourceColumn) {
        sourceColumn.isForeign = true;
        sourceColumn.references = relation.targetTable;
      } else {
        // Column not found, add it
        sourceTable.columns.push({
          name: relation.sourceColumn,
          type: 'relation',
          isPrimary: false,
          isForeign: true,
          references: relation.targetTable,
        });
      }
    }
  });

  // Add debug logging to see what was parsed
  console.log('Parsed tables:', tables);
  console.log('Detected relations:', relations);

  return tables;
}

import { useEffect, useRef, useState } from 'react';
import { AppState, SchemaTable } from '@/pages/Editor';

interface CanvasViewProps {
  tables: SchemaTable[];
  canvasState: AppState['canvasState'];
  onCanvasStateChange: (newState: AppState['canvasState']) => void;
}

const CanvasView: React.FC<CanvasViewProps> = ({
  tables,
  canvasState,
  onCanvasStateChange,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tablePositions, setTablePositions] = useState<
    Record<string, { x: number; y: number }>
  >({});

  // Initialize table positions in a grid layout when tables change
  useEffect(() => {
    if (tables.length === 0) return;

    const newPositions: Record<string, { x: number; y: number }> = {};
    const tableWidth = 240;
    const tableHeight = 180;
    const padding = 50;
    const columns = Math.ceil(Math.sqrt(tables.length));

    tables.forEach((table, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);

      newPositions[table.name] = {
        x: col * (tableWidth + padding) + 50,
        y: row * (tableHeight + padding) + 50,
      };
    });

    setTablePositions(newPositions);
  }, [tables]);

  const handleMouseDown = (event: React.MouseEvent) => {
    if (event.target === canvasRef.current) {
      setIsDragging(true);
      setDragStart({
        x: event.clientX - canvasState.position.x,
        y: event.clientY - canvasState.position.y,
      });
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging) {
      const newX = event.clientX - dragStart.x;
      const newY = event.clientY - dragStart.y;

      onCanvasStateChange({
        ...canvasState,
        position: { x: newX, y: newY },
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTableDragStart = (event: React.MouseEvent, tableName: string) => {
    event.stopPropagation();
    const { clientX, clientY } = event;
    const { x, y } = tablePositions[tableName];

    const startX = clientX - x;
    const startY = clientY - y;

    const handleTableDragMove = (moveEvent: MouseEvent) => {
      const newX = moveEvent.clientX - startX;
      const newY = moveEvent.clientY - startY;

      setTablePositions((prev) => ({
        ...prev,
        [tableName]: { x: newX, y: newY },
      }));
    };

    const handleTableDragEnd = () => {
      document.removeEventListener('mousemove', handleTableDragMove);
      document.removeEventListener('mouseup', handleTableDragEnd);
    };

    document.addEventListener('mousemove', handleTableDragMove);
    document.addEventListener('mouseup', handleTableDragEnd);
  };

  const drawRelations = () => {
    // Find relationships between tables
    const relations: Array<{
      from: { table: string; column: string };
      to: { table: string; column: string };
    }> = [];

    tables.forEach((table) => {
      table.columns.forEach((column) => {
        if (column.isForeign && column.references) {
          relations.push({
            from: { table: table.name, column: column.name },
            to: { table: column.references, column: 'id' }, // Assuming reference is to primary key
          });
        }
      });
    });

    return relations.map((relation, index) => {
      const fromTable = tables.find((t) => t.name === relation.from.table);
      const toTable = tables.find((t) => t.name === relation.to.table);

      if (!fromTable || !toTable) return null;

      const fromPos = tablePositions[relation.from.table];
      const toPos = tablePositions[relation.to.table];

      if (!fromPos || !toPos) return null;

      // Find the position of the specific column in the from table
      const fromColumnIndex = fromTable.columns.findIndex(
        (c) => c.name === relation.from.column,
      );
      const toColumnIndex = toTable.columns.findIndex(
        (c) => c.name === relation.to.column,
      );

      // Calculate connection points
      const fromX = fromPos.x + 240; // right side of table
      const fromY =
        fromPos.y + 50 + (fromColumnIndex > -1 ? fromColumnIndex * 30 : 0);
      const toX = toPos.x; // left side of table
      const toY = toPos.y + 50 + (toColumnIndex > -1 ? toColumnIndex * 30 : 0);

      // Draw a path for the relation
      const path = `M ${fromX} ${fromY} C ${fromX + 50} ${fromY}, ${
        toX - 50
      } ${toY}, ${toX} ${toY}`;

      return (
        <svg
          key={index}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{
            transform: `translate(${canvasState.position.x}px, ${canvasState.position.y}px)`,
          }}
        >
          <path
            d={path}
            stroke="#7c3aed"
            strokeWidth="1.5"
            fill="none"
            markerEnd="url(#arrowhead)"
          />
          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#7c3aed" />
            </marker>
          </defs>
        </svg>
      );
    });
  };

  const zoomTransform = `scale(${canvasState.zoom})`;

  return (
    <div className="h-full w-full overflow-hidden bg-canvas-bg canvas-grid relative">
      <div
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-grab"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          touchAction: 'none',
        }}
      >
        {drawRelations()}

        <div
          className="transform-gpu transition-transform duration-100"
          style={{
            transform: `translate(${canvasState.position.x}px, ${canvasState.position.y}px) ${zoomTransform}`,
          }}
        >
          {tables.map((table) => (
            <div
              key={table.name}
              className="absolute bg-white rounded-md shadow-md border w-60 overflow-hidden"
              style={{
                left: tablePositions[table.name]?.x || 0,
                top: tablePositions[table.name]?.y || 0,
              }}
              onMouseDown={(e) => handleTableDragStart(e, table.name)}
            >
              <div className="bg-primary text-primary-foreground px-4 py-2 font-medium cursor-move">
                {table.name}
              </div>
              <div className="p-0">
                {table.columns.map((column) => (
                  <div
                    key={column.name}
                    className={`px-3 py-1.5 text-sm border-b last:border-0 flex justify-between ${
                      column.isPrimary ? 'font-semibold bg-muted/50' : ''
                    } ${column.isForeign ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      {column.isPrimary && (
                        <span className="text-xs bg-amber-100 text-amber-600 px-1 rounded">
                          PK
                        </span>
                      )}
                      {column.isForeign && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded">
                          FK
                        </span>
                      )}
                      <span>{column.name}</span>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {column.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CanvasView;

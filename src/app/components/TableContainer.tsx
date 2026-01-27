import React from 'react';
import { TableCell } from './TableCell';
import { TableRowNumberCell } from './TableRowNumberCell';
import { TableColumnHeader } from './TableColumnHeader';

interface TableContainerProps {
  rows?: number;
  columns?: number;
  data?: string[][];
  columnHeaders?: string[];
  onDataChange?: (rowIndex: number, colIndex: number, value: string) => void;
  onColumnHeaderChange?: (colIndex: number, value: string) => void;
}

export function TableContainer({ 
  rows = 12, 
  columns = 20, 
  data = [],
  columnHeaders = [],
  onDataChange,
  onColumnHeaderChange
}: TableContainerProps) {
  // Initialize data if not provided
  const tableData = data.length > 0 
    ? data 
    : Array(rows).fill(null).map(() => Array(columns).fill(''));

  // Initialize column headers if not provided
  const headers = columnHeaders.length > 0
    ? columnHeaders
    : Array(columns).fill('');

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    if (onDataChange) {
      onDataChange(rowIndex, colIndex, value);
    }
  };

  const handleHeaderChange = (colIndex: number, value: string) => {
    if (onColumnHeaderChange) {
      onColumnHeaderChange(colIndex, value);
    }
  };

  return (
    <div className="w-full overflow-x-auto bg-white rounded-lg shadow-sm border border-[var(--light-gray)]" dir="rtl">
      <div className="inline-block min-w-full">
        <div className="grid" style={{ gridTemplateColumns: `60px repeat(${columns}, minmax(100px, 1fr))` }}>
          {/* Header row with row number placeholder */}
          <div className="bg-gray-100 border border-[var(--light-gray)]"></div>
          {Array.from({ length: columns }, (_, i) => (
            <TableColumnHeader
              key={`header-${i}`}
              value={headers[i] || ''}
              onChange={(value) => handleHeaderChange(i, value)}
              columnIndex={i}
            />
          ))}

          {/* Table rows */}
          {Array.from({ length: rows }, (_, rowIndex) => {
            const cells = [];
            
            // Row number
            cells.push(
              <TableRowNumberCell key={`row-num-${rowIndex}`} number={rowIndex + 1} />
            );
            
            // Row cells
            for (let colIndex = 0; colIndex < columns; colIndex++) {
              cells.push(
                <TableCell
                  key={`cell-${rowIndex}-${colIndex}`}
                  value={tableData[rowIndex]?.[colIndex] || ''}
                  onChange={(value) => handleCellChange(rowIndex, colIndex, value)}
                  rowIndex={rowIndex}
                  colIndex={colIndex}
                />
              );
            }
            
            return cells;
          })}
        </div>
      </div>
    </div>
  );
}
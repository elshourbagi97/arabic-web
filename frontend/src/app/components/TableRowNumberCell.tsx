import React from 'react';

interface TableRowNumberCellProps {
  number: number;
}

export function TableRowNumberCell({ number }: TableRowNumberCellProps) {
  return (
    <div
      className="flex items-center justify-center bg-gray-100 border border-[var(--light-gray)] 
        text-[var(--text-medium)] h-full"
      style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}
    >
      {number}
    </div>
  );
}

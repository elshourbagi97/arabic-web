import React from 'react';

interface TableCellProps {
  value?: string;
  onChange?: (value: string) => void;
  rowIndex?: number;
  colIndex?: number;
}

export function TableCell({ value = '', onChange, rowIndex, colIndex }: TableCellProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-full h-full px-2 py-2 border border-[var(--light-gray)] bg-white 
        focus:outline-none focus:border-[var(--primary-blue)] focus:bg-[var(--light-blue)] 
        transition-colors duration-150"
      style={{ fontSize: 'var(--font-size-sm)' }}
      dir="rtl"
    />
  );
}

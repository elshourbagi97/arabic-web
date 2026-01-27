import React, { useState, useRef, useEffect } from 'react';

interface TableColumnHeaderProps {
  value: string;
  onChange: (value: string) => void;
  columnIndex: number;
}

export function TableColumnHeader({ value, onChange, columnIndex }: TableColumnHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if (localValue !== value) {
        onChange(localValue);
      }
    } else if (e.key === 'Escape') {
      setLocalValue(value);
      setIsEditing(false);
    }
  };

  return (
    <div
      className="bg-gray-100 border border-[var(--light-gray)] px-2 py-2 text-center relative"
      style={{ minHeight: '40px' }}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full bg-white border border-[var(--primary-blue)] rounded px-1 text-center outline-none"
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 500,
            color: 'var(--text-dark)',
          }}
          dir="rtl"
        />
      ) : (
        <div
          className="cursor-pointer hover:bg-gray-200 transition-colors px-1 rounded"
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 500,
            color: value ? 'var(--text-dark)' : 'var(--text-medium)',
            minHeight: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="انقر مرتين للتعديل"
        >
          {value || `عمود ${columnIndex + 1}`}
        </div>
      )}
    </div>
  );
}

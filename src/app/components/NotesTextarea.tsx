import React from 'react';

interface NotesTextareaProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export function NotesTextarea({ 
  value = '', 
  onChange, 
  label = 'ملاحظات',
  placeholder = 'أدخل ملاحظاتك هنا...'
}: NotesTextareaProps) {
  return (
    <div className="w-full">
      <label 
        className="block mb-2 text-[var(--text-dark)]"
        style={{ fontSize: 'var(--font-size-md)', fontWeight: 500 }}
      >
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={6}
        className="w-full px-4 py-3 border border-[var(--light-gray)] rounded-lg bg-white 
          focus:outline-none focus:border-[var(--primary-blue)] focus:ring-2 focus:ring-[var(--light-blue)] 
          transition-all duration-150 resize-none"
        style={{ fontSize: 'var(--font-size-md)' }}
        dir="rtl"
      />
    </div>
  );
}

import React from 'react';

interface AnimatedAddButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function AnimatedAddButton({ children, onClick, disabled = false }: AnimatedAddButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 
        text-white rounded-lg font-semibold shadow-lg 
        hover:shadow-xl hover:scale-105 active:scale-95
        transition-all duration-300 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        overflow-hidden"
      style={{ fontSize: 'var(--font-size-md)' }}
    >
      {/* Animated background shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent 
        opacity-0 group-hover:opacity-20 group-hover:animate-shine"></div>
      
      {/* Pulsing ring effect */}
      <div className="absolute inset-0 rounded-lg bg-emerald-400 
        opacity-0 group-hover:opacity-30 group-hover:animate-pulse"></div>
      
      {/* Button content */}
      <span className="relative flex items-center gap-2 justify-center">
        <span className="text-2xl animate-bounce-slow">➕</span>
        <span>{children}</span>
      </span>
    </button>
  );
}

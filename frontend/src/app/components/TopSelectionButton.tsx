import React from "react";

interface TopSelectionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  onDoubleClick?: React.MouseEventHandler<HTMLButtonElement>;
  isActive?: boolean;
  className?: string;
}

export function TopSelectionButton({
  children,
  onClick,
  onDoubleClick,
  isActive = false,
  className = "",
}: TopSelectionButtonProps) {
  return (
    <button
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`px-8 py-4 rounded-lg border-2 transition-all duration-200 ${className}
        ${
          isActive
            ? "bg-[var(--light-blue)] border-[var(--primary-blue)] text-[var(--primary-blue)] shadow-md"
            : "bg-white border-[var(--light-gray)] text-[var(--text-dark)] hover:border-[var(--primary-blue)] hover:bg-[var(--light-blue)] hover:shadow-sm"
        }`}
      style={{ fontSize: "var(--font-size-lg)" }}
    >
      {children}
    </button>
  );
}

import React from "react";

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 bg-[var(--primary-blue)] text-white rounded-lg hover:bg-[var(--primary-blue-hover)] 
        transition-colors duration-200 shadow-sm hover:shadow-md ${className}`}
      style={{ fontSize: "var(--font-size-md)" }}
    >
      {children}
    </button>
  );
}

import React from "react";

interface ButtonProps {
  variant?: "ghost";
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ variant, onClick, children, className }) => {
  return (
    <button
      className={`btn px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${variant === "ghost" ? "bg-transparent hover:bg-gray-100" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

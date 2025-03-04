import React, { ChangeEvent } from "react";

interface InputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  type?: string;
}

export const Input: React.FC<InputProps> = ({ value, onChange, placeholder, className }) => {
  return (
    <input
      className={`input px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
};

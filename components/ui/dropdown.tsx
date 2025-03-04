import React, { ChangeEvent } from "react";

interface DropdownProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({ value, onChange, options, className }) => {
  return (
    <select value={value} onChange={onChange} className={className}>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};
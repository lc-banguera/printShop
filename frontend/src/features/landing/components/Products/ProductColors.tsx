import * as React from 'react';

interface ProductColorsProps {
  colors: string[];
}

export const ProductColors: React.FC<ProductColorsProps> = ({ colors }) => {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {colors.map((colorHex, idx) => (
        <span
          key={idx}
          className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-2xs shrink-0 cursor-pointer hover:scale-110 transition-transform"
          style={{ backgroundColor: colorHex }}
          title={colorHex}
        />
      ))}
    </div>
  );
};

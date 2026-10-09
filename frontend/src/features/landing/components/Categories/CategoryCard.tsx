import * as React from "react";
import { CategoryItem } from "../../data/categories.data";

interface CategoryCardProps {
  category: CategoryItem;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <a
      href={category.href}
      className="group flex flex-col items-center gap-2 text-center"
    >
      {/* 1. Imagen del producto sobre superficie tonal suave integrada */}
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[5px] bg-[var(--surface-muted)] p-3 transition-colors duration-200 group-hover:bg-[var(--surface-strong)]">
        <img
          src={category.image}
          alt={category.name}
          className="h-[80%] w-[80%] object-contain transition-transform duration-200 group-hover:scale-105"
        />
      </div>

      {/* 2. Nombre */}
      <span className="text-xs font-semibold text-[var(--text-primary)] transition-colors group-hover:text-primary sm:text-sm">
        {category.name}
      </span>
    </a>
  );
};

export default CategoryCard;

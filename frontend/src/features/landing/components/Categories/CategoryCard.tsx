import * as React from "react";
import { CategoryItem } from "../../data/categories.data";

interface CategoryCardProps {
  category: CategoryItem;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <a
      href={category.href}
      className="group flex flex-col items-center gap-3 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
    >
      {/* 1. Imagen del producto sobre superficie tonal suave integrada */}
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[18px] border border-borderMuted bg-white p-5 shadow-subtle transition-[transform,box-shadow,border-color] duration-200 group-hover:-translate-y-1 group-hover:border-borderStrong group-hover:shadow-card sm:p-7">
        <img
          src={category.image}
          alt={category.name}
          className="h-[82%] w-[82%] object-contain transition-transform duration-300 group-hover:scale-[1.04]"
        />
      </div>

      {/* 2. Nombre */}
      <span className="text-sm font-semibold text-[var(--text-primary)] transition-colors group-hover:text-primary sm:text-base">
        {category.name}
      </span>
    </a>
  );
};

export default CategoryCard;

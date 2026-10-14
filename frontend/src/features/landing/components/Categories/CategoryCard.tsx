import * as React from "react";
import { CategoryItem } from "../../data/categories.data";

interface CategoryCardProps {
  category: CategoryItem;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <a
      href={category.href}
      className="group flex flex-col items-center gap-3.5 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 active:scale-[0.97] transition-all duration-150"
    >
      {/* 1. Pedestal Studio Apple de gran proporción */}
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[26px] border border-black/[0.08] bg-[#F1F3F9] p-6 shadow-xs transition-all duration-200 ease-out group-hover:-translate-y-1.5 group-hover:border-black/15 group-hover:bg-[#EBEFF8] group-hover:shadow-md sm:p-7">
        <img
          src={category.image}
          alt={category.name}
          className="h-[88%] w-[88%] object-contain transition-transform duration-300 ease-out group-hover:scale-108 drop-shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
          loading="lazy"
        />
      </div>

      {/* 2. Nombre con Apple Typography de alta legibilidad */}
      <span className="text-[15px] font-bold tracking-[-0.015em] text-[#0F172A] transition-colors duration-150 group-hover:text-primary sm:text-base">
        {category.name}
      </span>
    </a>
  );
};

export default CategoryCard;

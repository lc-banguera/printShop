import * as React from 'react';
import { CategoryItem } from '../../data/categories.data';
import { CategoryCard } from './CategoryCard';

interface CategoryGridProps {
  categories: CategoryItem[];
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories }) => {
  return (
    <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6 lg:gap-6">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
};

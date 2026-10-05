import * as React from 'react';
import { Model3DItem } from '../../data/models3d.data';
import { Models3DCard } from './Models3DCard';

interface Models3DGridProps {
  models: Model3DItem[];
}

export const Models3DGrid: React.FC<Models3DGridProps> = ({ models }) => {
  if (models.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-foregroundMuted">
        No se encontraron modelos.
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5 lg:gap-4">
      {models.map((model) => (
        <Models3DCard key={model.id} model={model} />
      ))}
    </div>
  );
};

export default Models3DGrid;

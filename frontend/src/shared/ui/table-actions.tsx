import * as React from 'react';
import { Copy, Eye, MoreHorizontal, Pencil, Power, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown';
import { cn } from '@/shared/utils/cn';

export type TableAction = {
  label: string;
  icon?: React.ElementType;
  destructive?: boolean;
  onSelect?: () => void;
};

interface TableActionsProps {
  actions?: TableAction[];
  className?: string;
}

const defaultActions: TableAction[] = [
  { label: 'Ver detalles', icon: Eye },
  { label: 'Editar', icon: Pencil },
  { label: 'Cambiar estado', icon: Power },
  { label: 'Duplicar', icon: Copy },
  { label: 'Eliminar', icon: Trash2, destructive: true },
];

export function TableActions({ actions = defaultActions, className }: TableActionsProps) {
  const normalActions = actions.filter((action) => !action.destructive);
  const destructiveActions = actions.filter((action) => action.destructive);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Abrir acciones"
          className={cn(
            'inline-flex h-9 w-9 items-center justify-center rounded-control text-foregroundMuted transition-colors duration-normal hover:bg-surfaceMuted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50',
            className
          )}
        >
          <MoreHorizontal className="h-[18px] w-[18px]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom" collisionPadding={8} className="min-w-[130px]">
        {normalActions.map((action) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem
              key={action.label}
              onSelect={action.onSelect}
              className="flex cursor-pointer items-center gap-2 rounded-control px-3 py-2 text-sm font-medium text-foregroundMuted data-[highlighted]:bg-surfaceMuted data-[highlighted]:text-foreground"
            >
              {Icon && <Icon className="h-4 w-4 text-foregroundSubtle" />}
              <span>{action.label}</span>
            </DropdownMenuItem>
          );
        })}
        {destructiveActions.length > 0 && normalActions.length > 0 && (
          <DropdownMenuSeparator />
        )}
        {destructiveActions.map((action) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem
              key={action.label}
              onSelect={action.onSelect}
              className="flex cursor-pointer items-center gap-2 rounded-control px-3 py-2 text-sm font-medium text-dangerStrong data-[highlighted]:bg-dangerMuted data-[highlighted]:text-dangerStrong"
            >
              {Icon && <Icon className="h-4 w-4 text-dangerStrong" />}
              <span>{action.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

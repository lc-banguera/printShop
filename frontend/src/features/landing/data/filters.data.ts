export interface FilterOption {
  id: string;
  label: string;
  isDropdown?: boolean;
}

export const filtersData: FilterOption[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'tipo-impresion', label: 'Tipo de impresión', isDropdown: true },
  { id: 'material', label: 'Material', isDropdown: true },
  { id: 'color', label: 'Color', isDropdown: true },
  { id: 'genero', label: 'Género', isDropdown: true },
  { id: 'precio', label: 'Precio', isDropdown: true },
];

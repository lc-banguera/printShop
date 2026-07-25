import { DesignerLayout } from '@/features/designer/layouts';
import { UIProvider } from '@/providers/ui-provider';

export default function App() {
  return (
    <UIProvider>
      <DesignerLayout />
    </UIProvider>
  );
}

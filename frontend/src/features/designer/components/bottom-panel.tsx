import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { ScrollArea } from '@/shared/ui/scroll-area';

const layers = [
  { id: 1, name: 'Título Principal', type: 'text', visible: true },
  { id: 2, name: 'Imagen Portada', type: 'image', visible: true },
  { id: 3, name: 'Fondo Gradiente', type: 'shape', visible: true },
  { id: 4, name: 'Separador', type: 'line', visible: false },
];

const history = [
  'Agregó imagen',
  'Cambió color',
  'Redimensionó elemento',
  'Movió capa 3',
  'Creó grupo',
];

export function BottomPanel() {
  return (
    <aside className="border-t border-border bg-surface shadow-xs">
      <Tabs defaultValue="layers" className="w-full">
        <div className="border-b border-border px-6 py-3">
          <TabsList className="grid w-full max-w-xs grid-cols-3">
            <TabsTrigger value="layers">Capas</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
            <TabsTrigger value="assets">Recursos</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="layers" className="m-0">
          <ScrollArea className="h-48">
            <div className="space-y-2 p-4">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  className="flex items-center gap-2 rounded border border-border bg-background px-3 py-2 hover:bg-surface-alt"
                >
                  <div className="flex flex-1 items-center gap-2">
                    <span className="text-sm">{layer.visible ? '👁️' : '🙈'}</span>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{layer.name}</p>
                      <p className="text-xs text-text-muted">{layer.type}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{layer.type}</Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="history" className="m-0">
          <ScrollArea className="h-48">
            <div className="space-y-1 p-4">
              {history.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 py-2 text-sm text-text-secondary">
                  <span className="text-xs text-text-muted">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="assets" className="m-0">
          <ScrollArea className="h-48">
            <div className="space-y-2 p-4">
              <Card>
                <CardContent className="p-3">
                  <p className="text-xs text-text-muted">No hay recursos cargados</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <p className="text-xs text-text-muted">Arrastra imágenes aquí para agregar</p>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </aside>
  );
}

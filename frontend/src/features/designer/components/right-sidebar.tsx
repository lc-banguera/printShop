import { ScrollArea } from '@/shared/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Separator } from '@/shared/ui/separator';

export function RightSidebar() {
  return (
    <aside className="w-80 border-l border-border bg-surface shadow-xs">
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-4 p-6">
          {/* Properties Tabs */}
          <Tabs defaultValue="properties" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="properties">Propiedades</TabsTrigger>
              <TabsTrigger value="fill">Relleno</TabsTrigger>
              <TabsTrigger value="effects">Efectos</TabsTrigger>
            </TabsList>

            <TabsContent value="properties" className="mt-4 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Posición y Tamaño</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-medium text-text-secondary">X</label>
                      <div className="mt-1 rounded border border-border bg-background px-2 py-1 text-sm text-text-muted">
                        0
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-text-secondary">Y</label>
                      <div className="mt-1 rounded border border-border bg-background px-2 py-1 text-sm text-text-muted">
                        0
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-medium text-text-secondary">Ancho</label>
                      <div className="mt-1 rounded border border-border bg-background px-2 py-1 text-sm text-text-muted">
                        210mm
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-text-secondary">Alto</label>
                      <div className="mt-1 rounded border border-border bg-background px-2 py-1 text-sm text-text-muted">
                        297mm
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Rotación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded border border-border bg-background px-2 py-1 text-sm text-text-muted">
                    0°
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Opacidad</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded border border-border bg-background px-2 py-1 text-sm text-text-muted">
                    100%
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fill" className="mt-4 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Color de Relleno</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-10 rounded bg-gradient-to-br from-accent-teal to-accent-blue" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="effects" className="mt-4 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Sombra</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-text-muted">No aplicada</div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </aside>
  );
}

import { Button } from '@/shared/ui/button';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/shared/ui/tooltip';
import { useActiveTool } from '../hooks/use-active-tool';
import { TOOLS_ORDER } from '../services/tools-config';

const templates = [
  { id: 1, name: 'Flyer A4', icon: '📄' },
  { id: 2, name: 'Tarjeta', icon: '💳' },
  { id: 3, name: 'Póster', icon: '📋' },
  { id: 4, name: 'Banner Web', icon: '🖼️' },
  { id: 5, name: 'Social Media', icon: '📱' },
  { id: 6, name: 'Folleto', icon: '📑' },
];

export function LeftSidebar() {
  const { setActiveTool, isToolActive } = useActiveTool();

  return (
    <TooltipProvider>
      <aside className="w-20 border-r border-border bg-surface shadow-xs">
        <div className="flex h-full flex-col gap-4 px-3 py-6">
          {/* Tool Navigation */}
          <nav className="flex flex-col gap-2">
            {TOOLS_ORDER.map((tool) => {
              const isActive = isToolActive(tool.id);

              return (
                <Tooltip key={tool.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      size="sm"
                      className="w-full justify-center font-semibold"
                      onClick={() => setActiveTool(tool.id)}
                      title={tool.description}
                    >
                      {tool.icon}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{tool.name}</TooltipContent>
                </Tooltip>
              );
            })}
          </nav>

          <div className="my-2 h-px bg-border" />

          {/* Templates */}
          <div className="flex-1 overflow-hidden">
            <p className="px-1 text-xs font-semibold text-text-secondary">TEMPLATES</p>
            <ScrollArea className="mt-3 h-full">
              <div className="flex flex-col gap-2 px-1">
                {templates.map((template) => (
                  <Tooltip key={template.id}>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full justify-center text-lg">
                        {template.icon}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">{template.name}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}

import { DesignerHeader } from '../components/header';
import { LeftSidebar } from '../components/left-sidebar';
import { RightSidebar } from '../components/right-sidebar';
import { CanvasArea } from '../components/canvas';
import { BottomPanel } from '../components/bottom-panel';
import { EasyModeCanvasBridge } from '../components/easy-mode-canvas-bridge';

export function DesignerLayout() {
  return (
    <div className="flex h-screen flex-col bg-[#fafafc]">
      {/* Header */}
      <DesignerHeader />
      <EasyModeCanvasBridge />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Canvas Area with React-Konva */}
        <CanvasArea />

        {/* Right Sidebar */}
        <RightSidebar />
      </div>

      {/* Bottom Panel */}
      <BottomPanel />
    </div>
  );
}

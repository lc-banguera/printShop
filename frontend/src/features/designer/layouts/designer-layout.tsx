import { DesignerHeader } from '../components/header';
import { LeftSidebar } from '../components/left-sidebar';
import { RightSidebar } from '../components/right-sidebar';
import { Canvas } from '../components/canvas';
import { BottomPanel } from '../components/bottom-panel';
import { StatusBar } from '../components/status-bar';

export function DesignerLayout() {
  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <DesignerHeader />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Canvas Area with React-Konva */}
        <Canvas />

        {/* Right Sidebar */}
        <RightSidebar />
      </div>

      {/* Bottom Panel */}
      <BottomPanel />

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}

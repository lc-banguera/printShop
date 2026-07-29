/// <reference types="vite/client" />

declare module 'lucide-react';
declare module '@react-three/fiber';
declare module '@react-three/drei';
declare module '*.glb' {
  const src: string;
  export default src;
}

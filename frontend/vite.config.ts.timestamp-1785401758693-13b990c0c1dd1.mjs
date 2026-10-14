// vite.config.ts
import { defineConfig } from "file:///C:/Users/Carlos%20Banguera/Desktop/printShop/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Carlos%20Banguera/Desktop/printShop/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: "0.0.0.0"
  },
  resolve: {
    alias: {
      "@": "/src"
    }
  },
  // Vite optimisation: pre‑bundle three.js and the React‑Three Fiber/Drei packages
  // to avoid "Could not resolve 'three'" errors when the 3‑D viewer is used.
  optimizeDeps: {
    include: [
      "three",
      "@react-three/fiber",
      "@react-three/drei"
    ]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxDYXJsb3MgQmFuZ3VlcmFcXFxcRGVza3RvcFxcXFxwcmludFNob3BcXFxcZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXENhcmxvcyBCYW5ndWVyYVxcXFxEZXNrdG9wXFxcXHByaW50U2hvcFxcXFxmcm9udGVuZFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvQ2FybG9zJTIwQmFuZ3VlcmEvRGVza3RvcC9wcmludFNob3AvZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW3JlYWN0KCldLFxyXG4gIHNlcnZlcjoge1xyXG4gICAgcG9ydDogNTE3MyxcclxuICAgIGhvc3Q6ICcwLjAuMC4wJ1xyXG4gIH0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ0AnOiAnL3NyYydcclxuICAgIH1cclxuICB9LFxyXG4gIC8vIFZpdGUgb3B0aW1pc2F0aW9uOiBwcmVcdTIwMTFidW5kbGUgdGhyZWUuanMgYW5kIHRoZSBSZWFjdFx1MjAxMVRocmVlIEZpYmVyL0RyZWkgcGFja2FnZXNcclxuICAvLyB0byBhdm9pZCBcIkNvdWxkIG5vdCByZXNvbHZlICd0aHJlZSdcIiBlcnJvcnMgd2hlbiB0aGUgM1x1MjAxMUQgdmlld2VyIGlzIHVzZWQuXHJcbiAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICBpbmNsdWRlOiBbXHJcbiAgICAgICd0aHJlZScsXHJcbiAgICAgICdAcmVhY3QtdGhyZWUvZmliZXInLFxyXG4gICAgICAnQHJlYWN0LXRocmVlL2RyZWknXHJcbiAgICBdXHJcbiAgfVxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5VixTQUFTLG9CQUFvQjtBQUN0WCxPQUFPLFdBQVc7QUFFbEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLO0FBQUEsSUFDUDtBQUFBLEVBQ0Y7QUFBQTtBQUFBO0FBQUEsRUFHQSxjQUFjO0FBQUEsSUFDWixTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=

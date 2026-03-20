import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Sử dụng HTTPS thay vì HTTP để tránh lỗi mixed content
    proxy: {
      "/api": {
        target: "https://localhost:7171",
        changeOrigin: true,
        secure: false, // Bỏ qua lỗi SSL self-signed
      },
    },
  },
});

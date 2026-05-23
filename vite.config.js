import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: "all",
  },
  build: {
    rollupOptions: {
      input: {
        main:    "index.html",
        tutor:   "tutor.html",
        student: "student.html",
      },
    },
  },
});

import { defineConfig } from "vite";
import { resolve } from "path";
import { copyFileSync, mkdirSync, readdirSync, statSync } from "fs";

function copyStaticAssets() {
  const assets = ["sw.js", "manifest.json", "nginx.conf", "style.css"];
  const imagesDir = resolve(__dirname, "images");
  const distImages = resolve(__dirname, "dist", "images");

  return {
    name: "copy-static-assets",
    closeBundle() {
      for (const file of assets) {
        const src = resolve(__dirname, file);
        const dest = resolve(__dirname, "dist", file);
        try {
          copyFileSync(src, dest);
        } catch {
          console.warn(`Warning: Could not copy ${file}`);
        }
      }

      mkdirSync(distImages, { recursive: true });
      try {
        for (const entry of readdirSync(imagesDir)) {
          const src = resolve(imagesDir, entry);
          if (statSync(src).isFile()) {
            copyFileSync(src, resolve(distImages, entry));
          }
        }
      } catch {
        console.warn("Warning: Could not copy images");
      }
    },
  };
}

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: resolve(__dirname, "index.html"),
    },
  },
  esbuild: {
    target: "es2020",
  },
  plugins: [copyStaticAssets()],
});

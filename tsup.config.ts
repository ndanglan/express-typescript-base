import { defineConfig } from "tsup";

export default defineConfig({
 entry: ["src/index.ts"], // Adjust this to your entry file(s)
 format: ["cjs", "esm"], // Output formats
 target: "esnext", // Target environment
 outDir: "dist", // Output directory
 sourcemap: true, // Generate sourcemaps
 clean: true, // Clean the output directory before each build
});

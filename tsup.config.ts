import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: false, // Exclude source maps from published package
  minify: true, // Minify for smaller bundle size
  external: ['react'],
  treeshake: true,
  noExternal: ['mqtt', 'stream-browserify', 'buffer', 'events', 'process'],
  platform: 'browser',
  esbuildOptions(options) {
    options.inject = ['./node-polyfills.js'];
  },
});

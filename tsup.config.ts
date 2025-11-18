import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: false, 
  minify: true,
  external: ['react'],
  treeshake: true,
  noExternal: ['mqtt', 'stream-browserify', 'buffer', 'events', 'process'],
  platform: 'browser',
  esbuildOptions(options) {
    options.inject = ['./node-polyfills.js'];
  },
});

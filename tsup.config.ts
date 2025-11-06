import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['react'], // Only react is external, bundle everything else including mqtt
  treeshake: true,
  noExternal: ['mqtt', 'stream-browserify', 'buffer', 'events', 'process'], // Bundle all dependencies
  platform: 'browser', // Target browser environment
  esbuildOptions(options) {
    options.inject = ['./node-polyfills.js']; // Inject polyfills
  },
});

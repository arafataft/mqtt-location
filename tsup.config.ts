import { defineConfig } from 'tsup';

export default defineConfig([
  // Full bundle (default) - includes MQTT client for zero-config usage
  {
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
  },
  // Lite bundle - external MQTT for lightweight builds
  {
    entry: { 'index.lite': 'src/index.ts' },
    outDir: 'dist',
    format: ['cjs', 'esm'],
    dts: true,
    clean: false, // Don't clean, we're adding to existing dist
    sourcemap: false,
    minify: true,
    external: ['react', 'mqtt'],
    treeshake: true,
    platform: 'browser',
    esbuildOptions(options) {
      // No polyfills injected - consumer's bundler handles it
      options.platform = 'neutral';
    },
  },
]);

// Polyfills for Node.js built-in modules
export { Buffer } from 'buffer';
export { default as process } from 'process/browser.js';
export { default as Stream } from 'stream-browserify';
export { EventEmitter } from 'events';

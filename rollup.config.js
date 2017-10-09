import typescript from 'rollup-plugin-typescript';
import webassembly from 'rollup-plugin-webassembly';

export default {
  input: './src/ts/d3wasm.ts',
  plugins: [
    typescript(),
    webassembly()
  ],
  output: {
    file: 'build/bundle.js',
    format: 'umd',
    name: 'd3wasm'
  }
}
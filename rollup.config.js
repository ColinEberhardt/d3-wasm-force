import typescript from 'rollup-plugin-typescript';

export default {
  input: './src/ts/d3wasm.ts',
  plugins: [
    typescript({

    })
  ],
  output: {
    file: 'build/bundle.js',
    format: 'umd',
    name: 'd3wasm'
  }
}
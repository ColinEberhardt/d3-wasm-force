# d3-wasm-force

A re-implementation of d3-force with WebAssembly.


TODO:

- [x] Create multiple typescript configurations
- [ ] Use the ASC compiler directly to inline the code (note, could use rollup-plugin-wasm), although inline code is still async
- [x] Resolve build-wasm warnings
- [ ] Find a better way to read / write WASM buffers
- [ ] Make use of d3-force typing
- [x] ensure the code behaves exactly the same as d3-force


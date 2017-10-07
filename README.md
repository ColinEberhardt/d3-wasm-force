# d3-wasm-force

A re-implementation of d3-force in WebAssembly with the AssemblyScript compiler.

## Overview

The goal of this project is to create a drop-in replacement for d3-force, using WebAssembly. Rather than implement the full d3-force API, I am aiming to re-create the following example:

https://bl.ocks.org/mbostock/4062045

To build the project run:

```
npm install
npm run build
```

This will run the TypeScript compiler and rollup to create a bundle, and the AssemblyScript compiler to create a separate wasm file.

The resulting output is namespaces as `d3wasm`, and can be used in exactly the same way as the `d3` counterpart:

~~~javascript
const simulation = d3wasm.forceSimulation(graph.nodes, true)
  .force('charge', d3wasm.forceManyBody())
  .force('center', d3wasm.forceCenter(width / 2, height / 2))
  .force('link', d3wasm.forceLink().links(graph.links).id(d => d.id))
  .stop();
~~~

## Switching between WebAssembly and JavaScript

One of the really interesting features of AssemblyScript is that it compiles TypeScript to JavaScript. As a result, the TypeScript source of the WebAssembly module can also be compiled to TypeScript, giving the option of running it either as WebAssembly or JavaScript!

The second argument passed to `forceSimulation` allows you to choose whether to use the WebAssembly or JavaScript build. Passing false uses the JavaScript version:

~~~javascript
const simulation = d3wasm.forceSimulation(graph.nodes, false)
~~~

## TODO

- [x] Create multiple typescript configurations
- [ ] Inline the code (note, could use rollup-plugin-wasm), although inline code is still async
- [x] Resolve build-wasm warnings
- [ ] Find a better way to read / write WASM buffers
- [ ] Make use of d3-force typing
- [x] ensure the code behaves exactly the same as d3-force
- [ ] implement the fx / fy properties of force layout


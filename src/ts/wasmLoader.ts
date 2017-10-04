let wasmCode;

export const load = (file) => fetch(file)
  .then(response => response.arrayBuffer())
  .then(bytes => WebAssembly.instantiate(bytes, {}))
  .then(results => {
    wasmCode = results.instance.exports;
  });

export const getWasmCode = () => wasmCode;
import { getWasmCode } from './wasmLoader';

declare class Float64Array {
  constructor(buffer: Float64Array, offset: number, length: number);
}

declare class Uint32Array {
  constructor(buffer: Uint32Array, offset: number, length: number);
}

export const getAdaptedWasmCode: (() => ForceLayoutComputer) = () => {
  const wasm = getWasmCode();

  // TODO: wasm is frozen so we cannot proxy! this is a big hack to allow proxying!!!!!!
  const wasm2 = {
    sin: wasm.sin,
    cos: wasm.cos,
    readNodeArray: wasm.readNodeArray,
    writeNodeArray: wasm.writeNodeArray,
    initializeNodes: wasm.initializeNodes,
    manyBody: wasm.manyBody,
    link: wasm.link,
    center: wasm.center,
    setNodeArrayLength: wasm.setNodeArrayLength,
    getNodeArrayLength: wasm.getNodeArrayLength,
    getNodeArray: wasm.getNodeArray,
    setLinkArrayLength: wasm.setLinkArrayLength,
    getLinkArrayLength: wasm.getLinkArrayLength,
    getLinkArray: wasm.getLinkArray
  };


  return new Proxy(wasm2, {
    get: (target, name) => {
      if (name === 'getNodeArray') {
        return () => {
          const offset = wasm.getNodeArray();
          return new Float64Array(wasm.memory.buffer, offset + 8, wasm.getNodeArrayLength() * 4);
        };
      } else if (name === 'getLinkArray') {
        return () => {
          const offset = wasm.getLinkArray();
          return new Uint32Array(wasm.memory.buffer, offset + 8, wasm.getLinkArrayLength() * 4);
        }
      } else {
        return target[name];
      }
    } 
  })
};

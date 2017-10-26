import wasmCode from '../../build/force.wasm';

import { Node, NodeLink } from '../wasm/force';

let wasm: any;

export const loaded = wasmCode()
  .then(instance => {
    wasm = instance.exports;
    return true;
  });

declare class Float64Array {
  constructor(buffer: Float64Array, offset: number, length: number);
}

declare class Uint32Array {
  constructor(buffer: Uint32Array, offset: number, length: number);
}

export const getAdaptedWasmCode: (() => ForceLayoutComputer) = () => {
  
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
          return new Float64Array(wasm.memory.buffer, offset + 8, wasm.getNodeArrayLength() * Node.size);
        };
      } else if (name === 'getLinkArray') {
        return () => {
          const offset = wasm.getLinkArray();
          return new Uint32Array(wasm.memory.buffer, offset + 8, wasm.getLinkArrayLength() * NodeLink.size);
        }
      } else {
        return target[name];
      }
    } 
  })
};

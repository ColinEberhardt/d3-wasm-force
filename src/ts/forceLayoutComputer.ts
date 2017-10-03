import * as force from '../force';

declare class Float64Array {
  constructor(buffer: Float64Array, offset: number, length: number);
}

let useWasm = false;

export const computer = {
  getNodeArray: () => {
    if (useWasm) {
      const offset = wasm.getNodeArray();
      return new Float64Array(wasm.memory.buffer, offset + 8, wasm.getNodeArrayLength() * 4);
    } else {
      return force.getNodeArray();
    }
  },
  setNodeArrayLength: (count) => useWasm ? wasm.setNodeArrayLength(count) : force.setNodeArrayLength(count),
  getNodeArrayLength: () => useWasm ? wasm.getNodeArrayLength() : force.getNodeArrayLength(),
  initializeNodes: () => useWasm ? wasm.initializeNodes() : force.initializeNodes(),
  readNodeArray: () => useWasm ? wasm.readNodeArray() : force.readNodeArray(),
  writeNodeArray: () => useWasm ? wasm.writeNodeArray() : force.writeNodeArray(),
  manyBody: (alpha: number, strength: number) => useWasm ? wasm.manyBody(alpha, strength) : force.manyBody(alpha, strength),
  useWasm: (use) => useWasm = use
};
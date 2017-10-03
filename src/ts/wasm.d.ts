interface Memory {
  buffer: Float64Array;
}

interface WasmExports {
  getNodeArray: () => number;
  setNodeArrayLength: (number) => void;
  getNodeArrayLength: () => number;
  readNodeArray: () => void;
  writeNodeArray: () => void;

  initializeNodes: () => void;
  manyBody: (alpha: number, strength: number) => void;
  
  memory: Memory;
  
}

declare var wasm: WasmExports;
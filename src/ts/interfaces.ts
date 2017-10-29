interface ForceFactory<T extends Force>  {
  (): T;
}

interface CenterForceFactory {
  (sx: number, sy: number): CenterForce;
}

interface ForceLayoutComputer {
  getNodeArray: () => Float64Array;
  setNodeArrayLength: (number) => void;
  getNodeArrayLength: () => number;

  getLinkArray: () => Uint32Array;
  setLinkArrayLength: (number) => void;
  getLinkArrayLength: () => number;

  readFromMemory: () => void;
  writeToMemory: () => void;

  initializeNodes: () => void;
  manyBody: (alpha: number, strength: number) => void;
  link: (alpha: number) => void; 
  center: (cx: number, cy: number) => void;
}


interface NodeDatum {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number;
  fy?: number;
}

interface Force {
  (alpha: number): void;
  initialize: (computer: ForceLayoutComputer, nodes: NodeDatum[]) => void;
}

interface CenterForce extends Force {
}

interface ManyBodyForce extends Force {
  strength: (number) => void;
}

interface LinkForce extends Force {
  links: (links: any) => LinkForce;
  id: (idFunction: any) => LinkForce;
}

interface ForceSimulationFactory {
  (nodes: NodeDatum[], useWasm: boolean): ForceSimulation;
}

interface ForceSimulation {
  tick: () => ForceSimulation;
  force: (name: string, force: Force) => ForceSimulation;
  stop: () => ForceSimulation;
  alphaTarget: (a: number) => ForceSimulation;
  restart: () => ForceSimulation;
}
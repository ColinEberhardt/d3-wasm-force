interface ForceFactory<T extends Force>  {
  (): T;
}

interface Force {
  (alpha: number): void;
}

interface ManyBodyForce extends Force {
  strength: (number) => void;
}

interface LinkForce extends Force {
  id: (idFunction: (node: any) => any) => LinkForce;
  links: (links: any) => LinkForce;
}

interface ForceSimulationFactory {
  (nodes: any, useWasm: bool): ForceSimulation;
}

interface ForceSimulation {
  tick: () => ForceSimulation;
  force: (name: string, force: Force) => ForceSimulation;
}
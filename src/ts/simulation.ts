import { getAdaptedWasmCode } from './wasmAdapter';
import * as force from '../wasm/force';

export const simulation: ForceSimulationFactory = (nodes, useWasm) => {

  const velocityDecay = 0.6;
  let alpha = 1.0;
  const alphaMin = 0.001;
  const alphaDecay = 1 - Math.pow(alphaMin, 1 / 300);
  let alphaTarget = 0;
  const forces: Force[] = [];

  const computer: ForceLayoutComputer = useWasm ?  getAdaptedWasmCode() : force;

  const readNodesFromBuffer = () => {
    const nodeBuffer = computer.getNodeArray();
    nodes.forEach((node, index) => {
      node.x = nodeBuffer[index * 4];
      node.y = nodeBuffer[index * 4 + 1];
      node.vx = nodeBuffer[index * 4 + 2];
      node.vy = nodeBuffer[index * 4 + 3];
    })
  };

  const writeNodesToBuffer = () => {
    const nodeBuffer = computer.getNodeArray();
    nodes.forEach((node, index) => {
      nodeBuffer[index * 4] = node.x;
      nodeBuffer[index * 4 + 1] = node.y;
      nodeBuffer[index * 4 + 2] = node.vx;
      nodeBuffer[index * 4 + 3] = node.vy;
    })
  };

  computer.setNodeArrayLength(nodes.length);
  computer.readNodeArray();

  computer.initializeNodes();
  
  computer.writeNodeArray();
  readNodesFromBuffer();

  const simulation = <ForceSimulation> {};

  simulation.tick = () => {

    alpha += (alphaTarget - alpha) * alphaDecay;

    writeNodesToBuffer();
    computer.readNodeArray();

    forces.forEach(force => {
      force(alpha);
    })

    computer.writeNodeArray();
    readNodesFromBuffer();

    for (let i = 0; i < nodes.length; ++i) {
      const node = nodes[i];
      node.x += node.vx;
      node.vx *= velocityDecay;
      node.y += node.vy;
      node.vy *= velocityDecay;
    }

    return simulation;
  };

  simulation.force = (name: string, force: Force) => {
    forces.push(force);
    force.initialize(computer, nodes);
    return simulation;
  };

  simulation.alphaTarget = (a: number) => {
    alphaTarget = a;
    return simulation;
  }

  simulation.restart = () => {
    alpha = 0.0;
    return simulation;
  }

  // this simulation implementation does't support internal timers.
  simulation.stop = () => simulation;
  
  return simulation;
};
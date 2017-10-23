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

  const executeWasm = (wasmCode) => {
    
    let nodeBuffer = computer.getNodeArray();
    nodes.forEach((node, index) => {
      nodeBuffer[index * 4] = node.x;
      nodeBuffer[index * 4 + 1] = node.y;
      nodeBuffer[index * 4 + 2] = node.vx;
      nodeBuffer[index * 4 + 3] = node.vy;
    })

    computer.readNodeArray();
  
    wasmCode();
    
    computer.writeNodeArray();

    nodeBuffer = computer.getNodeArray();
    nodes.forEach((node, index) => {
      node.x = nodeBuffer[index * 4];
      node.y = nodeBuffer[index * 4 + 1];
      node.vx = nodeBuffer[index * 4 + 2];
      node.vy = nodeBuffer[index * 4 + 3];
    })
  };

  computer.setNodeArrayLength(nodes.length);
  
  executeWasm(() => {
    computer.initializeNodes();
  });
  
  const simulation = <ForceSimulation> {};

  simulation.tick = () => {

    alpha += (alphaTarget - alpha) * alphaDecay;

    executeWasm(() => {
      forces.forEach(force => {
        force(alpha);
      })
    });

    nodes.forEach((node) => {
      if (node.fx == null) {
        node.x += node.vx;
        node.vx *= velocityDecay;
      } else {
        node.x = node.fx;
        node.vx = 0;
      }
      if (node.fy == null) {
        node.y += node.vy;
        node.vy *= velocityDecay;
      } else {
        node.y = node.fy;
        node.vy = 0;
      }
    });

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
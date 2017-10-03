import {computer} from './forceLayoutComputer';

interface NamedForce {
  name: string;
  force: Force;
}

export const forceSimulation: ForceSimulationFactory = (nodes, useWasm) => {

  const velocityDecay = 0.6;
  const alpha = 1.0;

  // TODO: why is an array type not working here?
  const forces: any = [];

  computer.useWasm(useWasm);

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

  const simulation = {
    tick: () => {
      computer.readNodeArray();

      forces.forEach((force: NamedForce) => {
        force.force(alpha);
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

      writeNodesToBuffer();
      return simulation;
    },
    force: (name: string, force: Force) => {
      forces.push({
        name,
        force
      });
      return simulation;
    }
  };
  return simulation;
};
class Node {
  x: f64;
  y: f64;
  vx: f64;
  vy: f64;
  constructor(x: f64, y: f64, vx: f64, vy: f64) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
  }
}

class NodeLink {
  source: Node;
  target: Node;
  strength: f64;
  constructor(source: Node, target: Node, strength: f64) {
    this.source = source;
    this.target = target;
    this.strength = strength;
  }
}

const nodeArray: Float64Array = new Float64Array(1000);
let nodeArrayLength: i32;
let typedNodeArray: Array<Node>

const linkArray: Uint32Array = new Uint32Array(1000);
let linkArrayLength: i32;
let typedLinkArray: Array<NodeLink>

const PI: f64 = 3.141592653589793;

export function sin(x: f64): f64 {
  while (x < -PI) {
    x += PI * 2;
  } 
  while (x > PI) {
    x -= PI * 2;
  }

  let sin: f64;
  if (x < 0) {
    sin = 1.27323954 * x + .405284735 * x * x;
    if (sin < 0) {
      sin = .225 * (sin *-sin - sin) + sin;
    } else {
      sin = .225 * (sin * sin - sin) + sin;
    }
  } else {
    sin = 1.27323954 * x - 0.405284735 * x * x;
    if (sin < 0) {
      sin = .225 * (sin *-sin - sin) + sin;
    } else {
      sin = .225 * (sin * sin - sin) + sin;
    }
  }
  return sin;
}

export function cos(x: f64): f64 {
  return sin(x - PI / 2);
}

const initialRadius: f64 = 10.0;
const initialAngle: f64 = PI * (3.0 - sqrt(5.0));

export function readNodeArray(): void {
  typedNodeArray = new Array<Node>(nodeArrayLength);
  for (let i: i32 = 0; i < nodeArrayLength; i++) {
    const idx: i32 = i * 4;
    const typedNode: Node = new Node(
      nodeArray[idx] as f64,
      nodeArray[idx + 1] as f64,
      nodeArray[idx + 2] as f64,
      nodeArray[idx + 3] as f64
    );
    typedNodeArray[i] = typedNode;
  }

  typedLinkArray = new Array<NodeLink>(linkArrayLength);
  for (let i: i32 = 0; i < linkArrayLength; i++) {
    const idx: i32 = i * 3;
    const sourceIndex: i32 = linkArray[idx];
    const targetIndex: i32 = linkArray[idx + 1];
    const strength: i32 = linkArray[idx + 1];
    const link: NodeLink = new NodeLink(
      typedNodeArray[sourceIndex],
      typedNodeArray[targetIndex],
      30
    );
    typedLinkArray[i] = link;
  }
}

export function writeNodeArray(): void {
  for (let i: i32 = 0; i < nodeArrayLength; i++) {
    const idx: i32 = i * 4;
    const typedNode: Node = typedNodeArray[i];
    nodeArray[idx] = typedNode.x;
    nodeArray[idx + 1] = typedNode.y;
    nodeArray[idx + 2] = typedNode.vx;
    nodeArray[idx + 3] = typedNode.vy;
  }
}

export function initializeNodes(): void {
  for (let i: i32 = 0; i < nodeArrayLength; i++) {
    const node: Node = typedNodeArray[i];
    const radius: f64 = initialRadius * sqrt(i as f64)
    const angle: f64 = i as f64 * initialAngle;
    node.x = radius * sin(angle);
    node.y = radius * cos(angle);
    node.vx = 0;
    node.vy = 0;
  }
}

export function manyBody(alpha: f64, strength: f64): void {
  for (let i: i32 = 0; i < nodeArrayLength; i++) {
    for (let j: i32 = 0; j < nodeArrayLength; j++) {
      if (i != j) {
        const nodeOne: Node = typedNodeArray[i];
        const nodeTwo: Node = typedNodeArray[j];
        const dx: f64 = nodeTwo.x - nodeOne.x;
        const dy: f64 = nodeTwo.y - nodeOne.y;
        const l: f64 = dx * dx + dy * dy;
        const w: f64 = strength * alpha / l;
        // += doesn't work!
        nodeOne.vx = nodeOne.vx + dx * w;
        nodeOne.vy = nodeOne.vy + dy * w;
      }
    }
  }
}

export function setNodeArrayLength(count: i32): void {
  nodeArrayLength = count;
}

export function getNodeArrayLength(): i32 {
  return nodeArrayLength;
}

export function getNodeArray(): Float64Array {
  return nodeArray;
};

export function setLinkArrayLength(count: i32): void {
  linkArrayLength = count;
}

export function getLinkArrayLength(): i32 {
  return linkArrayLength;;
}

export function getLinkArray(): Uint32Array {
  return linkArray;
};
class Node  {
  x: f64;
  y: f64;
  vx: f64;
  vy: f64;
  links: f64;
  constructor(x: f64, y: f64, vx: f64, vy: f64) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.links = 0;
  }
}

class NodeLink {
  source: Node;
  target: Node;
  bias: f64;
  constructor(source: Node, target: Node) {
    this.source = source;
    this.target = target;
    this.bias = 0;
  }
}


let nodeArray: Float64Array = new Float64Array(1000);
let nodeArrayLength: i32;
let typedNodeArray: Array<Node>

let linkArray: Uint32Array = new Uint32Array(1000);
let linkArrayLength: i32;
let typedLinkArray: Array<NodeLink>

let PI: f64 = 3.141592653589793;

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

let initialRadius: f64 = 10.0;
let initialAngle: f64 = PI * (3.0 - sqrt(5.0));

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
    const idx: i32 = i * 2;
    const source: Node = typedNodeArray[linkArray[idx]];
    const target: Node = typedNodeArray[linkArray[idx + 1]];
    const typedLink: NodeLink = new NodeLink(source, target);    
    typedLinkArray[i] = typedLink;
    typedLink.source.links = typedLink.source.links + 1.0;
    typedLink.target.links = typedLink.target.links + 1.0;
  }

  for (let i: i32 = 0; i < linkArrayLength; i++) {
    const typedLink: NodeLink = typedLinkArray[i];
    typedLink.bias = typedLink.source.links / (typedLink.source.links + typedLink.target.links);
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

export function center(x: f64, y: f64): void {
  let sx: f64 = 0, sy: f64 = 0;
  // TODO: cannot cast integers to floats, the required conversion functions are not exposed
  // https://github.com/WebAssembly/design/blob/master/Semantics.md#datatype-conversions-truncations-reinterpretations-promotions-and-demotions
  let nodeCount: f64 = 0;
  for (let i: i32 = 0; i < nodeArrayLength; i++) {
    sx = sx + typedNodeArray[i].x;
    sy = sy + typedNodeArray[i].y;
    nodeCount = nodeCount + 1;
  }
  sx = sx / nodeCount - x;
  sy = sy / nodeCount - y;
  for (let i: i32 = 0; i < nodeArrayLength; i++) {
    typedNodeArray[i].x -= sx;
    typedNodeArray[i].y -= sy;
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
        // TODO: += doesn't work here!
        nodeOne.vx = nodeOne.vx + dx * w;
        nodeOne.vy = nodeOne.vy + dy * w;
      }
    }
  }
}

const distance: f64 = 30;

export function link(alpha: f64): void {
  for (let i: i32 = 0; i < linkArrayLength; i++) {
    const link: NodeLink = typedLinkArray[i];
    let dx: f64 = link.target.x + link.target.vx - link.source.x - link.source.vx;
    let dy: f64 = link.target.y + link.target.vy - link.source.y - link.source.vy;
    const length: f64 = sqrt(dx * dx + dy * dy);
    const strength: f64 = 1 / min(link.target.links, link.source.links);
    const deltaLength: f64 = (length - distance) / length * strength * alpha;
    dx = dx * deltaLength;
    dy = dy * deltaLength;
    link.target.vx = link.target.vx - dx * link.bias;
    link.target.vy = link.target.vy - dy * link.bias;
    link.source.vx = link.source.vx + dx * (1 - link.bias);
    link.source.vy = link.source.vy + dy * (1 - link.bias);
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
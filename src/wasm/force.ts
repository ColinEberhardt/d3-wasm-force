// -------------------------------- classes shared between ASC and JS

export class Node  {
  x: f64;
  y: f64;
  vx: f64;
  vy: f64;
  links: f64 = 0;

  static size: i32 = 4;

  static read(node: Node, buffer: Float64Array, index: i32): Node {
    node.x = buffer[index * Node.size];
    node.y = buffer[index * Node.size + 1];
    node.vx = buffer[index * Node.size + 2];
    node.vy = buffer[index * Node.size + 3];
    return node;
  }

  static write(node: Node, buffer: Float64Array, index: i32): Node {
    buffer[index * Node.size] = node.x;
    buffer[index * Node.size + 1] = node.y;
    buffer[index * Node.size + 2] = node.vx;
    buffer[index * Node.size + 3] = node.vy;
    return node;
  }
}

export class NodeLink {
  sourceIndex: i32;
  targetIndex: i32;

  source: Node;
  target: Node;
  bias: f64;

  static size: i32 = 2;

  static read(nodeLink: NodeLink, buffer: Uint32Array, index: i32): NodeLink {
    nodeLink.sourceIndex = buffer[index * NodeLink.size];
    nodeLink.targetIndex = buffer[index * NodeLink.size + 1];
    return nodeLink;
  }

  static write(nodeLink: NodeLink, buffer: Uint32Array, index: i32): NodeLink {
    buffer[index * NodeLink.size] = nodeLink.sourceIndex;
    buffer[index * NodeLink.size + 1] = nodeLink.targetIndex;
    return nodeLink;
  }
}

// -------------------------------- classes that serialize / deserialize the above

class NodeArraySerialiser {
  array: Float64Array;
  count: i32;

  read(): Array<Node> {
    let typedArray: Array<Node> = new Array<Node>(this.count);
    for (let i: i32 = 0; i < this.count; i++) {
      typedArray[i] = Node.read(new Node(), this.array, i);
    }
    return typedArray;
  }

  write(typedArray: Array<Node>): void {
    for (let i: i32 = 0; i < this.count; i++) {
      Node.write(typedArray[i], this.array, i);
    }
  }

  initialise(count: i32): void {
    this.array = new Float64Array(count * Node.size);
    this.count = count;
  }
}

// bug: cannot just create a new NodeArraySerialiser()!!!
let node: Array<NodeArraySerialiser> = new Array<NodeArraySerialiser>(1);
node[0] = new NodeArraySerialiser();
function nodeArraySerialiser(): NodeArraySerialiser {
  return node[0];
}

let nodeArray: Array<Node>;

export function setNodeArrayLength(count: i32): void {
  nodeArraySerialiser().initialise(count);
}

export function getNodeArrayLength(): i32 {
  return nodeArray.length;
}

export function getNodeArray(): Float64Array {
  return nodeArraySerialiser().array;
}

class NodeLinkArraySerialiser {
  array: Uint32Array;
  count: i32 = 0;

  read(): Array<NodeLink> {
    let typedArray: Array<NodeLink> = new Array<NodeLink>(this.count);
    for (let i: i32 = 0; i < this.count; i++) {
      typedArray[i] = NodeLink.read(new NodeLink(), this.array, i);;
    }
    return typedArray;
  }

  initialise(count: i32): void {
    this.array = new Uint32Array(count * NodeLink.size);
    this.count = count;
  }
}

// bug: cannot just create a new NodeArraySerialiser()!!!
let node2: Array<NodeLinkArraySerialiser> = new Array<NodeLinkArraySerialiser>(1);
node2[0] = new NodeLinkArraySerialiser();
function nodeArrayLinkSerialiser(): NodeLinkArraySerialiser {
  return node2[0];
}

let linkArray: Array<NodeLink>

export function setLinkArrayLength(count: i32): void {
  nodeArrayLinkSerialiser().initialise(count);
}

export function getLinkArrayLength(): i32 {
  return nodeArrayLinkSerialiser().count;
}

export function getLinkArray(): Uint32Array {
  return nodeArrayLinkSerialiser().array;
}

// -------------------------------- maths functions

let PI: f64 = 3.141592653589793;

function sin(x: f64): f64 {
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

function cos(x: f64): f64 {
  return sin(x - PI / 2);
}

// -------------------------------- read / write data form linear memory

export function readFromMemory(): void {
  nodeArray = nodeArraySerialiser().read();
  linkArray = nodeArrayLinkSerialiser().read();

  for (let i: i32 = 0; i < linkArray.length; i++) {
    const typedLink: NodeLink = linkArray[i];  

    // resolve the source / target indices to their respective nodes
    typedLink.source = nodeArray[typedLink.sourceIndex];
    typedLink.target = nodeArray[typedLink.targetIndex];

    // update the node link count
    typedLink.source.links = typedLink.source.links + 1.0;
    typedLink.target.links = typedLink.target.links + 1.0;
  }

  // compute the bias for each link
  for (let i: i32 = 0; i < linkArray.length; i++) {
    const typedLink: NodeLink = linkArray[i];
    typedLink.bias = typedLink.source.links / (typedLink.source.links + typedLink.target.links);
  }
}

// TODO: cannot cast integers to floats, the required conversion functions are not exposed
// https://github.com/WebAssembly/design/blob/master/Semantics.md#datatype-conversions-truncations-reinterpretations-promotions-and-demotions
// https://github.com/AssemblyScript/assemblyscript/issues/117#issuecomment-334927010
function convert(v: i32): f64 {
  const conversionBuffer: Float64Array = new Float64Array(1);
  conversionBuffer[0] = v as f64;
  return conversionBuffer[0];
}

export function writeToMemory(): void {
  nodeArraySerialiser().write(nodeArray);
}

// -------------------------------- d3 force layout functions

export function initializeNodes(): void {
  let initialRadius: f64 = 10.0;
  let initialAngle: f64 = PI * (3.0 - sqrt(5.0));
  
  for (let i: i32 = 0; i < nodeArray.length; i++) {
    const node: Node = nodeArray[i];
    const radius: f64 = initialRadius * sqrt(i as f64)
    const angle: f64 = convert(i) * initialAngle;
    node.x = radius * sin(angle);
    node.y = radius * cos(angle);
    node.vx = 0;
    node.vy = 0;
  }
}

export function center(x: f64, y: f64): void {
  let sx: f64 = 0, sy: f64 = 0;
  for (let i: i32 = 0; i < nodeArray.length; i++) {
    sx = sx + nodeArray[i].x;
    sy = sy + nodeArray[i].y;
  }
  sx = sx / convert(nodeArray.length) - x;
  sy = sy / convert(nodeArray.length) - y;
  for (let i: i32 = 0; i < nodeArray.length; i++) {
    nodeArray[i].x = nodeArray[i].x - sx;
    nodeArray[i].y = nodeArray[i].y - sy;
  }
}

export function manyBody(alpha: f64, strength: f64): void {
  for (let i: i32 = 0; i < nodeArray.length; i++) {
    for (let j: i32 = 0; j < nodeArray.length; j++) {
      if (i != j) {
        const nodeOne: Node = nodeArray[i];
        const nodeTwo: Node = nodeArray[j];
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

export function link(alpha: f64): void {
  let distance: f64 = 30;

  for (let i: i32 = 0; i < linkArray.length; i++) {
    const link: NodeLink = linkArray[i];
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


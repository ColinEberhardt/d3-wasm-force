class Node  {
  x: f64;
  y: f64;
  vx: f64;
  vy: f64;
  links: f64 = 0;

  static size: i32 = 4;

  read(buffer: Float64Array, index: i32): void {
    this.x = buffer[index * Node.size];
    this.y = buffer[index * Node.size + 1];
    this.vx = buffer[index * Node.size + 2];
    this.vy = buffer[index * Node.size + 3];
  }

  write(buffer: Float64Array, index: i32): void {
    buffer[index * Node.size] = this.x;
    buffer[index * Node.size + 1] = this.y;
    buffer[index * Node.size + 2] = this.vx;
    buffer[index * Node.size + 3] = this.vy;
  }
}

class NodeLink {
  sourceIndex: i32;
  targetIndex: i32;

  source: Node;
  target: Node;
  bias: f64;

  static size: i32 = 2;

  read(buffer: Uint32Array, index: i32): void {
    this.sourceIndex = buffer[index * NodeLink.size];
    this.targetIndex = buffer[index * NodeLink.size + 1];
  }
}

class NodeArraySerialiser {
  array: Float64Array;
  count: i32;

  read(): Array<Node> {
    let typedArray: Array<Node> = new Array<Node>(this.count);
    for (let i: i32 = 0; i < this.count; i++) {
      const item: Node = new Node();
      item.read(this.array, i);
      typedArray[i] = item;
    }
    return typedArray;
  }

  write(typedArray: Array<Node>): void {
    for (let i: i32 = 0; i < this.count; i++) {
      typedArray[i].write(this.array, i);
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

let typedNodeArray: Array<Node>;

class NodeLinkArraySerialiser {
  array: Uint32Array;
  count: i32 = 0;

  read(): Array<NodeLink> {
    let typedArray: Array<NodeLink> = new Array<NodeLink>(this.count);
    for (let i: i32 = 0; i < this.count; i++) {
      const item: NodeLink = new NodeLink();
      item.read(this.array, i);
      typedArray[i] = item;
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

// let linkArray: Uint32Array = new Uint32Array(1000);
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
  typedNodeArray = nodeArraySerialiser().read();
  typedLinkArray = nodeArrayLinkSerialiser().read();

  for (let i: i32 = 0; i < typedLinkArray.length; i++) {
    const typedLink: NodeLink = typedLinkArray[i];  

    // resolve the source / target indices to their respective nodes
    typedLink.source = typedNodeArray[typedLink.sourceIndex];
    typedLink.target = typedNodeArray[typedLink.targetIndex];

    // update the node link count
    typedLink.source.links = typedLink.source.links + 1.0;
    typedLink.target.links = typedLink.target.links + 1.0;
  }

  // compute the bias for each link
  for (let i: i32 = 0; i < typedLinkArray.length; i++) {
    const typedLink: NodeLink = typedLinkArray[i];
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

export function writeNodeArray(): void {
  nodeArraySerialiser().write(typedNodeArray);
}

export function initializeNodes(): void {
  for (let i: i32 = 0; i < typedNodeArray.length; i++) {
    const node: Node = typedNodeArray[i];
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
  for (let i: i32 = 0; i < typedNodeArray.length; i++) {
    sx = sx + typedNodeArray[i].x;
    sy = sy + typedNodeArray[i].y;
  }
  sx = sx / convert(typedNodeArray.length) - x;
  sy = sy / convert(typedNodeArray.length) - y;
  for (let i: i32 = 0; i < typedNodeArray.length; i++) {
    typedNodeArray[i].x = typedNodeArray[i].x - sx;
    typedNodeArray[i].y = typedNodeArray[i].y - sy;
  }
}

export function manyBody(alpha: f64, strength: f64): void {
  for (let i: i32 = 0; i < typedNodeArray.length; i++) {
    for (let j: i32 = 0; j < typedNodeArray.length; j++) {
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
  for (let i: i32 = 0; i < typedLinkArray.length; i++) {
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
  nodeArraySerialiser().initialise(count);
}

export function getNodeArrayLength(): i32 {
  return typedNodeArray.length;
}

export function getNodeArray(): Float64Array {
  return nodeArraySerialiser().array;
};

export function setLinkArrayLength(count: i32): void {
  nodeArrayLinkSerialiser().initialise(count);
}

export function getLinkArrayLength(): i32 {
  return nodeArrayLinkSerialiser().count;
}

export function getLinkArray(): Uint32Array {
  return nodeArrayLinkSerialiser().array;
};
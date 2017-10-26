import { NodeLink } from '../wasm/force';

export const link: ForceFactory<LinkForce> = () => {
  let strength = -30;
  let nodes: any;
  let links: any;
  let id = (n) => n.index;
  let computer: ForceLayoutComputer;

  const initialize = () => {
    if (!nodes) return;
    computer.setLinkArrayLength(links.length);
    const linkBuffer = computer.getLinkArray();
    links.forEach((link, index) => {
      const sourceIndex = nodes.findIndex(n => id(n) == link.source);
      const targetIndex = nodes.findIndex(n => id(n) == link.target);
      link.sourceIndex =  sourceIndex;
      link.targetIndex =  targetIndex;
      
      NodeLink.write(link as NodeLink, linkBuffer, index);


      link.source = nodes[sourceIndex];
      link.target = nodes[targetIndex];
    });
  }

  const link = <LinkForce>((alpha) => {
    computer.link(alpha);
  });

  link.initialize = (c, n) => {
    nodes = n;
    computer = c;
    initialize();
    return link;
  };

  link.id = (f) => {
    id = f;
    return link;
  }

  link.links = (l) => {
    links = l;
    initialize();
    return link;
  }

  return link;
};
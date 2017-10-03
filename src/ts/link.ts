import {computer} from './forceLayoutComputer';

export const link: ForceFactory<LinkForce> = () => {
  let strength = -30;
  let id = (d) => d.index;
  
  const link = <LinkForce>((alpha) => {
    
  });

  link.id = (fn) => {
    id = fn;
    return link;
  };
  
  return link;
};
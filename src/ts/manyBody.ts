import {computer} from './forceLayoutComputer';

export const manyBody: ForceFactory<ManyBodyForce> = () => {
  let strength = -30;
  
  const manyBody = <ManyBodyForce>((alpha) => {
    return computer.manyBody(alpha, strength)
  });

  manyBody.strength =  (s) => strength = s;
  
  return manyBody;
};
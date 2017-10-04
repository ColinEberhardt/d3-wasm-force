export const manyBody: ForceFactory<ManyBodyForce> = () => {
  let strength = -30;
  let computer: ForceLayoutComputer;

  const manyBody = <ManyBodyForce>((alpha) => {
    return computer.manyBody(alpha, strength)
  });

  manyBody.strength = (s) => strength = s;

  manyBody.initialize = (c, n) => { computer = c; };

  return manyBody;
};
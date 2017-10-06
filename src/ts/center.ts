export const center: CenterForceFactory = (cx = 0.0, cy = 0.0) => {
  let computer: ForceLayoutComputer;

  const center = <CenterForce>((alpha) => {
    return computer.center(cx, cy);
  });

  center.initialize = (c, n) => { computer = c; };

  return center;
};
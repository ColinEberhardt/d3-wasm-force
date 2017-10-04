export const center: ForceFactory<CenterForce> = () => {
  let computer: ForceLayoutComputer;

  const center = <CenterForce>((alpha) => {
    return computer.center()
  });

  center.initialize = (c, n) => { computer = c; };

  return center;
};
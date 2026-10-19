interface Props {
  from?: 'above' | 'below';
}

export function LaserShot({ from = 'above' }: Props) {
  return <span className={`laser-shot ${from === 'below' ? 'from-below' : ''}`} aria-hidden="true" />;
}

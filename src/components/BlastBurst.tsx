const PARTICLES = ['💥', '⭐', '✨', '💥', '⭐', '✨'];

export function BlastBurst() {
  return (
    <span className="blast-particles" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <span key={i} className="blast-particle">
          {p}
        </span>
      ))}
    </span>
  );
}

export function formatTime(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

export function formatDate(ts: number): string {
  const d = new Date(ts);
  const date = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${date} · ${time}`;
}

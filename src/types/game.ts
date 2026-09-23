import type { ComponentType } from 'react';

export interface GameMeta {
  id: string;
  title: string;
  tagline: string;
  emoji: string;
  color: string;
  Component: ComponentType<{ onExit: () => void }>;
}

import type { Metadata } from 'next';
import GameWrapper from '@/components/GameWrapper';

export const metadata: Metadata = {
  title: 'Hrať',
  description: 'Zahraj si FriWorld priamo v prehliadači.',
};

export default function PlayPage() {
  return <GameWrapper />;
}

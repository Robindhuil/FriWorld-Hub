'use client';

import dynamic from 'next/dynamic';

const UnityGame = dynamic(() => import('./UnityGame'), { ssr: false });

export default function GameWrapper() {
  return <UnityGame />;
}

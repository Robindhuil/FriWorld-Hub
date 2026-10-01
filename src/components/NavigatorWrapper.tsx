'use client';

import dynamic from 'next/dynamic';
import type { UnityInstance } from './UnityGame';

const UnityGame = dynamic(() => import('./UnityGame'), { ssr: false });

const PRODUCT = {
  companyName: 'Crimsoned Rose',
  productName: 'FriWorld Navigator',
  productVersion: '0.1.0',
};

/**
 * The Navigator build, flying to one room. Its NavigatorController sits on the
 * scene object "Navigator" and starts the flight when told Go with the code.
 */
export default function NavigatorWrapper({ code }: { code: string }) {
  return (
    <UnityGame
      api="/api/navigator"
      product={PRODUCT}
      title={code}
      loadingText="Hľadám cestu…"
      errorTitle="Navigáciu sa nepodarilo spustiť"
      homeHref="/navigator"
      homeLabel="Miestnosti"
      homeTitle="Späť na zoznam miestností"
      onReady={(instance: UnityInstance) => instance.SendMessage('Navigator', 'Go', code)}
    />
  );
}

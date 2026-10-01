import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import NavigatorWrapper from '@/components/NavigatorWrapper';
import { resolveNavigatorRooms } from '@/lib/game-build';

type Props = { params: Promise<{ code: string }> };

// The room list comes with the uploaded build, so it is read on every request.
export const dynamic = 'force-dynamic';

/** "ra 101" and "Ra101" name the same room as RA101, as in the Navigator itself. */
function normalize(code: string): string {
  let text = code;
  try {
    text = decodeURIComponent(code);
  } catch {
    /* not encoded */
  }
  return text.replace(/\s+/g, '').toUpperCase();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return { title: `Navigácia k ${normalize(code)}` };
}

export default async function NavigatePage({ params }: Props) {
  const code = normalize((await params).code);

  // An unknown room never downloads the build. When the list itself is missing,
  // the player below says why.
  const rooms = await resolveNavigatorRooms();
  if (Array.isArray(rooms) && !rooms.includes(code)) notFound();

  return <NavigatorWrapper code={code} />;
}

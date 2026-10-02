'use client';

import type { MouseEvent, ReactNode } from 'react';
import { NAVIGATOR_BAR, NAVIGATOR_WINDOW } from '@/lib/navigator-window';

type Props = { code: string; className?: string; children?: ReactNode };

/**
 * A room on the Navigator page. On a computer a plain click opens the flight in a
 * window of its own: a third of the screen wide, as tall as the 16:9 picture plus
 * its controls, in the middle of the screen. Every room reuses that one window.
 * Phones, and ctrl- or middle-clicks, open a tab as any link would.
 */
export default function NavigatorRoomLink({ code, className, children }: Props) {
  const href = `/navigate/${code}`;

  const open = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const screen = window.screen as Screen & { availLeft?: number; availTop?: number };
    const width = Math.round(screen.availWidth / 3);
    const height = Math.round((width * 9) / 16) + NAVIGATOR_BAR;
    const left = Math.round((screen.availLeft ?? 0) + (screen.availWidth - width) / 2);
    const top = Math.round((screen.availTop ?? 0) + (screen.availHeight - height) / 2);

    const win = window.open(href, NAVIGATOR_WINDOW, `popup,width=${width},height=${height},left=${left},top=${top}`);
    if (!win) return; // blocked: the link opens a tab instead
    e.preventDefault();
    win.focus();
  };

  return (
    <a href={href} target="_blank" rel="noopener" onClick={open} className={className}>
      {children ?? code}
    </a>
  );
}

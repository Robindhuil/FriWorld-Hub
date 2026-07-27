import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: "FriWorld — 3D prehliadka fakulty",
    template: "%s · FriWorld",
  },
  description:
    "FriWorld je interaktívna 3D prehliadka Fakulty riadenia a informatiky. Spoznaj fakultu zvnútra a vyskúšaj si základy programovania — priamo v prehliadači.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="sk"
      className={`${fredoka.variable} ${nunito.variable} antialiased`}
    >
      <body className="min-h-screen bg-paper text-ink">{children}</body>
    </html>
  );
}

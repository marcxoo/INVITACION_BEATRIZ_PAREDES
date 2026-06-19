
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Invitación - Beatriz Paredes",
  description: "¡Te invitamos a celebrar!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" href="/beatriz_invitacion_compressed_compressed_compressed-comprimido.pdf" as="fetch" crossOrigin="anonymous" />
        <link rel="preload" href="/pdf.worker.min.mjs" as="script" />
        <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@400;700;900&display=swap" rel="stylesheet" />
      </head>
      <body
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}

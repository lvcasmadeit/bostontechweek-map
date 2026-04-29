import type { Metadata } from "next";
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Boston Tech Week 2026 Interactive Map",
  description:
    "A dark neon event discovery map for Boston Tech Week 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-dark-bg antialiased">
      <body className="min-h-full bg-dark-bg font-sans">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["400", "500", "700"],
});

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
    <html
      lang="en"
      className={`h-full bg-dark-bg antialiased ${spaceGrotesk.variable}`}
    >
      <body className="min-h-full bg-dark-bg font-sans">{children}</body>
    </html>
  );
}

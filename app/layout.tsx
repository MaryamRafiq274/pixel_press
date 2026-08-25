import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "minifyme — Compress Images Without Losing Quality",
  description:
    "Compress, resize, convert, and optimize images in seconds. No registration required. Batch processing. Privacy-first image tools for developers, designers, and creators.",
  keywords: [
    "image compression",
    "compress images online",
    "image resizer",
    "image converter",
    "webp converter",
    "batch image compression",
  ],
  openGraph: {
    title: "minifyme — Compress Images Without Losing Quality",
    description:
      "Compress, resize, convert, and optimize images in seconds. No registration required.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "minifyme — Compress Images Without Losing Quality",
    description:
      "Compress, resize, convert, and optimize images in seconds. No registration required.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

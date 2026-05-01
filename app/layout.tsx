import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { PresenterShell } from "@/components/presenter-shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RefCheck AI — Was it a fair call?",
  description:
    "AI-powered officiating review, grounded in the official NBA rulebook. Built for GDG BorderHack 2026.",
  applicationName: "RefCheck AI",
  authors: [{ name: "GDG BorderHack 2026" }],
  openGraph: {
    title: "RefCheck AI — Was it a fair call?",
    description:
      "AI-powered officiating review, grounded in the official NBA rulebook.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full antialiased">
        <div className="grain" aria-hidden />
        <PresenterShell>{children}</PresenterShell>
      </body>
    </html>
  );
}

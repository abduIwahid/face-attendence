import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

/**
 * Aurora's one typeface (ADR-011): Plus Jakarta Sans for everything.
 * next/font self-hosts the files at build time — no runtime font CDN.
 */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Face Attendance System",
  description:
    "Attendance by live selfie + live GPS radius — face match AND location match, or no attendance.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`h-full antialiased ${jakarta.variable}`}>
      <body className="min-h-full flex flex-col bg-background font-sans text-primary">
        {children}
      </body>
    </html>
  );
}

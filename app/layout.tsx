import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Face Attendance System",
  description:
    "Attendance by live selfie + live GPS radius — face match AND location match, or no attendance.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-primary">
        {children}
      </body>
    </html>
  );
}

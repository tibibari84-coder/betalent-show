import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "BETALENT",
  description: "BETALENT — premium digital talent show, mobile-first.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="streaming-shell flex min-h-dvh flex-col font-sans">
        {children}
      </body>
    </html>
  );
}

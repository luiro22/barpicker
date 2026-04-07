import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Barpicker",
  description: "Barpicker arpoo illan baarin tai yökerhon Helsingistä.",
  icons: {
    icon: "/barpicker-icon.png",
    shortcut: "/barpicker-icon.png",
    apple: "/barpicker-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fi">
      <body>{children}</body>
    </html>
  );
}
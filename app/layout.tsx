import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-ibm-plex-mono",
  weight: "100 900",
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-ibm-plex-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Treasury Console",
  description: "Internal platform for Bitcoin treasury training & consulting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistMono.variable} ${geistSans.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

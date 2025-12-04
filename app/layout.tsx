import type { Metadata } from "next";
import { Host_Grotesk } from "next/font/google";
import "./globals.css";

const groteskSans = Host_Grotesk({
  variable: "--font-hostgrotesk-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Under Construction | Shocked Future",
  description: "Shocked Future is completely overhauling our digital infrastructure. All standard functionalities are temporarily suspended while we rebuild from the atom up.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${groteskSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

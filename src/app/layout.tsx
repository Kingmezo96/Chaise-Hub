import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import "./globals.css";
import "./kontract.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export const metadata: Metadata = {
  title: "Chaise Workspace | Kontract & Hub",
  description: "Create Chaise contracts and book verified hub workspaces from one unified dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${sora.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

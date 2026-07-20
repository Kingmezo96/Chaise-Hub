import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import "./kontract.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "Chaise Hub | Freelancer Workspace Pass",
  description: "Book a Chaise Hub workspace for an active freelance project and generate a secure check-in pass.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

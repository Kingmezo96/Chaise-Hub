import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

import React from 'react'
import type { Metadata } from "next";
import '@/app/main.css'

export const metadata: Metadata = {
  title: "Perfmate",
  description: "Freelancer time and wage tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="font-sans">
      <body className="bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}

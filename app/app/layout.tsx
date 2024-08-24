import React from 'react'
import Sidebar from "@/app/ui/sidebar/sidebar"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full">
      <Sidebar />
      <main className="relative mx-auto py-12 w-2/3 xl:w-3/5 2xl:w-2/5">
        {children}
      </main>
    </div>
  );
}

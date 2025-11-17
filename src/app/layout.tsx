import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Money Mate - Own what you owe",
  description: "AI-powered group expense tracking and bill splitting made simple",
  icons: {
    icon: "/favicon.jpeg",
    shortcut: "/favicon.jpeg",
    apple: "/favicon.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased bg-[var(--color-bg)] text-[var(--color-text)] min-h-screen`}>
        <SessionProvider>
          <QueryProvider>
            <main className="min-h-screen">
              {children}
            </main>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

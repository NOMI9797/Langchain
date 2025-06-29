import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chatty - AI Chat Assistant",
  description: "Meet Chatty, your friendly AI assistant powered by Groq and LangChain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-100 flex flex-col items-center justify-center">
          {children}
        </div>
      </body>
    </html>
  );
}

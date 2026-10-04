import type { Metadata } from "next";
import { Geist_Mono, Google_Sans, Montserrat } from "next/font/google";
import "./globals.css";
import { getIconFontHref } from "@/shared/ui/icons";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { cn } from "@/shared/lib/utils";

const googleSans = Google_Sans({
  subsets: ["latin"],
  variable: "--font-google-sans",
  adjustFontFallback: false,
  fallback: ["system-ui", "Arial", "sans-serif"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LangChain Deep Agent · Next.js",
  description:
    "Deploying a LangChain deep agent with Next.js: streaming chat, subagents, and per-thread history.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "dark h-full font-sans antialiased",
        googleSans.variable,
        montserrat.variable,
        geistMono.variable
      )}
    >
      <link href={getIconFontHref()} precedence="default" rel="stylesheet" />
      <body className="min-h-full">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}

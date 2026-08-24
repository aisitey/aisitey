import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "aisitey - Build with Context, Not Chaos",
    template: "%s | aisitey",
  },
  description:
    "Turn your ideas into real products with AI that understands your project context. Structured files guide AI agents to build exactly what you need — faster, cheaper, and without losing track of decisions.",
  keywords: [
    "AI development",
    "context-driven development",
    "AI coding agent",
    "project management",
    "software development",
    "AI tools",
    "developer productivity",
    "code generation",
    "AI workflow",
  ],
  authors: [{ name: "Walaa MoFekry" }],
  creator: "Walaa MoFekry",
  publisher: "aisitey",
  metadataBase: new URL("https://aisitey.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aisitey.com",
    siteName: "aisitey",
    title: "aisitey - Build with Context, Not Chaos",
    description:
      "Turn your ideas into real products with AI that understands your project context. Structured files guide AI agents to build exactly what you need.",
    images: [
      {
        url: "/aisitey-logo.png",
        width: 512,
        height: 512,
        alt: "aisitey logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "aisitey - Build with Context, Not Chaos",
    description:
      "Turn your ideas into real products with AI that understands your project context.",
    images: ["/aisitey-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body className="min-h-full">
        <ClerkProvider
          signInFallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
        >
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "var(--bg-surface)",
                color: "var(--text-black)",
                border: "1px solid var(--border-default)",
                borderRadius: "12px",
                padding: "12px 16px",
                fontSize: "14px",
              },
            }}
          />
          <Analytics />
        </ClerkProvider>
      </body>
    </html>
  );
}

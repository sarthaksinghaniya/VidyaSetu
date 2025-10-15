import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/contexts/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vidya Setu - AI Internship Recommendation Engine",
  description: "AI-powered internship matching platform for PM Internship Scheme. Connect students with meaningful opportunities across India.",
  keywords: ["Vidya Setu", "Internship", "AI", "PM Internship Scheme", "Smart India Hackathon", "Education", "India"],
  authors: [{ name: "Vidya Setu Team" }],
  openGraph: {
    title: "Vidya Setu - AI Internship Recommendation Engine",
    description: "AI-powered internship matching platform for PM Internship Scheme",
    url: "https://vidyasetu.example.com",
    siteName: "Vidya Setu",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vidya Setu - AI Internship Recommendation Engine",
    description: "AI-powered internship matching platform for PM Internship Scheme",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <LanguageProvider>
          {children}
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  );
}

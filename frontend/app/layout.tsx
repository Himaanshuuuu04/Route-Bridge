import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ToastProvider } from "./context/ToastContext";
import { TooltipProvider } from "@/components/ui/tooltip";

const calSans = localFont({
  src: [
    {
      path: "../public/calsans-static-ui/CalSansUI-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/calsans-static-ui/CalSansUI-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/calsans-static-ui/CalSansUI-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/calsans-static-ui/CalSansUI-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-calsans",
});

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Survey Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${calSans.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <TooltipProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}

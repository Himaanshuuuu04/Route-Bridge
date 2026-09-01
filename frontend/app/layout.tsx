import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ToastProvider } from "./context/ToastContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider } from "./store/Provider";

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
  title: {
    default: "EvoGlobal Insight - Intelligent Survey Redirects & Publisher Analytics",
    template: "%s | EvoGlobal Insight",
  },
  description: "A premium, secure survey routing and redirection platform. Seamlessly manage upstream panel URLs, configure custom screeners, prevent fraud, and view real-time publisher stats.",
  keywords: [
    "survey routing",
    "screener redirects",
    "market research router",
    "survey traffic management",
    "publisher dashboard",
    "response tracking",
    "survey callbacks",
    "fraud prevention",
  ],
  authors: [{ name: "EvoGlobal Insight" }],
  creator: "EvoGlobal Insight Team",
  publisher: "EvoGlobal Insight",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dashboard.evoglobalinsight.com",
    title: "EvoGlobal Insight - Intelligent Survey Redirects & Publisher Analytics",
    description: "Manage upstream panel URLs, custom screeners, and real-time publisher callback statistics in a single premium dashboard.",
    siteName: "EvoGlobal Insight",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EvoGlobal Insight Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EvoGlobal Insight - Intelligent Survey Redirects & Publisher Analytics",
    description: "Intelligent survey routing platform and real-time analytics dashboard.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${calSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <StoreProvider>
          <TooltipProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </TooltipProvider>
        </StoreProvider>
      </body>
    </html>
  );
}

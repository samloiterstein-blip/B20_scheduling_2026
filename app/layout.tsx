import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";

const chamberSans = localFont({
  src: [
    {
      path: "./fonts/GT-America-Standard-Regular-Trial.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/GT-America-Standard-Medium-Trial.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/GT-America-Standard-Bold-Trial.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-chamber-sans",
  display: "swap",
});

const chamberSerif = localFont({
  src: [
    {
      path: "./fonts/Tobias-TRIAL-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Tobias-TRIAL-Medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-chamber-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "B20 team sign-ups",
  description:
    "Mark B20 USA Summit sessions and see where the team overlaps.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${chamberSans.variable} ${chamberSerif.variable} h-full`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}

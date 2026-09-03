import type { Metadata } from "next";
import { Inter, Outfit, Merriweather } from "next/font/google";
import "./globals.css";
import "./components.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-merriweather",
});

export const metadata: Metadata = {
  title: "BTPHub",
  description:
    "Local care. Local jobs. Built for neighborhoods. Connecting families with trusted neighborhood sitters.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} ${merriweather.variable}`}
      >
        {children}
      </body>
    </html>
  );
}

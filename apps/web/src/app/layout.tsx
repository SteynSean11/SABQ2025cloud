import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { HeroUIProvider } from "@heroui/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SA Budget Queen",
  description: "Helping you manage your finances.",
};

/**
 * App root layout that supplies global fonts, CSS and the HeroUIProvider to every page.
 *
 * @param children - The page content to render inside the app's root.
 * @returns The top-level HTML structure (<html>/<body>) with the global font class and HeroUIProvider wrapping `children`.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <HeroUIProvider>{children}</HeroUIProvider>
      </body>
    </html>
  );
}

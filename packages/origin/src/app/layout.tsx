import type { Metadata } from "next";
import "@/tokens/_variables.scss";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Origin Design System v2",
  description: "Base UI + Figma-first component library",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inove ESG",
  description:
    "Plataforma e metodologia para transformar ESG em vantagem competitiva: diagnóstico, evidências, resultados mensuráveis e monitoramento contínuo.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "Inove ESG",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

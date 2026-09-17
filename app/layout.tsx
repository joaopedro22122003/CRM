import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Garagem do Jota",
  description: "CRM da Garagem do Jota — gestão de clientes, orçamentos e marcações",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Garagem do Jota",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1c1917",
};

// A app lê sempre dados atuais da base de dados (clientes, pedidos,
// marcações…) e está protegida por sessão — nunca faz sentido gerar
// páginas estáticas em build.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" className="h-full">
      <body className="flex min-h-dvh flex-col antialiased">
        <div className="flex-1 pb-20">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "../app/styles/globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { VaultDataProvider } from "@/providers/VaultDataProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Bitwarden Vault Analyzer",
  description: "Analyze your Bitwarden vault securely and locally.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <VaultDataProvider>
            <div className="flex flex-col min-h-[100dvh] bg-background">
              <Header />
              <div className="flex flex-1 w-full">
                <Sidebar />
                <main className="flex-1 p-4 pt-14 md:pt-6 md:p-6 lg:p-8 overflow-y-auto w-full md:ml-64 lg:ml-72 print:p-0 print:m-0">
                  <div className="container mx-auto max-w-7xl">{children}</div>
                </main>
              </div>
            </div>
            <Toaster />
          </VaultDataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

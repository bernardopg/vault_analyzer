import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../app/styles/globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { VaultDataProvider } from "@/providers/VaultDataProvider";
import { Sidebar } from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bitwarden Vault Analyzer",
  description: "Analyze your Bitwarden vault securely and locally.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <VaultDataProvider>
            <div className="flex min-h-[100dvh] bg-background">
              <Sidebar />
              <main className="flex-1 p-4 pt-14 md:pt-4 md:p-6 lg:p-8 overflow-y-auto w-full md:ml-64 lg:ml-72 print:p-0 print:m-0">
                {children}
              </main>
            </div>
          </VaultDataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

// src/components/layout/Header.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useVaultData } from "@/providers/VaultDataProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/FileUploader";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  HomeIcon,
  AlertTriangle,
  MenuIcon,
  ShieldCheck,
  Info,
} from "lucide-react";

export const Header: React.FC = () => {
  const { analysisResults, analysisSummary, fileName } = useVaultData();

  const criticalCount = analysisSummary?.passwordStats.criticalCount || 0;
  const leakedCount = analysisSummary?.passwordStats.leakedCount || 0;
  const totalCritical = criticalCount + leakedCount;

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4 md:px-6">
        <div className="md:hidden mr-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 pt-14">
              {/* Mobile sidebar content will be handled by the Sidebar component */}
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/android-chrome-192x192.png"
              alt="Vault Analyzer Logo"
              width={24}
              height={24}
              className="rounded-sm"
            />
            <span className="font-semibold inline-block">Vault Analyzer</span>
          </Link>
        </div>

        <div className="flex-1 flex justify-center md:justify-end space-x-2">
          {!analysisResults ? (
            <div className="hidden sm:block">
              <FileUploader variant="header" />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {fileName && (
                <div className="hidden md:flex items-center text-sm text-muted-foreground">
                  <Badge variant="outline" className="mr-2">
                    <Info className="h-3 w-3 mr-1" />
                    {fileName}
                  </Badge>
                </div>
              )}

              {totalCritical > 0 && (
                <Link href="/critical">
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                    <span>{totalCritical} críticas</span>
                  </Button>
                </Link>
              )}

              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="h-8 gap-1">
                  <HomeIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>

              <Link href="/security-score">
                <Button variant="ghost" size="sm" className="h-8 gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Score</span>
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

// src/components/layout/Sidebar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useVaultData } from "@/providers/VaultDataProvider";

import { FileUploader } from "@/components/FileUploader";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ExportOptions } from "@/components/ExportOptions";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  FileText,
  Wrench,
  ShieldAlert,
  Github,
  KeyRound,
  AlertTriangle,
  Copy,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Define navigation items type
interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: () => React.ReactNode;
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { analysisSummary } = useVaultData();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Funções para criar badges dinâmicos baseados nos dados do cofre
  const getCriticalBadge = () => {
    if (!analysisSummary) return null;
    const count =
      analysisSummary.passwordStats.criticalCount +
      analysisSummary.passwordStats.leakedCount;
    if (count === 0) return null;
    return (
      <Badge variant="destructive" className="ml-auto">
        {count}
      </Badge>
    );
  };

  const getDuplicatesBadge = () => {
    if (!analysisSummary) return null;
    const count = analysisSummary.passwordStats.duplicateCount;
    if (count === 0) return null;
    return (
      <Badge variant="outline" className="ml-auto">
        {count}
      </Badge>
    );
  };

  // Define your navigation items here with dynamic badges
  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      href: "/critical",
      label: "Senhas Críticas",
      icon: ShieldAlert,
      badge: getCriticalBadge,
    },
    {
      href: "/duplicates",
      label: "Duplicadas",
      icon: Copy,
      badge: getDuplicatesBadge,
    },
    { href: "/details", label: "Análise Detalhada", icon: FileText },
    { href: "/tools", label: "Ferramentas", icon: Wrench },
  ];

  // Função para gerar uma senha aleatória forte
  const generateRandomPassword = () => {
    const length = 16; // Tamanho de senha recomendado
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+";
    let password = "";

    // Garante pelo menos um caractere de cada categoria
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*()-_=+"[Math.floor(Math.random() * 14)];

    // Completa o resto da senha
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Embaralha os caracteres
    return password
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");
  };

  // Componente de gerador de senhas simplificado
  const PasswordGenerator = () => {
    // Inicializar com string vazia para evitar incompatibilidade de hidratação
    const [password, setPassword] = React.useState("");
    const [copied, setCopied] = React.useState(false);

    // Gerar a senha apenas no lado do cliente para evitar erros de hidratação
    React.useEffect(() => {
      if (password === "") {
        setPassword(generateRandomPassword());
      }
    }, [password]);

    const regeneratePassword = () => {
      setPassword(generateRandomPassword());
      setCopied(false);
    };

    const copyToClipboard = () => {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="p-3 border rounded-md bg-card space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium flex items-center">
            <KeyRound className="h-3.5 w-3.5 mr-1.5" />
            Gerador de Senhas
          </h3>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2"
            onClick={regeneratePassword}
            title="Gerar nova senha"
          >
            <span className="sr-only">Gerar nova</span>
            <AlertTriangle className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div
          className="p-2 bg-muted font-mono text-xs rounded border border-input overflow-hidden text-wrap break-all cursor-pointer"
          onClick={copyToClipboard}
          title="Clique para copiar"
        >
          {password || "Carregando..."}
        </div>

        <Button
          className="w-full h-8 text-xs"
          size="sm"
          onClick={copyToClipboard}
          disabled={!password}
        >
          {copied ? "Copiado!" : "Copiar Senha"}
        </Button>
      </div>
    );
  };

  // Resumo do status do cofre
  const VaultSummary = () => {
    if (!analysisSummary) return null;

    const stats = analysisSummary.passwordStats;
    const totalItems = analysisSummary.totalItems;
    const criticalPercentage = Math.round(
      (stats.criticalCount / totalItems) * 100
    );
    const leakedPercentage = Math.round((stats.leakedCount / totalItems) * 100);

    // Determina o status geral do cofre
    let statusLevel = "success";
    let statusText = "Bom";

    if (stats.criticalCount > 0 || stats.leakedCount > 0) {
      statusLevel = "destructive";
      statusText = "Crítico";
    } else if (stats.weakCount > totalItems * 0.2) {
      // Se mais de 20% das senhas são fracas
      statusLevel = "warning";
      statusText = "Médio";
    }

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
            Status do Cofre
          </h3>
          <Badge
            variant={
              statusLevel as "default" | "destructive" | "secondary" | "outline"
            }
          >
            {statusText}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-muted/50 rounded">
            <div className="text-muted-foreground">Críticas</div>
            <div className="font-medium">
              {stats.criticalCount} ({criticalPercentage}%)
            </div>
          </div>
          <div className="p-2 bg-muted/50 rounded">
            <div className="text-muted-foreground">Vazadas</div>
            <div className="font-medium">
              {stats.leakedCount} ({leakedPercentage}%)
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  // Componente para o botão de menu mobile
  const MobileMenuButton = () => (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden fixed top-3 left-3 z-50 bg-background/80 backdrop-blur-sm"
      onClick={toggleMobileSidebar}
      aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
    >
      {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </Button>
  );

  // Classes para o sidebar baseado no estado mobile
  const sidebarClasses = cn(
    "bg-card border-r flex-col h-[100dvh] max-h-[100dvh] overflow-hidden",
    "transition-all duration-300 ease-in-out",
    "w-64 lg:w-72 print:hidden",
    // Mobile
    "fixed inset-y-0 left-0 z-40",
    mobileOpen ? "translate-x-0" : "-translate-x-full",
    // Desktop
    "md:translate-x-0 md:static md:flex"
  );

  return (
    <>
      <MobileMenuButton />
      <div
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-30 transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={toggleMobileSidebar}
        aria-hidden="true"
      />
      <aside className={sidebarClasses}>
        {/* Header: Logo and Title */}
        <div className="flex items-center justify-between p-3 flex-shrink-0">
          <Link
            href="/"
            className="flex items-center space-x-2 group flex-shrink-0 mr-2"
            title="Ir para Dashboard"
            onClick={() => setMobileOpen(false)}
          >
            <Image
              src="/android-chrome-192x192.png"
              alt="Vault Analyzer Logo"
              width={28}
              height={28}
              priority
              className="group-hover:opacity-80 transition-opacity rounded-sm"
            />
            <h1 className="text-base font-semibold group-hover:text-primary transition-colors whitespace-nowrap">
              Vault Analyzer
            </h1>
          </Link>
          <ThemeToggle />
        </div>

        <Separator className="flex-shrink-0" />

        {/* Conteúdo com scroll */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-3 space-y-6">
            {/* File Uploader Section */}
            <div className="space-y-1">
              <FileUploader />
            </div>

            {/* Status do Cofre (aparece apenas quando tem dados) */}
            {analysisSummary && (
              <>
                <Separator />
                <VaultSummary />
              </>
            )}

            <Separator />

            {/* Navigation Section */}
            <nav className="space-y-1">
              <h2 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground px-1 mb-1 pt-1">
                Navegação
              </h2>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (pathname === "/" && item.href === "/dashboard");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex w-full items-center",
                      isActive ? "font-semibold" : "font-normal"
                    )}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className="w-full justify-start"
                    >
                      <item.icon
                        className={cn(
                          "mr-2 h-4 w-4",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      {item.label}
                      {item.badge && item.badge()}
                    </Button>
                  </Link>
                );
              })}
            </nav>

            <Separator />

            {/* Password Generator */}
            <div className="space-y-2">
              <h2 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground px-1">
                Ferramentas
              </h2>
              <PasswordGenerator />
            </div>

            {/* Export Options (quando tem dados) */}
            {analysisSummary && (
              <div className="space-y-2">
                <h2 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground px-1">
                  Exportar
                </h2>
                <div className="w-full flex justify-center">
                  <ExportOptions />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t bg-card flex-shrink-0">
          <div className="flex items-center justify-between text-xs">
            <Link
              href="https://github.com/bitterulf/vault-analyzer"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
              title="Ver código no GitHub"
            >
              <Github className="h-3.5 w-3.5 mr-1" /> GitHub
            </Link>
            <span className="text-muted-foreground">v0.1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};

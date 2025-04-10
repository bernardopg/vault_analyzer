"use client";

import { useVaultData } from "@/providers/VaultDataProvider";
import {
  Loader2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  ShieldClose,
  Copy,
  PackageOpen,
  FileText,
  Key,
} from "lucide-react";
import React from "react";
import Image from "next/image";
import { FileUploader } from "@/components/FileUploader"; // Import FileUploader
import { Separator } from "@/components/ui/separator"; // Import Separator
import { PasswordStrengthDistribution } from "@/components/charts/PasswordStrengthDistribution";
import { DomainDistribution } from "@/components/charts/DomainDistribution";
import { PasswordWordCloud } from "@/components/charts/PasswordWordCloud";
import { ExportOptions } from "@/components/ExportOptions";

// Simple Metric Card Component
const SimpleMetric = ({
  label,
  value,
  icon: Icon,
  className = "",
}: {
  label: string;
  value: string | number;
  icon?: React.ElementType;
  className?: string;
}) => (
  <div
    className={`bg-card p-3 md:p-4 rounded-lg border flex flex-col justify-between min-h-[90px] hover:shadow-sm transition-shadow ${className}`}
  >
    <div className="flex items-center justify-between mb-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      {Icon && <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
    </div>
    <div className="text-xl lg:text-2xl font-semibold">{value}</div>
  </div>
);

export default function DashboardPage() {
  const {
    vaultData,
    analysisResults,
    analysisSummary,
    isLoading,
    isAnalyzing,
    error,
    fileName,
  } = useVaultData();

  // Combine loading and analyzing for a single loading state indicator
  const showLoading = isLoading || isAnalyzing;
  const displayError = error && !showLoading; // Show error only if not loading/analyzing

  if (showLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-10rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <span className="text-lg text-muted-foreground">
          {isAnalyzing ? "Analisando vazamentos..." : "Carregando arquivo..."}
        </span>
        {isAnalyzing && (
          <p className="text-sm text-muted-foreground mt-2 max-w-md text-center">
            Verificando se suas senhas apareceram em vazamentos de dados. Este
            processo pode levar alguns segundos.
          </p>
        )}
      </div>
    );
  }

  if (displayError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-10rem)] text-center p-4">
        <AlertCircle className="h-10 w-10 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive mb-2">
          Erro ao Carregar
        </h2>
        <p className="text-destructive/90 max-w-md">{error}</p>
        {/* Provide uploader again on error for retry */}
        <div className="mt-6 w-full max-w-xs">
          <FileUploader />
        </div>
      </div>
    );
  }

  if (!vaultData || !analysisResults || !analysisSummary) {
    // Initial welcome screen
    return (
      <div className="text-center p-4 md:p-10 flex flex-col items-center justify-center min-h-[calc(100dvh-10rem)]">
        <Image
          src="/android-chrome-192x192.png"
          alt="Vault Analyzer Logo"
          width={80}
          height={80}
          className="mb-4 opacity-90"
          priority
        />
        <h1 className="text-2xl md:text-3xl font-semibold mb-3">
          Bem-vindo ao Vault Analyzer
        </h1>
        <p className="text-muted-foreground max-w-lg mb-6 text-base">
          Analise a segurança do seu cofre Bitwarden localmente. Para começar,
          carregue seu arquivo de exportação
          <code className="text-xs bg-muted text-muted-foreground/80 p-1 rounded mx-1 font-mono">
            .json
          </code>{" "}
          (não criptografado).
        </p>
        {/* Show uploader prominently on welcome screen */}
        <div className="w-full max-w-xs">
          <FileUploader />
        </div>
      </div>
    );
  }

  // Data and analysis loaded successfully
  const stats = analysisSummary.passwordStats;

  return (
    <div className="space-y-5 lg:space-y-8 pb-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold">📊 Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Arquivo:{" "}
            <strong className="font-medium text-foreground/80">
              {fileName}
            </strong>{" "}
            | Itens Analisados:{" "}
            <strong className="font-medium text-foreground/80">
              {analysisSummary.totalItems}
            </strong>
          </p>
        </div>

        {/* Export Button */}
        <div className="hidden md:block">
          <ExportOptions />
        </div>
      </div>

      {/* Uploader visible on small screens even when data is loaded, for quick replacement */}
      <div className="md:hidden">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <FileUploader />
          <ExportOptions />
        </div>
        <Separator className="my-4" />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-8 gap-3 md:gap-4">
        <SimpleMetric
          label="Senhas Vazias"
          value={stats.emptyCount}
          icon={PackageOpen}
        />
        <SimpleMetric
          label="Senhas Duplicadas"
          value={stats.duplicateCount}
          icon={Copy}
        />
        <SimpleMetric
          label="Senhas Críticas"
          value={stats.criticalCount}
          icon={ShieldClose}
          className="bg-red-50 dark:bg-red-950/20"
        />
        <SimpleMetric
          label="Senhas Fracas"
          value={stats.weakCount}
          icon={ShieldAlert}
          className="bg-orange-50 dark:bg-orange-950/20"
        />
        <SimpleMetric
          label="Senhas Vazadas"
          value={stats.leakedCount}
          icon={ShieldAlert}
          className="bg-amber-50 dark:bg-amber-950/20"
        />
        <SimpleMetric
          label="Força Média"
          value={stats.averageStrengthScore.toFixed(2) + "/4"}
          icon={ShieldCheck}
        />
        <SimpleMetric
          label="Comp. Médio"
          value={stats.averageLength.toFixed(1)}
          icon={FileText}
        />
        <SimpleMetric
          label="Com 2FA/TOTP"
          value={analysisResults.filter((item) => item.hasTotp).length}
          icon={Key}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4">
        <PasswordStrengthDistribution />
        <DomainDistribution />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <PasswordWordCloud />
      </div>

      {/* Footer Note */}
      <p className="text-xs text-muted-foreground pt-4 text-center md:text-left">
        Análise completa. Utilize as opções de exportação para obter relatórios
        detalhados.
      </p>
    </div>
  );
}

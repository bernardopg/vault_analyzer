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
  ArrowUpRight,
  ChevronRight,
  Clock,
  AlertTriangle,
  Lock,
} from "lucide-react";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FileUploader } from "@/components/FileUploader";
import { PasswordStrengthDistribution } from "@/components/charts/PasswordStrengthDistribution";
import { DomainDistribution } from "@/components/charts/DomainDistribution";
import { PasswordWordCloud } from "@/components/charts/PasswordWordCloud";
import { ExportOptions } from "@/components/ExportOptions";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Simple Metric Card Component
const SimpleMetric = ({
  label,
  value,
  icon: Icon,
  description,
  trend,
  trendLabel,
  onClick,
  className = "",
  variant = "default",
}: {
  label: string;
  value: string | number;
  icon?: React.ElementType;
  description?: string;
  trend?: number;
  trendLabel?: string;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}) => {
  // Determina as classes de cor baseadas na variante
  const getVariantClasses = () => {
    switch (variant) {
      case "success":
        return "bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/30";
      case "warning":
        return "bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/30";
      case "danger":
        return "bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30";
      case "info":
        return "bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/30";
      default:
        return "bg-card hover:bg-muted/50";
    }
  };

  const getTrendColor = () => {
    if (trend === undefined) return "";
    // Para alguns casos, um trend negativo é bom (ex: senhas vazadas)
    if ((variant === "danger" || variant === "warning") && trend < 0) {
      return "text-emerald-500";
    }
    if ((variant === "danger" || variant === "warning") && trend > 0) {
      return "text-red-500";
    }
    return trend > 0
      ? "text-emerald-500"
      : trend < 0
      ? "text-red-500"
      : "text-muted-foreground";
  };

  return (
    <div
      className={cn(
        "p-4 rounded-lg border transition-all duration-150 flex flex-col justify-between",
        "min-h-[110px] relative group",
        getVariantClasses(),
        onClick ? "cursor-pointer" : "",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
      </div>
      <div className="text-2xl lg:text-3xl font-semibold">{value}</div>

      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}

      {trend !== undefined && (
        <div className={cn("flex items-center text-xs mt-2", getTrendColor())}>
          {trend > 0 ? "+" : ""}
          {trend}%
          {trendLabel && (
            <span className="ml-1 text-muted-foreground">{trendLabel}</span>
          )}
        </div>
      )}

      {onClick && (
        <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

// Security Score Component
const SecurityScoreCard = ({ score }: { score: number }) => {
  // Determina as classes de cor e mensagem com base na pontuação
  const getScoreColor = () => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreBackground = () => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getScoreMessage = () => {
    if (score >= 80) return "Excelente";
    if (score >= 60) return "Bom";
    if (score >= 40) return "Regular";
    if (score >= 20) return "Fraco";
    return "Crítico";
  };

  const getSecurityTip = () => {
    if (score >= 80)
      return "Continue mantendo senhas fortes e evite reutilizá-las entre diferentes serviços.";
    if (score >= 60)
      return "Melhore algumas senhas mais fracas e considere ativar 2FA em contas importantes.";
    if (score >= 40)
      return "Priorize a alteração de senhas críticas e fracas por senhas mais fortes.";
    return "Recomendamos alterar urgentemente suas senhas críticas e vazadas.";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <Lock className="h-4 w-4 mr-2" />
          Índice de Segurança
        </CardTitle>
        <CardDescription>
          Avaliação geral da segurança do seu cofre
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center pb-2">
          <div className="relative w-32 h-32 flex items-center justify-center mb-3">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                className="text-muted/20"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                className={getScoreBackground()}
                strokeWidth="10"
                strokeDasharray={`${(2 * Math.PI * 45 * score) / 100} ${
                  2 * Math.PI * 45 * (1 - score / 100)
                }`}
                strokeDashoffset={2 * Math.PI * 45 * 0.25}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={cn("text-3xl font-bold", getScoreColor())}>
                {score}
              </span>
              <span className="text-xs text-muted-foreground">de 100</span>
            </div>
          </div>
          <div className="text-center space-y-1">
            <h3 className={cn("font-medium", getScoreColor())}>
              {getScoreMessage()}
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs text-center">
              {getSecurityTip()}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        <Button variant="outline" className="w-full text-xs h-8" asChild>
          <Link href="/security-score">
            <span>Ver análise detalhada</span>
            <ArrowUpRight className="h-3.5 w-3.5 ml-1.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

// Vulnerabilities Summary Component
const VulnerabilitiesSummary = ({
  criticalCount,
  leakedCount,
  duplicateCount,
  totalItems,
}: {
  criticalCount: number;
  leakedCount: number;
  duplicateCount: number;
  totalItems: number;
}) => {
  // Calcula percentuais
  const criticalPercent = Math.round((criticalCount / totalItems) * 100) || 0;
  const leakedPercent = Math.round((leakedCount / totalItems) * 100) || 0;
  const duplicatePercent = Math.round((duplicateCount / totalItems) * 100) || 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Vulnerabilidades Principais
        </CardTitle>
        <CardDescription>Problemas prioritários para correção</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <div className="font-medium flex items-center">
                <ShieldClose className="h-4 w-4 mr-1.5 text-red-500" />
                <span>Senhas Críticas</span>
              </div>
              <div className="text-muted-foreground">
                {criticalCount} ({criticalPercent}%)
              </div>
            </div>
            <Progress
              value={criticalPercent}
              className="h-2"
              indicatorClassName="bg-red-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <div className="font-medium flex items-center">
                <ShieldAlert className="h-4 w-4 mr-1.5 text-amber-500" />
                <span>Senhas Vazadas</span>
              </div>
              <div className="text-muted-foreground">
                {leakedCount} ({leakedPercent}%)
              </div>
            </div>
            <Progress
              value={leakedPercent}
              className="h-2"
              indicatorClassName="bg-amber-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <div className="font-medium flex items-center">
                <Copy className="h-4 w-4 mr-1.5 text-blue-500" />
                <span>Senhas Duplicadas</span>
              </div>
              <div className="text-muted-foreground">
                {duplicateCount} ({duplicatePercent}%)
              </div>
            </div>
            <Progress
              value={duplicatePercent}
              className="h-2"
              indicatorClassName="bg-blue-500"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        <Button variant="outline" className="w-full text-xs h-8" asChild>
          <Link href="/critical">
            <span>Ver senhas vulneráveis</span>
            <ArrowUpRight className="h-3.5 w-3.5 ml-1.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

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

  const [activeTab, setActiveTab] = useState("overview");

  // Combine loading and analyzing for a single loading state indicator
  const showLoading = isLoading || isAnalyzing;
  const displayError = error && !showLoading; // Show error only if not loading/analyzing

  // Calcula o score de segurança
  const calculateSecurityScore = () => {
    if (!analysisSummary) return 0;

    const { totalItems, passwordStats } = analysisSummary;
    if (totalItems === 0) return 0;

    // Fatores ponderados para o cálculo
    const strongPasswords =
      totalItems -
      passwordStats.weakCount -
      passwordStats.criticalCount -
      passwordStats.emptyCount;
    const strongRatio = strongPasswords / totalItems;

    const duplicateRatio = passwordStats.duplicateCount / totalItems;
    const leakedRatio = passwordStats.leakedCount / totalItems;
    const criticalRatio = passwordStats.criticalCount / totalItems;
    const emptyRatio = passwordStats.emptyCount / totalItems;

    // Fórmula para o score (ajuste os pesos conforme necessário)
    const score =
      strongRatio * 100 - // Porcentagem de senhas fortes
      duplicateRatio * 20 - // Penalidade por duplicatas
      leakedRatio * 30 - // Penalidade por vazamentos
      criticalRatio * 30 - // Penalidade por críticas
      emptyRatio * 20; // Penalidade por vazias

    return Math.max(0, Math.min(100, Math.round(score)));
  };

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
    // Initial welcome screen with improved layout
    return (
      <div className="flex min-h-[calc(100dvh-10rem)]">
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-md space-y-6 text-center">
            <div className="space-y-2">
              <div className="inline-flex justify-center mb-4">
                <Image
                  src="/android-chrome-192x192.png"
                  alt="Vault Analyzer Logo"
                  width={80}
                  height={80}
                  className="opacity-90"
                  priority
                />
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold">
                Bitwarden Vault Analyzer
              </h1>
              <p className="text-muted-foreground text-base">
                Analise a segurança do seu cofre de senhas localmente, sem
                enviar dados para nenhum servidor.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Começar</CardTitle>
                <CardDescription>
                  Carregue seu arquivo de exportação para analisar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <FileUploader />
                  <p className="text-xs text-muted-foreground text-center">
                    Exporte seu cofre no formato{" "}
                    <code className="bg-muted text-muted-foreground/80 p-1 rounded mx-1 font-mono">
                      JSON
                    </code>{" "}
                    (não criptografado) para analisar.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-sm text-muted-foreground">
              <div className="flex flex-col items-center space-y-2">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <span>Análise local e privada</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Clock className="h-6 w-6 text-primary" />
                <span>Resultados em segundos</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Key className="h-6 w-6 text-primary" />
                <span>Recomendações de segurança</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Data and analysis loaded successfully
  const stats = analysisSummary.passwordStats;
  const securityScore = calculateSecurityScore();

  return (
    <div className="space-y-6 pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Visão geral da segurança do seu cofre de senhas
          </p>
        </div>

        {/* Export Button */}
        <div className="flex space-x-2">
          <div className="hidden md:block">
            <ExportOptions />
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/details">
              Ver detalhes
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* File Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="p-4 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Arquivo analisado</h3>
              <p className="text-sm text-muted-foreground">
                {fileName} • {analysisSummary.totalItems} itens
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <FileUploader variant="header" />
            <div className="md:hidden">
              <ExportOptions />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Dashboard Views */}
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full max-w-md mx-auto grid grid-cols-2">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="metrics">Métricas Detalhadas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {/* Overview Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-6">
              <SecurityScoreCard score={securityScore} />
              <VulnerabilitiesSummary
                criticalCount={stats.criticalCount}
                leakedCount={stats.leakedCount}
                duplicateCount={stats.duplicateCount}
                totalItems={analysisSummary.totalItems}
              />
            </div>

            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle className="text-base">
                    Distribuição por Domínios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DomainDistribution />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-0">
                    <CardTitle className="text-base">
                      Força das Senhas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PasswordStrengthDistribution />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-0">
                    <CardTitle className="text-base">Estatísticas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Força média
                        </span>
                        <span className="font-medium">
                          {stats.averageStrengthScore.toFixed(2)}/4
                        </span>
                      </div>
                      <Progress
                        value={stats.averageStrengthScore * 25}
                        className="h-1.5"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Comprimento médio
                        </span>
                        <span className="font-medium">
                          {stats.averageLength.toFixed(1)} caracteres
                        </span>
                      </div>
                      <Progress
                        value={Math.min(100, (stats.averageLength / 16) * 100)}
                        className="h-1.5"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Com 2FA/TOTP
                        </span>
                        <span className="font-medium">
                          {
                            analysisResults.filter((item) => item.hasTotp)
                              .length
                          }{" "}
                          contas
                        </span>
                      </div>
                      <Progress
                        value={Math.min(
                          100,
                          (analysisResults.filter((item) => item.hasTotp)
                            .length /
                            analysisSummary.totalItems) *
                            100
                        )}
                        className="h-1.5"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
          {/* Metrics Content */}
          <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <SimpleMetric
                label="Senhas Vazias"
                value={stats.emptyCount}
                description={`${Math.round(
                  (stats.emptyCount / analysisSummary.totalItems) * 100
                )}% do total`}
                icon={PackageOpen}
                variant="info"
              />
              <SimpleMetric
                label="Senhas Duplicadas"
                value={stats.duplicateCount}
                description={`${Math.round(
                  (stats.duplicateCount / analysisSummary.totalItems) * 100
                )}% do total`}
                icon={Copy}
                variant="info"
                onClick={() => (window.location.href = "/duplicates")}
              />
              <SimpleMetric
                label="Senhas Críticas"
                value={stats.criticalCount}
                description="Altamente vulneráveis"
                icon={ShieldClose}
                variant="danger"
                onClick={() => (window.location.href = "/critical")}
              />
              <SimpleMetric
                label="Senhas Vazadas"
                value={stats.leakedCount}
                description="Encontradas em vazamentos"
                icon={ShieldAlert}
                variant="warning"
                onClick={() => (window.location.href = "/critical")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle className="text-base">Nuvem de Palavras</CardTitle>
                  <CardDescription>
                    Termos mais comuns em suas senhas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PasswordWordCloud />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-0">
                  <CardTitle className="text-base">
                    Métricas Adicionais
                  </CardTitle>
                  <CardDescription>
                    Outros indicadores de segurança
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
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
                      value={
                        analysisResults.filter((item) => item.hasTotp).length
                      }
                      icon={Key}
                    />
                    <SimpleMetric
                      label="Score Geral"
                      value={securityScore}
                      description={
                        securityScore >= 80
                          ? "Excelente"
                          : securityScore >= 60
                          ? "Bom"
                          : "Precisa melhorar"
                      }
                      variant={
                        securityScore >= 80
                          ? "success"
                          : securityScore >= 60
                          ? "warning"
                          : "danger"
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Note */}
      <div className="flex justify-center mt-6">
        <p className="text-xs text-muted-foreground max-w-md text-center">
          Análise completa. Seus dados são processados localmente e não são
          armazenados em nenhum servidor. Utilize as opções de exportação para
          obter relatórios detalhados.
        </p>
      </div>
    </div>
  );
}

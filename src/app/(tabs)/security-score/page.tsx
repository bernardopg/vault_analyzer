"use client";

import React from "react";
import { useVaultData } from "@/providers/VaultDataProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Key,
  Copy,
  Lock,
  ChevronRight,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function SecurityScorePage() {
  const { analysisSummary, analysisResults, isLoading } = useVaultData();

  // Funções de cálculo de pontuação
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

    // Fórmula para o score
    const score =
      strongRatio * 100 -
      duplicateRatio * 20 -
      leakedRatio * 30 -
      criticalRatio * 30 -
      emptyRatio * 20;

    return Math.max(0, Math.min(100, Math.round(score)));
  };

  // Calcula o score específico para cada categoria
  const calculateCategoryScore = (category: string) => {
    if (!analysisSummary) return 0;
    const { totalItems, passwordStats } = analysisSummary;
    if (totalItems === 0) return 0;

    switch (category) {
      case "strength":
        const strongRatio =
          (totalItems -
            passwordStats.weakCount -
            passwordStats.criticalCount -
            passwordStats.emptyCount) /
          totalItems;
        return Math.round(strongRatio * 100);

      case "uniqueness":
        return Math.max(
          0,
          100 - Math.round((passwordStats.duplicateCount / totalItems) * 100)
        );

      case "breach":
        return Math.max(
          0,
          100 - Math.round((passwordStats.leakedCount / totalItems) * 100)
        );

      case "2fa":
        // Calcula percentual com 2FA
        if (!analysisResults) return 0;
        const withTotpCount = analysisResults.filter(
          (item) => item.hasTotp
        ).length;
        return Math.round((withTotpCount / totalItems) * 100);

      default:
        return 0;
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-10rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <span className="text-lg text-muted-foreground">
          Calculando pontuação de segurança...
        </span>
      </div>
    );
  }

  // Se não houver dados carregados
  if (!analysisSummary || !analysisResults) {
    return (
      <div className="text-center py-12">
        <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Sem dados de análise</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          Carregue um arquivo de exportação do Bitwarden para ver a pontuação de
          segurança do seu cofre.
        </p>
        <Button asChild>
          <Link href="/">Ir para o início</Link>
        </Button>
      </div>
    );
  }

  const securityScore = calculateSecurityScore();
  const strengthScore = calculateCategoryScore("strength");
  const uniquenessScore = calculateCategoryScore("uniqueness");
  const breachScore = calculateCategoryScore("breach");
  const twoFaScore = calculateCategoryScore("2fa");

  // Função para determinar cor e classe baseadas na pontuação
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return "Excelente";
    if (score >= 60) return "Bom";
    if (score >= 40) return "Regular";
    if (score >= 20) return "Fraco";
    return "Crítico";
  };

  const getRecommendations = () => {
    const recs = [];

    if (analysisSummary.passwordStats.criticalCount > 0) {
      recs.push({
        title: "Altere senhas críticas",
        description:
          "Priorize a alteração das senhas identificadas como críticas.",
        priority: "Alta",
        link: "/critical",
        linkText: "Ver senhas críticas",
      });
    }

    if (analysisSummary.passwordStats.leakedCount > 0) {
      recs.push({
        title: "Altere senhas vazadas",
        description:
          "Troque imediatamente as senhas que foram encontradas em vazamentos de dados.",
        priority: "Alta",
        link: "/critical",
        linkText: "Ver senhas vazadas",
      });
    }

    if (analysisSummary.passwordStats.duplicateCount > 0) {
      recs.push({
        title: "Elimine senhas duplicadas",
        description:
          "Crie senhas únicas para cada serviço para evitar comprometer múltiplas contas.",
        priority: "Média",
        link: "/duplicates",
        linkText: "Ver duplicadas",
      });
    }

    if (twoFaScore < 50) {
      recs.push({
        title: "Ative 2FA em mais contas",
        description:
          "Adicione autenticação de dois fatores às suas contas mais importantes.",
        priority: "Média",
        link: "/details",
        linkText: "Ver detalhes",
      });
    }

    return recs;
  };

  const recommendations = getRecommendations();

  return (
    <div className="space-y-6 pb-10">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-semibold">
          Pontuação de Segurança
        </h1>
        <p className="text-sm text-muted-foreground">
          Avaliação detalhada da segurança do seu cofre de senhas
        </p>
      </div>

      {/* Main Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Score Geral</CardTitle>
            <CardDescription>
              Pontuação combinada de todos os fatores de segurança
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative w-40 h-40 flex items-center justify-center mb-3">
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
                  className={getScoreBackground(securityScore)}
                  strokeWidth="10"
                  strokeDasharray={`${
                    (2 * Math.PI * 45 * securityScore) / 100
                  } ${2 * Math.PI * 45 * (1 - securityScore / 100)}`}
                  strokeDashoffset={2 * Math.PI * 45 * 0.25}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span
                  className={cn(
                    "text-4xl font-bold",
                    getScoreColor(securityScore)
                  )}
                >
                  {securityScore}
                </span>
                <span className="text-sm text-muted-foreground">de 100</span>
              </div>
            </div>
            <div className="text-center mt-2">
              <h3
                className={cn(
                  "text-xl font-medium",
                  getScoreColor(securityScore)
                )}
              >
                {getScoreMessage(securityScore)}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                Esta pontuação representa o nível geral de segurança do seu
                cofre, baseada em múltiplos fatores como força das senhas,
                duplicações, vazamentos e uso de 2FA.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Análise por Categoria</CardTitle>
            <CardDescription>
              Desempenho individual em cada aspecto de segurança
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <ShieldCheck className="h-5 w-5 mr-2 text-emerald-500" />
                    <h3 className="font-medium">Força das Senhas</h3>
                  </div>
                  <span
                    className={cn(
                      "font-semibold",
                      getScoreColor(strengthScore)
                    )}
                  >
                    {strengthScore}/100
                  </span>
                </div>
                <Progress
                  value={strengthScore}
                  className="h-2"
                  indicatorClassName={cn(
                    strengthScore >= 80
                      ? "bg-emerald-500"
                      : strengthScore >= 60
                      ? "bg-amber-500"
                      : strengthScore >= 40
                      ? "bg-orange-500"
                      : "bg-red-500"
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Baseado na complexidade e comprimento das suas senhas.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Copy className="h-5 w-5 mr-2 text-blue-500" />
                    <h3 className="font-medium">Unicidade</h3>
                  </div>
                  <span
                    className={cn(
                      "font-semibold",
                      getScoreColor(uniquenessScore)
                    )}
                  >
                    {uniquenessScore}/100
                  </span>
                </div>
                <Progress
                  value={uniquenessScore}
                  className="h-2"
                  indicatorClassName={cn(
                    uniquenessScore >= 80
                      ? "bg-emerald-500"
                      : uniquenessScore >= 60
                      ? "bg-amber-500"
                      : uniquenessScore >= 40
                      ? "bg-orange-500"
                      : "bg-red-500"
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Avalia se você reutiliza senhas em diferentes contas.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                    <h3 className="font-medium">Proteção contra Vazamentos</h3>
                  </div>
                  <span
                    className={cn("font-semibold", getScoreColor(breachScore))}
                  >
                    {breachScore}/100
                  </span>
                </div>
                <Progress
                  value={breachScore}
                  className="h-2"
                  indicatorClassName={cn(
                    breachScore >= 80
                      ? "bg-emerald-500"
                      : breachScore >= 60
                      ? "bg-amber-500"
                      : breachScore >= 40
                      ? "bg-orange-500"
                      : "bg-red-500"
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Considera senhas que apareceram em vazamentos de dados
                  conhecidos.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Key className="h-5 w-5 mr-2 text-purple-500" />
                    <h3 className="font-medium">Adoção de 2FA</h3>
                  </div>
                  <span
                    className={cn("font-semibold", getScoreColor(twoFaScore))}
                  >
                    {twoFaScore}/100
                  </span>
                </div>
                <Progress
                  value={twoFaScore}
                  className="h-2"
                  indicatorClassName={cn(
                    twoFaScore >= 80
                      ? "bg-emerald-500"
                      : twoFaScore >= 60
                      ? "bg-amber-500"
                      : twoFaScore >= 40
                      ? "bg-orange-500"
                      : "bg-red-500"
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Percentual de contas com autenticação de dois fatores ativada.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldAlert className="h-5 w-5 mr-2" />
            Recomendações de Segurança
          </CardTitle>
          <CardDescription>
            Ações sugeridas para melhorar a segurança do seu cofre
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium flex items-center">
                        {rec.title}
                        <Badge
                          variant={
                            rec.priority === "Alta" ? "destructive" : "outline"
                          }
                          className="ml-2 text-xs py-0"
                        >
                          {rec.priority}
                        </Badge>
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {rec.description}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8" asChild>
                      <Link href={rec.link}>
                        {rec.linkText}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <ShieldCheck className="h-12 w-12 mx-auto text-emerald-500 mb-3" />
              <h3 className="text-lg font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                Excelente! Seu cofre está bem protegido
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Não encontramos problemas significativos. Continue mantendo suas
                senhas fortes e únicas.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" asChild>
            <Link
              href="https://bitwarden.com/blog/password-security-tips/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Dicas de segurança de senhas</span>
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas do Cofre</CardTitle>
          <CardDescription>
            Números gerais sobre seu cofre de senhas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                Total de Itens
              </p>
              <p className="text-2xl font-semibold">
                {analysisSummary.totalItems}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                Senhas Fortes
              </p>
              <p className="text-2xl font-semibold">
                {analysisSummary.totalItems -
                  analysisSummary.passwordStats.weakCount -
                  analysisSummary.passwordStats.criticalCount -
                  analysisSummary.passwordStats.emptyCount}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Comp. Médio</p>
              <p className="text-2xl font-semibold">
                {analysisSummary.passwordStats.averageLength.toFixed(1)}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Força Média</p>
              <p className="text-2xl font-semibold">
                {analysisSummary.passwordStats.averageStrengthScore.toFixed(2)}
                /4
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

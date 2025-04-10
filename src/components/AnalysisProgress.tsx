// src/components/AnalysisProgress.tsx
"use client";

import React from "react";
import { useVaultData } from "@/providers/VaultDataProvider";
import { Progress } from "@/components/ui/progress";
import { AnalysisStage } from "@/providers/VaultDataProvider";
import { cn } from "@/lib/utils";
import {
  FileText,
  BarChart3,
  ShieldAlert,
  CheckCircle2,
  Loader2,
} from "lucide-react";

// Componente para mostrar uma etapa do processo de análise
const StageIndicator = ({
  stage,
  currentStage,
  label,
  icon: Icon,
}: {
  stage: AnalysisStage;
  currentStage: AnalysisStage;
  label: string;
  icon: React.ElementType;
}) => {
  const isActive = currentStage === stage;
  const isPast = getStageOrder(currentStage) > getStageOrder(stage);

  return (
    <div
      className={cn(
        "flex items-center gap-2 transition-all duration-300",
        isActive
          ? "text-primary font-medium scale-105"
          : isPast
          ? "text-muted-foreground"
          : "text-muted-foreground opacity-50"
      )}
    >
      <div
        className={cn(
          "rounded-full p-1.5 flex items-center justify-center",
          isActive
            ? "bg-primary/10 text-primary"
            : isPast
            ? "bg-primary/5 text-muted-foreground"
            : "bg-muted"
        )}
      >
        {isActive ? (
          <div className="animate-pulse">
            <Icon className="h-4 w-4" />
          </div>
        ) : isPast ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
      </div>
      <span className={isActive ? "font-medium" : ""}>{label}</span>
    </div>
  );
};

// Função para determinar a ordem das etapas para comparação
const getStageOrder = (stage: AnalysisStage): number => {
  const order = {
    [AnalysisStage.IDLE]: 0,
    [AnalysisStage.READING]: 1,
    [AnalysisStage.INITIAL_ANALYSIS]: 2,
    [AnalysisStage.PASSWORD_LEAKS]: 3,
    [AnalysisStage.COMPLETE]: 4,
  };
  return order[stage] || 0;
};

// Labels das etapas de análise para exibição
const stageLabels: Record<string, string> = {
  [AnalysisStage.READING]: "Lendo arquivo",
  [AnalysisStage.INITIAL_ANALYSIS]: "Análise de senhas",
  [AnalysisStage.PASSWORD_LEAKS]: "Verificando vazamentos",
  [AnalysisStage.COMPLETE]: "Análise completa",
};

// Ícones das etapas
const stageIcons: Record<string, React.ElementType> = {
  [AnalysisStage.READING]: FileText,
  [AnalysisStage.INITIAL_ANALYSIS]: BarChart3,
  [AnalysisStage.PASSWORD_LEAKS]: ShieldAlert,
  [AnalysisStage.COMPLETE]: CheckCircle2,
};

const AnalysisProgress: React.FC = () => {
  const {
    analysisStage,
    progress,
    totalItems,
    processedItems,
    isLoading,
    isAnalyzing,
  } = useVaultData();

  // Não exibe o componente se não está carregando ou analisando
  if (!isLoading && !isAnalyzing) return null;

  // Não exibe se estiver em estado ocioso
  if (analysisStage === AnalysisStage.IDLE) return null;

  // Etapa para exibição
  const currentStageLabel = stageLabels[analysisStage] || "Processando";

  // Animação de pulso para o contador
  const counterAnimation = progress < 100 ? "animate-pulse" : "";

  return (
    <div className="w-full max-w-xl bg-card border rounded-lg p-4 shadow-sm">
      <div className="space-y-4">
        {/* Título com animação de loading */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium flex items-center gap-2">
            {progress < 100 && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            )}
            Análise em andamento
          </h3>
          <span
            className={cn(
              "text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded",
              counterAnimation
            )}
          >
            {processedItems} / {totalItems}
          </span>
        </div>

        {/* Barra de progresso */}
        <div className="space-y-1.5">
          <Progress
            value={progress}
            className={cn(
              "h-2",
              progress === 100 ? "bg-primary/20" : "bg-muted"
            )}
          />
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{currentStageLabel}</span>
            <span className="font-medium">{progress}%</span>
          </div>
        </div>

        {/* Indicadores de etapa */}
        <div className="flex flex-col gap-2 pt-2 text-xs">
          {Object.entries(stageLabels).map(([stage, label]) => (
            <StageIndicator
              key={stage}
              stage={stage as AnalysisStage}
              currentStage={analysisStage}
              label={label}
              icon={stageIcons[stage] || FileText}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export { AnalysisProgress };

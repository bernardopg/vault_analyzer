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
  Lock,
  Clock,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Componente para mostrar uma etapa do processo de análise
const StageIndicator = ({
  stage,
  currentStage,
  label,
  icon: Icon,
  time,
}: {
  stage: AnalysisStage;
  currentStage: AnalysisStage;
  label: string;
  icon: React.ElementType;
  time?: string; // Tempo estimado ou decorrido
}) => {
  const isActive = currentStage === stage;
  const isPast = getStageOrder(currentStage) > getStageOrder(stage);

  return (
    <div
      className={cn(
        "flex items-center gap-2 py-2 transition-all duration-300 relative",
        isActive
          ? "text-primary font-medium"
          : isPast
          ? "text-muted-foreground"
          : "text-muted-foreground opacity-50"
      )}
    >
      <div
        className={cn(
          "rounded-full w-8 h-8 flex items-center justify-center",
          isActive
            ? "bg-primary/10 text-primary ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
            : isPast
            ? "bg-primary/5 text-primary"
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

      <div className="flex-1">
        <div className="flex justify-between items-center">
          <span className={cn(isActive ? "font-medium" : "")}>{label}</span>
          {time && (
            <span className="text-[10px] text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {time}
            </span>
          )}
        </div>

        {isActive && (
          <div className="mt-1">
            <Badge variant="outline" className="text-[10px] h-4 font-normal">
              Em processamento
            </Badge>
          </div>
        )}
      </div>

      {/* Linha conectora vertical */}
      {stage !== AnalysisStage.COMPLETE && (
        <div
          className={cn(
            "absolute top-10 left-4 w-0.5 h-[calc(100%-16px)] -z-10",
            isPast ? "bg-primary/20" : "bg-muted"
          )}
        />
      )}
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

// Tempos estimados (fictícios, apenas para UI)
const stageTimes: Record<string, string> = {
  [AnalysisStage.READING]: "~2s",
  [AnalysisStage.INITIAL_ANALYSIS]: "~5s",
  [AnalysisStage.PASSWORD_LEAKS]: "~10s",
  [AnalysisStage.COMPLETE]: "Finalizado",
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

  // Determina a mensagem com base no estágio
  const getStageMessage = () => {
    switch (analysisStage) {
      case AnalysisStage.READING:
        return "Lendo dados do arquivo exportado...";
      case AnalysisStage.INITIAL_ANALYSIS:
        return "Analisando força e características das senhas...";
      case AnalysisStage.PASSWORD_LEAKS:
        return "Verificando senhas contra vazamentos de dados conhecidos...";
      case AnalysisStage.COMPLETE:
        return "Análise finalizada! Processando resultados...";
      default:
        return "Processando dados...";
    }
  };

  return (
    <div className="w-full max-w-xl bg-card border rounded-lg p-5 shadow-sm">
      <div className="space-y-4">
        {/* Cabeçalho com ícone e título */}
        <div className="flex items-center space-x-3">
          <div className="rounded-full bg-primary/10 p-2">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium">Análise em Progresso</h3>
            <p className="text-xs text-muted-foreground">{getStageMessage()}</p>
          </div>
        </div>

        <Separator />

        {/* Barra de progresso com percentual e contador */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progresso</span>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="font-mono">
                {processedItems}/{totalItems}
              </Badge>
              <Badge
                variant={progress === 100 ? "default" : "secondary"}
                className="font-mono"
              >
                {progress}%
              </Badge>
            </div>
          </div>

          <Progress
            value={progress}
            className="h-2"
            indicatorClassName={cn(
              progress === 100 ? "bg-primary" : "bg-primary animate-pulse"
            )}
          />
        </div>

        {/* Lista de etapas com timeline visual */}
        <div className="mt-4 space-y-1 pt-2 relative">
          {Object.entries(stageLabels).map(([stage, label]) => (
            <StageIndicator
              key={stage}
              stage={stage as AnalysisStage}
              currentStage={analysisStage}
              label={label}
              icon={stageIcons[stage] || FileText}
              time={stageTimes[stage]}
            />
          ))}
        </div>

        {/* Mensagem de segurança */}
        <div className="mt-4 pt-2 border-t text-xs text-muted-foreground flex items-center">
          <ShieldAlert className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
          <span>
            Todos os dados são analisados localmente no seu navegador e não são
            enviados para servidores externos.
          </span>
        </div>
      </div>
    </div>
  );
};

export { AnalysisProgress };

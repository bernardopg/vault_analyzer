"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useVaultData } from "@/providers/VaultDataProvider";
import { useChartConfig } from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Cell,
  Tooltip,
  Legend,
  Sector,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PasswordStrengthDistribution() {
  const { analysisResults, analysisSummary } = useVaultData();
  const chartConfig = useChartConfig();
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  if (!analysisResults || analysisResults.length === 0) {
    return null;
  }

  // Contagem de senhas por nível de risco
  const riskLevels = analysisResults.reduce((acc, item) => {
    const riskLevel = item.riskLevel;
    acc[riskLevel] = (acc[riskLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Transforma o objeto em array para o gráfico com ordem específica
  const riskOrder = ["Forte", "Moderada", "Fraca", "Crítica", "Vazia"];
  const data = riskOrder
    .filter((risk) => riskLevels[risk]) // Inclui apenas os níveis que existem
    .map((name) => ({
      name,
      value: riskLevels[name],
    }));

  // Define as cores para cada nível de risco
  const COLORS = {
    Forte: "#10b981", // verde
    Moderada: "#f59e0b", // amarelo
    Fraca: "#f97316", // laranja
    Crítica: "#ef4444", // vermelho
    Vazia: "#6b7280", // cinza
  };

  // Calcula a pontuação geral com base na distribuição de força
  const calculateSecurityScore = () => {
    if (!analysisSummary) return null;

    const totalItems = analysisSummary.totalItems;
    if (totalItems === 0) return null;

    // Pesos para cada categoria
    const weights = {
      Forte: 100,
      Moderada: 70,
      Fraca: 30,
      Crítica: 0,
      Vazia: 0,
    };

    // Calcula pontuação ponderada
    let weightedScore = 0;
    for (const [risk, count] of Object.entries(riskLevels)) {
      if (risk in weights) {
        weightedScore += weights[risk as keyof typeof weights] * count;
      }
    }

    // Normaliza para 0-100
    return Math.round(weightedScore / totalItems);
  };

  const securityScore = calculateSecurityScore();

  // Ajustando renderActiveShape para usar unknown e type assertion
  const renderActiveShape = (props: unknown) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
      props as {
        cx: number;
        cy: number;
        innerRadius: number;
        outerRadius: number;
        startAngle: number;
        endAngle: number;
        fill: string;
      };

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.9}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 8}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
      </g>
    );
  };

  // Função para determinar a cor de texto do score com base no valor
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  // Determina uma mensagem qualitativa do score
  const getScoreMessage = (score: number) => {
    if (score >= 80) return "Excelente";
    if (score >= 60) return "Bom";
    if (score >= 40) return "Regular";
    if (score >= 20) return "Fraco";
    return "Crítico";
  };

  return (
    <Card className="col-span-1">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">Força das Senhas</CardTitle>
            <CardDescription className="text-xs mt-1">
              Distribuição por categoria de segurança
            </CardDescription>
          </div>
          {securityScore !== null && (
            <div className="flex flex-col items-end">
              <span className="text-xs text-muted-foreground">
                Score de Segurança
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "text-xl font-bold",
                    getScoreColorClass(securityScore)
                  )}
                >
                  {securityScore}
                </span>
                <Badge
                  variant={
                    securityScore >= 60
                      ? "default"
                      : securityScore >= 40
                      ? "outline"
                      : "destructive"
                  }
                  className="text-[10px] h-4 px-1.5"
                >
                  {getScoreMessage(securityScore)}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[230px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(undefined)}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      COLORS[entry.name as keyof typeof COLORS] || "#8884d8"
                    }
                    stroke={chartConfig.borderColor}
                    strokeWidth={1}
                    className="transition-opacity duration-200"
                    style={{
                      filter: `drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.1))`,
                      opacity:
                        activeIndex === undefined || activeIndex === index
                          ? 1
                          : 0.7,
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: chartConfig.tooltipBackgroundColor,
                  borderColor: chartConfig.borderColor,
                  borderRadius: "6px",
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  padding: "8px 12px",
                }}
                formatter={(value: number, name: string) => [
                  `${value} ${value === 1 ? "senha" : "senhas"}`,
                  name,
                ]}
                labelStyle={{ fontWeight: 600, marginBottom: "4px" }}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span
                    style={{
                      color: chartConfig.textColor,
                      fontSize: "12px",
                      marginLeft: "4px",
                    }}
                  >
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

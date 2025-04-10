"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVaultData } from "@/providers/VaultDataProvider";
import { useChartConfig } from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

export function PasswordStrengthDistribution() {
  const { analysisResults } = useVaultData();
  const chartConfig = useChartConfig();

  if (!analysisResults || analysisResults.length === 0) {
    return null;
  }

  // Contagem de senhas por nível de risco
  const riskLevels = analysisResults.reduce((acc, item) => {
    const riskLevel = item.riskLevel;
    acc[riskLevel] = (acc[riskLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Transforma o objeto em array para o gráfico
  const data = Object.entries(riskLevels).map(([name, value]) => ({
    name,
    value,
  }));

  // Define as cores para cada nível de risco
  const COLORS = {
    Forte: "#10b981", // verde
    Moderada: "#f59e0b", // amarelo
    Fraca: "#f97316", // laranja
    Crítica: "#ef4444", // vermelho
    Vazia: "#6b7280", // cinza
  };

  return (
    <Card className="col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Distribuição por Força</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      COLORS[entry.name as keyof typeof COLORS] || "#8884d8"
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: chartConfig.tooltipBackgroundColor,
                  borderColor: chartConfig.borderColor,
                }}
                formatter={(value: number, name: string) => [
                  `${value} senhas`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

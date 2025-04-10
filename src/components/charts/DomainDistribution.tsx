"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVaultData } from "@/providers/VaultDataProvider";
import { useChartConfig } from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function DomainDistribution() {
  const { analysisResults } = useVaultData();
  const chartConfig = useChartConfig();

  const domainData = useMemo(() => {
    if (!analysisResults || analysisResults.length === 0) {
      return [];
    }

    // Conta quantas senhas existem para cada domínio
    const domainCounts = analysisResults.reduce((acc, item) => {
      if (item.baseDomain && item.baseDomain !== "unknown") {
        acc[item.baseDomain] = (acc[item.baseDomain] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Converte para array e ordena por contagem, limitando aos 10 principais
    return Object.entries(domainCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [analysisResults]);

  if (
    !analysisResults ||
    analysisResults.length === 0 ||
    domainData.length === 0
  ) {
    return null;
  }

  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Top 10 Domínios</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={domainData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <XAxis type="number" />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: chartConfig.textColor, fontSize: 12 }}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartConfig.tooltipBackgroundColor,
                  borderColor: chartConfig.borderColor,
                }}
                formatter={(value: number) => [`${value} contas`, "Quantidade"]}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

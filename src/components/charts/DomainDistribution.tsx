"use client";

import React, { useMemo, useState } from "react";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ExternalLink, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function DomainDistribution() {
  const { analysisResults } = useVaultData();
  const chartConfig = useChartConfig();
  const [showAllDomains, setShowAllDomains] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const allDomainData = useMemo(() => {
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

    // Converte para array e ordena por contagem
    return Object.entries(domainCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [analysisResults]);

  const domainData = useMemo(() => {
    // Filtra com base na pesquisa quando o diálogo estiver aberto
    if (isDialogOpen && searchTerm) {
      return allDomainData.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // No componente principal, mostra os top 10 ou todos
    return showAllDomains ? allDomainData : allDomainData.slice(0, 10);
  }, [allDomainData, showAllDomains, searchTerm, isDialogOpen]);

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
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-base">
              Distribuição por Domínios
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {showAllDomains
                ? "Mostrando todos os domínios"
                : "Top 10 domínios mais usados"}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 gap-1">
                  <Filter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:inline-block">
                    Filtrar
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Filtrar Domínios</DialogTitle>
                  <DialogDescription>
                    Pesquise e visualize domínios específicos do seu cofre.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="domain-search">Pesquisar domínio</Label>
                    <Input
                      id="domain-search"
                      placeholder="Ex: google.com"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <ScrollArea className="h-[200px] rounded-md border p-2">
                    <div className="space-y-2">
                      {domainData.map((domain) => (
                        <div
                          key={domain.name}
                          className="flex justify-between items-center p-2 hover:bg-muted rounded"
                        >
                          <span className="font-medium">{domain.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {domain.count}{" "}
                            {domain.count === 1 ? "conta" : "contas"}
                          </span>
                        </div>
                      ))}
                      {domainData.length === 0 && searchTerm && (
                        <div className="py-4 text-center text-muted-foreground">
                          Nenhum domínio encontrado
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => setShowAllDomains(!showAllDomains)}
            >
              <span className="text-xs">
                {showAllDomains ? "Top 10" : "Ver todos"}
              </span>
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "transition-all duration-300",
            showAllDomains ? "h-[400px]" : "h-[250px]"
          )}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={domainData}
              layout="vertical"
              margin={{ top: 5, right: 10, left: 80, bottom: 5 }}
            >
              <XAxis
                type="number"
                tick={{ fill: chartConfig.textColor }}
                axisLine={{ stroke: chartConfig.borderColor }}
                tickLine={{ stroke: chartConfig.borderColor }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: chartConfig.textColor, fontSize: 12 }}
                width={80}
                axisLine={{ stroke: chartConfig.borderColor }}
                tickLine={{ stroke: chartConfig.borderColor }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartConfig.tooltipBackgroundColor,
                  borderColor: chartConfig.borderColor,
                  borderRadius: "6px",
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                }}
                formatter={(value: number) => [
                  `${value} ${value === 1 ? "conta" : "contas"}`,
                  "Quantidade",
                ]}
                labelStyle={{ fontWeight: 600 }}
                cursor={{ fill: chartConfig.backgroundColor }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

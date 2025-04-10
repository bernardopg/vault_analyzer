"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useVaultData } from "@/providers/VaultDataProvider";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { DownloadIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function ExportOptions() {
  const { analysisResults, fileName } = useVaultData();
  const [isExporting, setIsExporting] = useState(false);

  // Função para exportar para PDF
  const exportToPDF = async () => {
    if (!analysisResults || analysisResults.length === 0) {
      toast.error("Sem dados para exportar");
      return;
    }

    setIsExporting(true);
    try {
      // Cria um novo documento PDF
      const doc = new jsPDF();

      // Adiciona título
      doc.setFontSize(18);
      doc.text("Relatório de Segurança do Cofre Bitwarden", 14, 20);

      // Adiciona data de geração
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 28);

      // Adiciona informações gerais
      doc.setFontSize(12);
      doc.text(`Arquivo analisado: ${fileName || "Desconhecido"}`, 14, 38);
      doc.text(`Total de itens: ${analysisResults.length}`, 14, 46);

      // Cria tabela com classificação de segurança das senhas
      const securityTable = [
        // Cabeçalho
        ["Classificação", "Quantidade", "% do Total"],
      ];

      // Conta a ocorrência de cada nível de risco
      const riskCounts = analysisResults.reduce((acc, item) => {
        acc[item.riskLevel] = (acc[item.riskLevel] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Adiciona linhas para cada nível de risco
      const riskLevels = ["Forte", "Moderada", "Fraca", "Crítica", "Vazia"];
      riskLevels.forEach((risk) => {
        const count = riskCounts[risk] || 0;
        const percent = ((count / analysisResults.length) * 100).toFixed(1);
        securityTable.push([risk, count.toString(), `${percent}%`]);
      });

      // Adiciona tabela ao PDF
      autoTable(doc, {
        head: [securityTable[0]],
        body: securityTable.slice(1),
        startY: 55,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [66, 139, 202] },
      });

      // Adiciona estatísticas de vazamentos
      const leakedCount = analysisResults.filter(
        (item) => item.isLeaked
      ).length;
      const duplicateCount = analysisResults.filter(
        (item) => item.isDuplicate
      ).length;

      const currentY = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(14);
      doc.text("Estatísticas Adicionais", 14, currentY);

      doc.setFontSize(10);
      doc.text(
        `Senhas vazadas: ${leakedCount} (${(
          (leakedCount / analysisResults.length) *
          100
        ).toFixed(1)}%)`,
        14,
        currentY + 10
      );
      doc.text(
        `Senhas duplicadas: ${duplicateCount} (${(
          (duplicateCount / analysisResults.length) *
          100
        ).toFixed(1)}%)`,
        14,
        currentY + 18
      );

      // Lista senhas críticas (não incluindo a senha em si, apenas o site/serviço)
      const criticalItems = analysisResults
        .filter((item) => item.riskLevel === "Crítica" || item.isLeaked)
        .map((item) => ({
          name: item.name,
          domain: item.baseDomain,
          isLeaked: item.isLeaked,
          isDuplicate: item.isDuplicate,
          riskLevel: item.riskLevel,
        }));

      if (criticalItems.length > 0) {
        doc.setFontSize(14);
        doc.text("Contas com Risco Crítico", 14, currentY + 30);

        // Tabela de itens críticos
        autoTable(doc, {
          head: [["Site/Serviço", "Domínio", "Risco", "Vazada", "Duplicada"]],
          body: criticalItems.map((item) => [
            item.name,
            item.domain || "N/A",
            item.riskLevel,
            item.isLeaked ? "Sim" : "Não",
            item.isDuplicate ? "Sim" : "Não",
          ]),
          startY: currentY + 35,
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [239, 68, 68] },
        });
      }

      // Adiciona rodapé com informações
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          "Vault Analyzer - Relatório gerado para uso pessoal",
          14,
          doc.internal.pageSize.height - 10
        );
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.width - 30,
          doc.internal.pageSize.height - 10
        );
      }

      // Salva o PDF
      doc.save(
        `relatorio-seguranca-${new Date().toISOString().slice(0, 10)}.pdf`
      );

      toast.success("PDF exportado com sucesso");
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao exportar PDF", {
        description: "Ocorreu um erro ao gerar o arquivo.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Função para exportar para Excel
  const exportToExcel = async () => {
    if (!analysisResults || analysisResults.length === 0) {
      toast.error("Sem dados para exportar");
      return;
    }

    setIsExporting(true);
    try {
      // Formata os dados para o Excel
      const excelData = analysisResults.map((item) => ({
        Nome: item.name,
        Usuario: item.login?.username || "",
        Domínio: item.baseDomain || "N/A",
        "Nível de Risco": item.riskLevel,
        "Força da Senha": item.passwordStrength?.score || 0,
        Comprimento: item.passwordLength,
        Vazada: item.isLeaked ? "Sim" : "Não",
        Duplicada: item.isDuplicate ? "Sim" : "Não",
        "Tem 2FA": item.hasTotp ? "Sim" : "Não",
        Sugestões: item.passwordStrength?.suggestions?.join("; ") || "",
        "Tempo de Quebra": item.passwordStrength?.crackTimeDisplay || "N/A",
        "Data de Modificação": new Date(item.revisionDate).toLocaleDateString(
          "pt-BR"
        ),
      }));

      // Cria uma worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Cria um workbook e adiciona a worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Análise de Segurança");

      // Exporta o workbook para um arquivo e faz o download
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const data = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Salva o arquivo
      saveAs(
        data,
        `analise-senhas-${new Date().toISOString().slice(0, 10)}.xlsx`
      );

      toast.success("Excel exportado com sucesso");
    } catch (error) {
      console.error("Erro ao exportar Excel:", error);
      toast.error("Erro ao exportar Excel", {
        description: "Ocorreu um erro ao gerar o arquivo.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Função para exportar dados para CSV
  const exportToCSV = async () => {
    if (!analysisResults || analysisResults.length === 0) {
      toast.error("Sem dados para exportar");
      return;
    }

    setIsExporting(true);
    try {
      // Formata os dados para CSV (mesmo formato do Excel)
      const csvData = analysisResults.map((item) => ({
        Nome: item.name,
        Usuario: item.login?.username || "",
        Domínio: item.baseDomain || "N/A",
        "Nível de Risco": item.riskLevel,
        "Força da Senha": item.passwordStrength?.score || 0,
        Comprimento: item.passwordLength,
        Vazada: item.isLeaked ? "Sim" : "Não",
        Duplicada: item.isDuplicate ? "Sim" : "Não",
        "Tem 2FA": item.hasTotp ? "Sim" : "Não",
      }));

      // Cria uma worksheet
      const worksheet = XLSX.utils.json_to_sheet(csvData);

      // Converte para CSV
      const csv = XLSX.utils.sheet_to_csv(worksheet);

      // Cria um blob e faz o download
      const data = new Blob([csv], { type: "text/csv;charset=utf-8" });
      saveAs(
        data,
        `analise-senhas-${new Date().toISOString().slice(0, 10)}.csv`
      );

      toast.success("CSV exportado com sucesso");
    } catch (error) {
      console.error("Erro ao exportar CSV:", error);
      toast.error("Erro ao exportar CSV", {
        description: "Ocorreu um erro ao gerar o arquivo.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (!analysisResults || analysisResults.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          <DownloadIcon className="mr-2 h-4 w-4" />
          {isExporting ? "Exportando..." : "Exportar"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Formato de Exportação</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportToPDF}>Relatório PDF</DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          Planilha Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV}>CSV</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

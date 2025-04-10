import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PasswordStrengthDistribution } from "@/components/charts/PasswordStrengthDistribution";
import { useVaultData } from "@/providers/VaultDataProvider";
import { AnalyzedItem } from "@/lib/types";

// Mock do provider
jest.mock("@/providers/VaultDataProvider", () => ({
  useVaultData: jest.fn(),
}));

// Mock do componente recharts
jest.mock("recharts", () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({
    data,
    children,
  }: {
    data: Array<{ name: string; value: number }>;
    children: React.ReactNode;
  }) => (
    <div data-testid="pie">
      {data.map((item, index: number) => (
        <div key={index} data-testid={`pie-segment-${item.name}`}>
          {item.name}: {item.value}
        </div>
      ))}
      {children}
    </div>
  ),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Cell: () => <div data-testid="pie-cell"></div>,
  Tooltip: () => <div data-testid="tooltip"></div>,
  Legend: () => <div data-testid="legend"></div>,
}));

// Mock do componente ui/chart
jest.mock("@/components/ui/chart", () => ({
  useChartConfig: jest.fn().mockReturnValue({
    tooltipBackgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
  }),
}));

describe("PasswordStrengthDistribution", () => {
  test("não deve renderizar nada quando não há dados de análise", () => {
    (useVaultData as jest.Mock).mockReturnValue({
      analysisResults: null,
    });

    const { container } = render(<PasswordStrengthDistribution />);
    expect(container).toBeEmptyDOMElement();
  });

  test("não deve renderizar nada quando a análise está vazia", () => {
    (useVaultData as jest.Mock).mockReturnValue({
      analysisResults: [],
    });

    const { container } = render(<PasswordStrengthDistribution />);
    expect(container).toBeEmptyDOMElement();
  });

  test("deve renderizar o gráfico com dados de distribuição de força de senha", () => {
    // Mock dos dados de análise com diferentes níveis de força
    const mockAnalysisResults: AnalyzedItem[] = [
      {
        id: "1",
        type: 1,
        name: "Item 1",
        riskLevel: "Forte",
        creationDate: "",
        revisionDate: "",
        favorite: false,
      } as AnalyzedItem,
      {
        id: "2",
        type: 1,
        name: "Item 2",
        riskLevel: "Forte",
        creationDate: "",
        revisionDate: "",
        favorite: false,
      } as AnalyzedItem,
      {
        id: "3",
        type: 1,
        name: "Item 3",
        riskLevel: "Moderada",
        creationDate: "",
        revisionDate: "",
        favorite: false,
      } as AnalyzedItem,
      {
        id: "4",
        type: 1,
        name: "Item 4",
        riskLevel: "Fraca",
        creationDate: "",
        revisionDate: "",
        favorite: false,
      } as AnalyzedItem,
      {
        id: "5",
        type: 1,
        name: "Item 5",
        riskLevel: "Crítica",
        creationDate: "",
        revisionDate: "",
        favorite: false,
      } as AnalyzedItem,
      {
        id: "6",
        type: 1,
        name: "Item 6",
        riskLevel: "Vazia",
        creationDate: "",
        revisionDate: "",
        favorite: false,
      } as AnalyzedItem,
    ];

    (useVaultData as jest.Mock).mockReturnValue({
      analysisResults: mockAnalysisResults,
    });

    render(<PasswordStrengthDistribution />);

    // Verifica título
    expect(screen.getByText("Distribuição por Força")).toBeInTheDocument();

    // Verifica segmentos de gráfico com os níveis de risco
    expect(screen.getByTestId("pie-segment-Forte")).toHaveTextContent(
      "Forte: 2"
    );
    expect(screen.getByTestId("pie-segment-Moderada")).toHaveTextContent(
      "Moderada: 1"
    );
    expect(screen.getByTestId("pie-segment-Fraca")).toHaveTextContent(
      "Fraca: 1"
    );
    expect(screen.getByTestId("pie-segment-Crítica")).toHaveTextContent(
      "Crítica: 1"
    );
    expect(screen.getByTestId("pie-segment-Vazia")).toHaveTextContent(
      "Vazia: 1"
    );

    // Verifica a presença do container e tooltip
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
  });
});

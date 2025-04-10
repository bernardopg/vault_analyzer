"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVaultData } from "@/providers/VaultDataProvider";
import dynamic from "next/dynamic";

// Importando o componente ReactWordcloud de forma dinâmica (client-side only)
const ReactWordcloud = dynamic(() => import("react-wordcloud"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
      Carregando nuvem de palavras...
    </div>
  ),
});

export function PasswordWordCloud() {
  const { analysisResults } = useVaultData();
  const [isClient, setIsClient] = useState(false);

  // Verificar se estamos no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  const words = useMemo(() => {
    if (
      !analysisResults ||
      !Array.isArray(analysisResults) ||
      analysisResults.length === 0
    ) {
      return [];
    }

    // Extrai palavras das senhas (removendo números e caracteres especiais)
    const passwordTexts = analysisResults
      .filter(
        (item) =>
          item?.login?.password &&
          typeof item.login.password === "string" &&
          item.login.password.length > 3
      )
      .map((item) => item.login?.password || "");

    // Se não houver senhas para analisar, retorna array vazio
    if (passwordTexts.length === 0) {
      return [];
    }

    // Função para extrair palavras de senhas
    const extractWords = (password: string) => {
      // Remove caracteres especiais e números, deixando apenas letras
      return password
        .replace(/[^a-zA-Z]/g, " ")
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 3);
    };

    const wordCounts: Record<string, number> = {};

    // Conta frequência de cada palavra
    passwordTexts.forEach((password) => {
      const words = extractWords(password);
      words.forEach((word) => {
        if (word) {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
      });
    });

    // Verifica se há palavras para mostrar
    if (Object.keys(wordCounts).length === 0) {
      return [];
    }

    // Converte para o formato esperado pelo componente de nuvem de palavras
    return Object.entries(wordCounts)
      .filter(([word, count]) => word && count > 1) // Filtra palavras vazias e que aparecem mais de uma vez
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 50); // Limita a 50 palavras
  }, [analysisResults]);

  // Palavras de exemplo que serão usadas quando não houver dados suficientes
  const defaultWords = [
    { text: "exemplo", value: 10 },
    { text: "palavra", value: 8 },
    { text: "segurança", value: 7 },
    { text: "senha", value: 6 },
    { text: "análise", value: 5 },
  ];

  // Se não houver dados suficientes, mostra mensagem
  if (!words || words.length < 3) {
    return (
      <Card className="col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Palavras Comuns em Senhas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[250px] flex items-center justify-center text-muted-foreground">
            Não há palavras suficientes para análise
          </div>
        </CardContent>
      </Card>
    );
  }

  // Opções para a nuvem de palavras
  const options = {
    fontSizes: [15, 60] as [number, number],
    rotations: 3,
    rotationAngles: [0, 0] as [number, number],
    fontFamily: "Inter, system-ui, sans-serif",
    colors: ["#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#ec4899", "#8b5cf6"],
    padding: 3,
    enableTooltip: true,
    deterministic: true,
  };

  // Verificação de segurança adicional - garantindo que temos um array não vazio
  const safeWords = words.length >= 3 ? words : defaultWords;

  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Palavras Comuns em Senhas</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: "250px" }}>
          {isClient &&
          safeWords &&
          Array.isArray(safeWords) &&
          safeWords.length > 0 ? (
            <React.Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Carregando nuvem de palavras...
                </div>
              }
            >
              <ErrorBoundary
                fallback={
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    Não foi possível renderizar a nuvem de palavras
                  </div>
                }
              >
                <ReactWordcloud
                  words={safeWords}
                  options={options}
                  callbacks={{
                    getWordTooltip: (word) =>
                      `${word.text}: ${word.value} ocorrências`,
                  }}
                />
              </ErrorBoundary>
            </React.Suspense>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Carregando nuvem de palavras...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente ErrorBoundary para capturar erros de renderização
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Erro na nuvem de palavras:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

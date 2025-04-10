"use client";

import React, { useState, useEffect, useMemo } from "react"; // Adicionado useMemo
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVaultData } from "@/providers/VaultDataProvider";
import dynamic from "next/dynamic";

// Importando o componente ReactWordcloud de forma dinâmica (client-side only)
// Componente de fallback quando o módulo não pode ser carregado
const WordcloudFallback = () => (
  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
    Não foi possível carregar o componente de nuvem de palavras
  </div>
);

const ReactWordcloud = dynamic(
  () =>
    import("react-wordcloud").catch((error) => {
      console.error("Erro ao carregar o módulo react-wordcloud:", error);
      // Definindo um nome para o componente de fallback
      const FallbackComponent = () => <WordcloudFallback />;
      FallbackComponent.displayName = "WordcloudErrorFallback";
      return FallbackComponent;
    }),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        Carregando nuvem de palavras...
      </div>
    ),
  }
);

export function PasswordWordCloud() {
  const { analysisResults } = useVaultData();
  const [isClient] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [wordcloudReady, setWordcloudReady] = useState(false);
  const [processedWords, setProcessedWords] = useState<
    Array<{ text: string; value: number }>
  >([]);

  // Verificar se estamos no cliente
  useEffect(() => {
    //setIsClient(true);

    // Verificar se a biblioteca react-wordcloud está disponível
    import("react-wordcloud")
      .then(() => {
        setWordcloudReady(true);
      })
      .catch((error) => {
        console.error("Erro ao carregar react-wordcloud:", error);
        setLoadError(error);
      });
  }, []);

  // Movido para useMemo para otimizar dependências do useEffect
  const safeAnalysisResults = useMemo(() => {
    return Array.isArray(analysisResults) ? analysisResults : [];
  }, [analysisResults]);

  // Processa as palavras em um useEffect separado para evitar problemas de sincronização
  useEffect(() => {
    // try {
    //   if (!safeAnalysisResults || safeAnalysisResults.length === 0) {
    //     setProcessedWords([]);
    //     return;
    //   }

    //   // Extrai palavras das senhas (removendo números e caracteres especiais)
    //   const passwordTexts = safeAnalysisResults
    //     .filter(
    //       (item) =>
    //         item?.login?.password &&
    //         typeof item.login.password === "string" &&
    //         item.login.password.length > 3
    //     )
    //     .map((item) => item.login?.password || "");

    //   // Se não houver senhas para analisar, retorna array vazio
    //   if (passwordTexts.length === 0) {
    //     setProcessedWords([]);
    //     return;
    //   }

    //   // Função para extrair palavras de senhas
    //   const extractWords = (password: string) => {
    //     // Remove caracteres especiais e números, deixando apenas letras
    //     return password
    //       .replace(/[^a-zA-Z]/g, " ")
    //       .toLowerCase()
    //       .split(/\s+/)
    //       .filter((word) => word.length > 3);
    //   };

    //   const wordCounts: Record<string, number> = {};

    //   // Conta frequência de cada palavra
    //   passwordTexts.forEach((password) => {
    //     if (typeof password === "string") {
    //       const words = extractWords(password);
    //       words.forEach((word) => {
    //         if (word) {
    //           wordCounts[word] = (wordCounts[word] || 0) + 1;
    //         }
    //       });
    //     }
    //   });

    //   // Verifica se há palavras para mostrar
    //   if (Object.keys(wordCounts).length === 0) {
    //     setProcessedWords([]);
    //     return;
    //   }

    //   // Converte para o formato esperado pelo componente de nuvem de palavras
    //   const result = Object.entries(wordCounts)
    //     .filter(([word, count]) => word && count > 1) // Filtra palavras vazias e que aparecem mais de uma vez
    //     .map(([text, value]) => ({ text, value }))
    //     .sort((a, b) => b.value - a.value)
    //     .slice(0, 50); // Limita a 50 palavras

    //   setProcessedWords(result);
    // } catch (error) {
    //   console.error("Erro ao processar palavras para a nuvem:", error);
    //   setProcessedWords([]);
    // }
    setProcessedWords([
      { text: "test", value: 10 },
      { text: "example", value: 5 },
    ]);
  }, [safeAnalysisResults]);

  // Adicionando logs para inspecionar os dados recebidos
  console.log("Dados recebidos pelo PasswordWordCloud:", processedWords);

  // Reforçando validações ao acessar propriedades de objetos
  const safeWords =
    Array.isArray(processedWords) && processedWords.length > 0
      ? processedWords.filter(
          (word) =>
            word &&
            typeof word.text === "string" &&
            typeof word.value === "number"
        )
      : [];

  // Adicionando logs detalhados para inspecionar o processamento de palavras
  console.log("Iniciando processamento de palavras para a nuvem de palavras.");

  // Reforçando validações ao processar palavras
  const safeProcessedWords =
    Array.isArray(processedWords) && processedWords.length > 0
      ? processedWords.filter(
          (word) =>
            word &&
            typeof word.text === "string" &&
            typeof word.value === "number"
        )
      : [];

  if (safeProcessedWords.length === 0) {
    console.warn("Nenhuma palavra válida encontrada após o processamento.");
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

  console.log("Palavras processadas com sucesso:", safeProcessedWords);

  if (safeWords.length === 0) {
    console.warn("Nenhuma palavra válida encontrada para a nuvem de palavras.");
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

  const isValidWordsArray =
    Array.isArray(safeWords) &&
    safeWords.every(
      (word) =>
        word && typeof word.text === "string" && typeof word.value === "number"
    );

  if (!isValidWordsArray) {
    console.error("Dados inválidos para a nuvem de palavras:", safeWords);
    return (
      <Card className="col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Palavras Comuns em Senhas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[250px] flex items-center justify-center text-muted-foreground">
            Não há palavras suficientes ou os dados estão inválidos para análise
          </div>
        </CardContent>
      </Card>
    );
  }

  // Validando os dados antes de renderizar o ReactWordcloud
  if (!Array.isArray(safeWords) || safeWords.length === 0) {
    console.warn(
      "Nenhuma palavra válida encontrada para renderizar a nuvem de palavras."
    );
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

  // Protegendo contra acessos a índices indefinidos
  const isValidWord = (
    word: { text: string; value: number } | undefined | null
  ): word is { text: string; value: number } =>
    !!word && typeof word.text === "string" && typeof word.value === "number";
  const validatedWords = safeWords.filter(isValidWord);

  if (validatedWords.length === 0) {
    console.error(
      "Os dados validados para a nuvem de palavras estão vazios ou inválidos:",
      safeWords
    );
    return (
      <Card className="col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Palavras Comuns em Senhas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[250px] flex items-center justify-center text-muted-foreground">
            Não há palavras suficientes ou os dados estão inválidos para análise
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log(
    "Dados validados para renderização da nuvem de palavras:",
    validatedWords
  );

  // Opções para a nuvem de palavras (ainda mais simplificadas)
  const options = {
    // fontSizes: [15, 60] as [number, number], // Removido
    // enableTooltip: true, // Removido
    deterministic: true,
  };

  // Log antes de renderizar
  console.log("Renderizando ReactWordcloud com:", { validatedWords, options });

  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Palavras Comuns em Senhas</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: "250px" }}>
          {isClient && wordcloudReady && validatedWords.length > 0 ? (
            <ReactWordcloud
              words={validatedWords}
              options={options}
              callbacks={{
                getWordTooltip: (word) =>
                  word && typeof word === "object" && word.text
                    ? `${word.text}: ${word.value} ocorrências`
                    : "",
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              {loadError
                ? "Erro ao carregar componente"
                : !wordcloudReady
                ? "Carregando nuvem de palavras..."
                : "Não há palavras suficientes para análise"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

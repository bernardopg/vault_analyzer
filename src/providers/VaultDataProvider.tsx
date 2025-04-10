// src/providers/VaultDataProvider.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import {
  BitwardenData,
  VaultContextType,
  AnalyzedItem,
  VaultAnalysisSummary,
} from "@/lib/types";
import {
  analyzeVaultDataSync,
  createEmptySummary,
  analyzePasswordLeaks,
} from "@/lib/analysis";
import { toast } from "sonner"; // Import toast from sonner

// Create the context with a default value
const VaultDataContext = createContext<VaultContextType | undefined>(undefined);

interface VaultDataProviderProps {
  children: ReactNode;
}

// Etapas da análise
export enum AnalysisStage {
  IDLE = "idle",
  READING = "reading",
  INITIAL_ANALYSIS = "initial_analysis",
  PASSWORD_LEAKS = "password_leaks",
  COMPLETE = "complete",
}

export const VaultDataProvider: React.FC<VaultDataProviderProps> = ({
  children,
}) => {
  const [vaultData, setVaultData] = useState<BitwardenData | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalyzedItem[] | null>(
    null
  );
  const [analysisSummary, setAnalysisSummary] =
    useState<VaultAnalysisSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // True during file load AND initial sync analysis
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false); // Specifically for async analysis steps (like HIBP)
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // Estados para acompanhar o progresso da análise
  const [analysisStage, setAnalysisStage] = useState<AnalysisStage>(
    AnalysisStage.IDLE
  );
  const [progress, setProgress] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [processedItems, setProcessedItems] = useState<number>(0);

  // Effect to run analysis whenever vaultData changes
  useEffect(() => {
    if (vaultData) {
      console.log("Vault data detected, starting synchronous analysis...");
      setIsLoading(true); // Indicate loading state includes initial analysis
      setIsAnalyzing(false); // Reset async analyzing flag
      setAnalysisResults(null); // Clear previous results
      setAnalysisSummary(null);
      setError(null); // Clear previous errors

      // Configura os estados iniciais para o progresso
      setAnalysisStage(AnalysisStage.READING);
      setProgress(0);
      setTotalItems(vaultData.items.length);
      setProcessedItems(0);

      // Use setTimeout to allow the UI to update showing "Analyzing..." state
      const analysisTimeout = setTimeout(() => {
        try {
          // Atualiza para o estágio de análise inicial
          setAnalysisStage(AnalysisStage.INITIAL_ANALYSIS);

          // Simulação de progresso durante a análise síncrona
          const progressInterval = setInterval(() => {
            setProcessedItems((prev) => {
              if (prev < vaultData.items.length) {
                const newValue = Math.min(
                  prev + Math.ceil(vaultData.items.length * 0.05),
                  vaultData.items.length
                );
                setProgress(
                  Math.floor((newValue / vaultData.items.length) * 100)
                );
                return newValue;
              }
              return prev;
            });
          }, 100);

          const { results, summary } = analyzeVaultDataSync(vaultData);

          // Limpa o intervalo após a análise síncrona
          clearInterval(progressInterval);

          // Garante que os valores estejam completos ao finalizar a etapa síncrona
          setProcessedItems(vaultData.items.length);
          setProgress(100);

          setAnalysisResults(results);
          setAnalysisSummary(summary);
          console.log("Synchronous analysis complete:", {
            itemCount: results.length,
            summary,
          });

          // Execute asynchronous analysis for leaked passwords
          setIsAnalyzing(true); // Set true before async step
          setAnalysisStage(AnalysisStage.PASSWORD_LEAKS);
          setProgress(0); // Reset progress for new stage

          // Reseta e começa a contagem de itens processados para a etapa de verificação de vazamentos
          setProcessedItems(0);

          // Simulação de progresso durante a análise de vazamentos
          const leakProgressInterval = setInterval(() => {
            setProcessedItems((prev) => {
              if (prev < results.length) {
                const newValue = Math.min(
                  prev + Math.ceil(results.length * 0.02),
                  results.length
                );
                setProgress(Math.floor((newValue / results.length) * 100));
                return newValue;
              }
              return prev;
            });
          }, 200);

          analyzePasswordLeaks(results)
            .then(({ updatedItems, leakedCount }) => {
              // Clear the progress interval
              clearInterval(leakProgressInterval);

              // Guarantee that progress reaches 100%
              setProcessedItems(results.length);
              setProgress(100);

              // Update results with leaked password information
              setAnalysisResults(updatedItems);

              // Update summary with leaked count
              const updatedSummary = {
                ...summary,
                passwordStats: {
                  ...summary.passwordStats,
                  leakedCount,
                },
              };
              setAnalysisSummary(updatedSummary);

              // Show success message
              toast.success("Verificação de vazamentos concluída", {
                description: `${leakedCount} senhas encontradas em vazamentos de dados.`,
              });

              console.log("Leak analysis complete:", { leakedCount });

              // Mark analysis as complete
              setAnalysisStage(AnalysisStage.COMPLETE);
            })
            .catch((err) => {
              // Clear the progress interval
              clearInterval(leakProgressInterval);

              console.error("HIBP analysis failed:", err);
              toast.error("Falha na verificação de vazamentos", {
                description:
                  "Não foi possível verificar vazamentos de senhas. Tente novamente mais tarde.",
              });

              // Still mark as complete even with error
              setAnalysisStage(AnalysisStage.COMPLETE);
            })
            .finally(() => {
              setIsAnalyzing(false);
              setIsLoading(false); // Finaliza o carregamento após todos os passos
            });

          // Exibe mensagem de sucesso para análise inicial síncrona
          toast.success("Análise Inicial Concluída", {
            description: `Analisados ${results.length} itens. Verificando vazamentos de senhas...`,
          });
        } catch (e: unknown) {
          console.error("Error during synchronous analysis:", e);
          const errorMessage = e instanceof Error ? e.message : String(e);
          setError(`Erro durante a análise: ${errorMessage}`);
          setAnalysisResults(null);
          setAnalysisSummary(null);
          setIsAnalyzing(false);
          setIsLoading(false); // Stop loading on error
          setAnalysisStage(AnalysisStage.IDLE); // Reset to idle state on error
          toast.error("Erro durante a análise", {
            description: errorMessage,
          });
        }
      }, 50); // Small delay for UI update

      // Cleanup timeout if vaultData changes again before it runs
      return () => clearTimeout(analysisTimeout);
    } else {
      // Clear results if vaultData becomes null
      setAnalysisResults(null);
      setAnalysisSummary(createEmptySummary()); // Reset summary too
      setAnalysisStage(AnalysisStage.IDLE); // Reset to idle
      setProgress(0);
      setTotalItems(0);
      setProcessedItems(0);
    }
    // No dependencies array needed here as we only want this triggered by vaultData changing
  }, [vaultData]);

  const clearVaultData = useCallback(() => {
    setVaultData(null);
    setAnalysisResults(null);
    setAnalysisSummary(createEmptySummary()); // Ensure summary is reset
    setError(null);
    setIsLoading(false);
    setIsAnalyzing(false);
    setFileName(null);
    setAnalysisStage(AnalysisStage.IDLE);
    setProgress(0);
    setTotalItems(0);
    setProcessedItems(0);
    console.log("Vault data and analysis cleared.");
    toast.info("Dados Removidos", {
      description: "Os dados do cofre e a análise foram limpos.",
    });
  }, []); // No dependencies needed for clear

  const loadVaultFile = useCallback(
    async (file: File) => {
      // Reset states immediately before loading new file
      clearVaultData();
      setIsLoading(true); // Set loading true right away

      if (!file) {
        setError("Nenhum arquivo selecionado.");
        setIsLoading(false); // Stop loading if no file
        return;
      }
      if (!file.name.toLowerCase().endsWith(".json")) {
        setError(
          "Formato de arquivo inválido. Por favor, selecione um arquivo .json."
        );
        setIsLoading(false); // Stop loading on invalid format
        return;
      }

      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          if (!content) {
            throw new Error("Conteúdo do arquivo vazio.");
          }

          // Tenta reparar JSON malformado antes de analisar
          let contentToProcess = content;

          // Se o JSON terminar com "{..." (formato truncado), tenta reparar
          if (content.trim().endsWith("{...}")) {
            console.warn("Detectado JSON truncado, tentando reparar");
            // Remove o objeto incompleto final e fecha o array
            const fixedContent = content.replace(/,\s*\{\.{3}\}\s*\]?$/, "]");
            contentToProcess = fixedContent;
          }

          try {
            const parsedData = JSON.parse(contentToProcess) as BitwardenData;

            // Basic validation
            if (typeof parsedData !== "object" || parsedData === null) {
              throw new Error("Arquivo JSON inválido: não é um objeto.");
            }

            if (!Array.isArray(parsedData.items)) {
              throw new Error(
                "Arquivo JSON inválido: propriedade 'items' não é um array."
              );
            }

            if (!Array.isArray(parsedData.folders)) {
              // Se não houver pastas, cria um array vazio em vez de falhar
              console.warn(
                "Propriedade 'folders' ausente ou inválida, usando array vazio"
              );
              parsedData.folders = [];
            }

            // Verifica se há itens inválidos ou incompletos
            const totalItems = parsedData.items.length;
            const validItems = parsedData.items.filter(
              (item) =>
                item &&
                typeof item === "object" &&
                item.id &&
                item.name !== undefined
            );

            if (validItems.length === 0) {
              throw new Error(
                "Arquivo JSON inválido: não contém itens válidos."
              );
            }

            // Se o arquivo tiver itens inválidos, mas também itens válidos, continuamos com os válidos
            if (validItems.length < totalItems) {
              console.warn(
                `Encontrados ${
                  totalItems - validItems.length
                } itens inválidos que serão ignorados`
              );
              toast.warning("Arquivo parcialmente corrompido", {
                description: `${
                  totalItems - validItems.length
                } itens inválidos serão ignorados durante a análise.`,
              });
              // Substitui o array de itens apenas pelos válidos
              parsedData.items = validItems;
            }

            // Set raw data - the useEffect above will trigger the analysis process
            setError(null); // Clear previous error on successful parse attempt
            setFileName(file.name);
            setVaultData(parsedData); // This triggers the useEffect for analysis
            // Do not set isLoading false here, analysis is now pending
          } catch (parseError) {
            throw new Error(
              `Erro ao analisar JSON: ${
                parseError instanceof Error
                  ? parseError.message
                  : String(parseError)
              }`
            );
          }
        } catch (e: unknown) {
          console.error("Error processing JSON file:", e);
          const errorMessage = e instanceof Error ? e.message : String(e);
          setError(
            `Erro ao processar o arquivo JSON: ${errorMessage}. Verifique se o arquivo não está corrompido e é uma exportação válida do Bitwarden (não criptografada).`
          );
          setVaultData(null); // Ensure data is null on error
          setFileName(null);
          setIsLoading(false); // Stop loading on parse error
          setIsAnalyzing(false); // Ensure analyzing is false on parse error
          toast.error("Erro ao processar JSON", { description: errorMessage });
        }
      };

      reader.onerror = () => {
        console.error("Error reading file:", reader.error);
        const errorMessage =
          reader.error?.message ?? "Erro desconhecido ao ler o arquivo.";
        setError(`Erro ao ler o arquivo: ${errorMessage}`);
        setVaultData(null); // Ensure data is null on error
        setFileName(null);
        setIsLoading(false); // Stop loading on read error
        setIsAnalyzing(false); // Ensure analyzing is false on read error
        toast.error("Erro ao ler arquivo", { description: errorMessage });
      };

      reader.readAsText(file); // Start reading the file
    },
    [clearVaultData]
  ); // Depend on clearVaultData to ensure it uses the latest version

  // The value provided to consuming components
  const value: VaultContextType = {
    vaultData,
    analysisResults,
    analysisSummary: analysisSummary ?? createEmptySummary(), // Provide empty summary if null
    isLoading,
    isAnalyzing,
    error,
    fileName,
    loadVaultFile,
    clearVaultData,
    // Adicionando os novos estados ao contexto
    analysisStage,
    progress,
    totalItems,
    processedItems,
  };

  return (
    <VaultDataContext.Provider value={value}>
      {children}
    </VaultDataContext.Provider>
  );
};

// Custom hook to easily consume the context
export const useVaultData = (): VaultContextType => {
  const context = useContext(VaultDataContext);
  if (context === undefined) {
    throw new Error("useVaultData must be used within a VaultDataProvider");
  }
  return context;
};

// src/components/FileUploader.tsx
"use client";

import React, { useRef, useCallback, ChangeEvent } from "react";
import { useVaultData } from "@/providers/VaultDataProvider";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Replace,
  FileUp,
} from "lucide-react";
import { toast } from "sonner";
import { AnalysisProgress } from "./AnalysisProgress";
import { cn } from "@/lib/utils";

type FileUploaderProps = {
  variant?: "default" | "header";
};

export const FileUploader: React.FC<FileUploaderProps> = ({
  variant = "default",
}) => {
  // Destructure only what's needed for this component
  const {
    loadVaultFile,
    isLoading,
    error,
    vaultData,
    fileName,
    clearVaultData,
    isAnalyzing,
  } = useVaultData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Combine loading states for disabling the button
  const isDisabled = isLoading || isAnalyzing;

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // loadVaultFile handles its own errors/toasts internally now
        loadVaultFile(file).catch((err) => {
          // Catch potential errors during the *initiation* of loading, although unlikely
          console.error("Unexpected error initiating file load:", err);
          toast.error("Erro Inesperado", {
            description: "Não foi possível iniciar o carregamento do arquivo.",
          });
        });
      }
      // Reset input value to allow uploading the same file again after clearing
      // or if the user cancels and tries again.
      if (event.target) {
        event.target.value = "";
      }
    },
    [loadVaultFile] // loadVaultFile is stable due to useCallback in provider
  );

  // Trigger click on the hidden file input
  const handleButtonClick = useCallback(() => {
    // Clear previous errors when user tries to upload again
    // This is handled within loadVaultFile now which calls clearVaultData first.
    fileInputRef.current?.click();
  }, []);

  // Handle clearing the currently loaded data
  const handleClearData = useCallback(() => {
    clearVaultData();
    // Toast for clearing is handled within clearVaultData in the provider
  }, [clearVaultData]); // clearVaultData is stable

  // Renderizar botão de acordo com a variante
  const renderUploadButton = () => {
    if (variant === "header") {
      return (
        <Button
          onClick={handleButtonClick}
          disabled={isDisabled}
          variant="outline"
          size="sm"
          className="h-9"
          aria-label="Carregar arquivo JSON do cofre Bitwarden"
          data-testid="upload-button-header"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileUp className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Carregando..." : "Importar Cofre"}
        </Button>
      );
    }

    return (
      <Button
        onClick={handleButtonClick}
        disabled={isDisabled}
        className="w-full max-w-full sm:max-w-xs"
        aria-label="Carregar arquivo JSON do cofre Bitwarden"
        data-testid="upload-button"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        {isLoading
          ? isAnalyzing
            ? "Analisando..."
            : "Carregando..."
          : "Carregar Cofre (.json)"}
      </Button>
    );
  };

  // Define se deve mostrar componentes extras como progresso e mensagens
  const showExtras = variant === "default";

  return (
    <div
      className={cn(
        "flex flex-col items-center space-y-2",
        variant === "default" ? "w-full max-w-full" : ""
      )}
    >
      {/* Hidden file input element */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json" // Restrict to JSON files
        style={{ display: "none" }} // Keep it hidden
        data-testid="file-input" // Useful for testing
        disabled={isDisabled} // Disable input while loading/analyzing
      />

      {/* Show Upload Button OR Status/Clear Button */}
      {!vaultData && !error && renderUploadButton()}

      {/* Componente de Progresso da Análise */}
      {showExtras && (
        <div className="w-full flex justify-center">
          <AnalysisProgress />
        </div>
      )}

      {/* Display Error Message */}
      {error && !isDisabled && showExtras && (
        <div
          className="text-destructive text-sm flex items-start text-left space-x-1 p-2 border border-destructive rounded-md bg-destructive/10 w-full max-w-full sm:max-w-xs"
          role="alert"
          data-testid="error-message"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{error}</span>
          {/* Optionally add a retry button here */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleButtonClick}
            className="ml-auto text-destructive hover:bg-destructive/20 h-auto p-1 flex-shrink-0"
            title="Tentar novamente"
            data-testid="retry-button"
          >
            <span className="sr-only">Tentar Novamente</span>
            <Replace className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Display Success + Clear Button */}
      {vaultData && !error && !isDisabled && showExtras && (
        <div
          className="text-sm flex flex-col items-center space-y-2 p-2 border border-green-600 rounded-md bg-green-600/10 w-full max-w-full sm:max-w-xs overflow-hidden"
          data-testid="success-message"
        >
          <div className="flex items-center space-x-1 text-green-700 dark:text-green-400 w-full">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <span className="truncate flex-1" title={fileName ?? undefined}>
              &quot;{fileName}&quot; carregado!
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleButtonClick}
              className="text-primary hover:bg-primary/10 h-auto p-1 flex-shrink-0"
              title="Substituir arquivo"
              data-testid="replace-button"
            >
              <Replace className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearData}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-auto p-1 flex-shrink-0"
              title="Limpar dados carregados"
              data-testid="clear-button"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

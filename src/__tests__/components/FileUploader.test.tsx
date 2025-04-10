import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FileUploader } from "@/components/FileUploader";
import { MockVaultDataProvider } from "@/__tests__/testUtils";


// Mock do toast
jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe("FileUploader", () => {
  // Setup padrão antes de cada teste
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  test("deve renderizar o botão de upload quando não há dados carregados", () => {
    const mockVaultData = {
      loadVaultFile: jest.fn().mockResolvedValue(undefined),
      isLoading: false,
      error: null,
      vaultData: null,
      fileName: null,
      clearVaultData: jest.fn(),
      isAnalyzing: false,
    };

    render(
      <MockVaultDataProvider value={mockVaultData}>
        <FileUploader />
      </MockVaultDataProvider>
    );

    // Usa o data-testid para encontrar o botão
    const button = screen.getByTestId("upload-button");
    expect(button).toBeInTheDocument();

    // Verifica se o input file está oculto
    const fileInput = screen.getByTestId("file-input");
    expect(fileInput).toHaveStyle({ display: "none" });
  });

  test("deve mostrar mensagem de carregamento quando isLoading=true", () => {
    const mockVaultData = {
      loadVaultFile: jest.fn().mockResolvedValue(undefined),
      isLoading: true,
      error: null,
      vaultData: null,
      fileName: null,
      clearVaultData: jest.fn(),
      isAnalyzing: false,
    };

    render(
      <MockVaultDataProvider value={mockVaultData}>
        <FileUploader />
      </MockVaultDataProvider>
    );

    // Verifica texto de carregando
    expect(screen.getByText("Carregando...")).toBeInTheDocument();

    // Verifica se o botão está desabilitado
    expect(screen.getByTestId("upload-button")).toBeDisabled();
  });

  test("deve mostrar mensagem de análise quando isAnalyzing=true", () => {
    const mockVaultData = {
      loadVaultFile: jest.fn().mockResolvedValue(undefined),
      isLoading: true,
      error: null,
      vaultData: null,
      fileName: null,
      clearVaultData: jest.fn(),
      isAnalyzing: true,
    };

    render(
      <MockVaultDataProvider value={mockVaultData}>
        <FileUploader />
      </MockVaultDataProvider>
    );

    // Verifica texto de analisando
    expect(screen.getByText("Analisando...")).toBeInTheDocument();
  });

  test("deve mostrar mensagem de erro quando há um erro", () => {
    const errorMessage = "Erro ao carregar arquivo";
    const mockVaultData = {
      loadVaultFile: jest.fn().mockResolvedValue(undefined),
      isLoading: false,
      error: errorMessage,
      vaultData: null,
      fileName: null,
      clearVaultData: jest.fn(),
      isAnalyzing: false,
    };

    render(
      <MockVaultDataProvider value={mockVaultData}>
        <FileUploader />
      </MockVaultDataProvider>
    );

    // Verifica se a div de erro está presente usando data-testid
    expect(screen.getByTestId("error-message")).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();

    // Verifica se o botão de tentar novamente está presente
    expect(screen.getByTestId("retry-button")).toBeInTheDocument();
  });

  test("deve mostrar mensagem de sucesso quando os dados são carregados", () => {
    const testFileName = "bitwarden_export.json";
    const mockVaultData = {
      loadVaultFile: jest.fn().mockResolvedValue(undefined),
      isLoading: false,
      error: null,
      vaultData: { items: [], folders: [], encrypted: false },
      fileName: testFileName,
      clearVaultData: jest.fn(),
      isAnalyzing: false,
    };

    render(
      <MockVaultDataProvider value={mockVaultData}>
        <FileUploader />
      </MockVaultDataProvider>
    );

    // Verifica se a div de sucesso está presente usando data-testid
    expect(screen.getByTestId("success-message")).toBeInTheDocument();

    // Verifica se a mensagem de sucesso está presente
    expect(
      screen.getByText(`"${testFileName}" carregado!`)
    ).toBeInTheDocument();

    // Verifica se os botões de substituir e limpar estão presentes
    expect(screen.getByTestId("replace-button")).toBeInTheDocument();
    expect(screen.getByTestId("clear-button")).toBeInTheDocument();
  });

  test("deve chamar loadVaultFile quando um arquivo é selecionado", async () => {
    const mockLoadVaultFile = jest.fn().mockResolvedValue(undefined);
    const mockVaultData = {
      loadVaultFile: mockLoadVaultFile,
      isLoading: false,
      error: null,
      vaultData: null,
      fileName: null,
      clearVaultData: jest.fn(),
      isAnalyzing: false,
    };

    render(
      <MockVaultDataProvider value={mockVaultData}>
        <FileUploader />
      </MockVaultDataProvider>
    );

    // Simula o clique no botão que ativa o input file usando data-testid
    fireEvent.click(screen.getByTestId("upload-button"));

    // Cria um arquivo de teste
    const file = new File(['{"items": []}'], "test.json", {
      type: "application/json",
    });

    // Simula o upload do arquivo
    const fileInput = screen.getByTestId("file-input");
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Verifica se loadVaultFile foi chamado com o arquivo
    expect(mockLoadVaultFile).toHaveBeenCalledWith(file);

    // Verifica se o input foi limpo
    await waitFor(() => {
      expect(fileInput).toHaveValue("");
    });
  });

  test("deve chamar clearVaultData quando o botão de limpar é clicado", () => {
    const mockClearVaultData = jest.fn();
    const mockVaultData = {
      loadVaultFile: jest.fn().mockResolvedValue(undefined),
      isLoading: false,
      error: null,
      vaultData: { items: [], folders: [], encrypted: false },
      fileName: "test.json",
      clearVaultData: mockClearVaultData,
      isAnalyzing: false,
    };

    render(
      <MockVaultDataProvider value={mockVaultData}>
        <FileUploader />
      </MockVaultDataProvider>
    );

    // Clica no botão de limpar usando data-testid
    fireEvent.click(screen.getByTestId("clear-button"));

    // Verifica se clearVaultData foi chamado
    expect(mockClearVaultData).toHaveBeenCalled();
  });
});

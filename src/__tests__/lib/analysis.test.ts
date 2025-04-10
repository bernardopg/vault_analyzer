import {
  evaluatePasswordStrength,
  analyzeVaultDataSync,
  createEmptySummary,
} from "@/lib/analysis";
import { BitwardenData } from "@/lib/types";
import zxcvbn from "zxcvbn";

// Mock para a biblioteca zxcvbn
jest.mock("zxcvbn");

describe("analysis", () => {
  beforeEach(() => {
    // Configurando o mock do zxcvbn para retornar valores padrão
    (zxcvbn as jest.Mock).mockReturnValue({
      score: 3,
      feedback: {
        warning: "Test warning",
        suggestions: ["Test suggestion"],
      },
    });
  });

  describe("evaluatePasswordStrength", () => {
    test("deve retornar null para senhas vazias, nulas ou indefinidas", () => {
      expect(evaluatePasswordStrength(null)).toBeNull();
      expect(evaluatePasswordStrength(undefined)).toBeNull();
      expect(evaluatePasswordStrength("")).toBeNull();
    });

    test("deve retornar análise de força correta para senhas válidas", () => {
      const result = evaluatePasswordStrength("TestPassword123!");

      expect(result).not.toBeNull();
      expect(result?.score).toBe(3);
      expect(result?.feedback).toBe("Test warning");
      expect(result?.suggestions).toEqual(["Test suggestion"]);
      expect(result?.crackTimeDisplay).toContain("meses"); // baseado no mock
    });

    test("deve lidar com erros na avaliação da senha", () => {
      // Forçando um erro no zxcvbn
      (zxcvbn as jest.Mock).mockImplementation(() => {
        throw new Error("Test error");
      });

      const result = evaluatePasswordStrength("TestPassword123!");

      expect(result).not.toBeNull();
      expect(result?.score).toBe(0);
      expect(result?.feedback).toBe("Erro ao analisar senha.");
      expect(result?.crackTimeDisplay).toBe("desconhecido");
    });
  });

  describe("analyzeVaultDataSync", () => {
    test("deve retornar resultados vazios para dados nulos ou vazios", () => {
      const emptyResult = analyzeVaultDataSync(null);
      expect(emptyResult.results).toEqual([]);
      expect(emptyResult.summary).toEqual(createEmptySummary());

      const emptyDataResult = analyzeVaultDataSync({
        encrypted: false,
        folders: [],
        items: [],
      });
      expect(emptyDataResult.results).toEqual([]);
      expect(emptyDataResult.summary.totalItems).toBe(0);
    });

    test("deve analisar corretamente itens do cofre", () => {
      // Mock para os dados do cofre Bitwarden
      const mockVaultData: BitwardenData = {
        encrypted: false,
        folders: [],
        items: [
          {
            id: "1",
            organizationId: null,
            folderId: null,
            type: 1,
            name: "Google",
            notes: null,
            favorite: false,
            login: {
              uris: [{ match: null, uri: "https://google.com" }],
              username: "test@example.com",
              password: "StrongP@ss123",
              totp: "123456",
            },
            collectionIds: null,
            revisionDate: new Date().toISOString(),
            creationDate: new Date().toISOString(),
            deletedDate: null,
          },
          {
            id: "2",
            organizationId: null,
            folderId: null,
            type: 1,
            name: "Facebook",
            notes: null,
            favorite: false,
            login: {
              uris: [{ match: null, uri: "https://facebook.com" }],
              username: "test@example.com",
              password: "weak",
              totp: null,
            },
            collectionIds: null,
            revisionDate: new Date().toISOString(),
            creationDate: new Date().toISOString(),
            deletedDate: null,
          },
          {
            id: "3",
            organizationId: null,
            folderId: null,
            type: 1,
            name: "Twitter",
            notes: null,
            favorite: false,
            login: {
              uris: [{ match: null, uri: "https://twitter.com" }],
              username: "test@example.com",
              password: null, // Senha vazia
              totp: null,
            },
            collectionIds: null,
            revisionDate: new Date().toISOString(),
            creationDate: new Date().toISOString(),
            deletedDate: null,
          },
        ],
      };

      const result = analyzeVaultDataSync(mockVaultData);

      // Verificações básicas
      expect(result.results).toHaveLength(3);
      expect(result.summary.totalItems).toBe(3);

      // Verificação de domínios
      expect(result.results[0].baseDomain).toBe("google.com");
      expect(result.results[1].baseDomain).toBe("facebook.com");
      expect(result.results[2].baseDomain).toBe("twitter.com");

      // Verificação de TOTP
      expect(result.results[0].hasTotp).toBe(true);
      expect(result.results[1].hasTotp).toBe(false);

      // Verificação de senhas vazias
      expect(result.results[2].riskLevel).toBe("Vazia");
      expect(result.summary.passwordStats.emptyCount).toBe(1);

      // Verificação de força de senha
      expect(result.results[0].passwordStrength).not.toBeNull();
      expect(result.results[1].passwordStrength).not.toBeNull();
      expect(result.results[2].passwordStrength).toBeNull();
    });

    test("deve identificar senhas duplicadas", () => {
      const mockVaultData: BitwardenData = {
        encrypted: false,
        folders: [],
        items: [
          {
            id: "1",
            organizationId: null,
            folderId: null,
            type: 1,
            name: "Site 1",
            notes: null,
            favorite: false,
            login: {
              uris: [{ match: null, uri: "https://site1.com" }],
              username: "user1",
              password: "SamePassword123!",
              totp: null,
            },
            collectionIds: null,
            revisionDate: new Date().toISOString(),
            creationDate: new Date().toISOString(),
            deletedDate: null,
          },
          {
            id: "2",
            organizationId: null,
            folderId: null,
            type: 1,
            name: "Site 2",
            notes: null,
            favorite: false,
            login: {
              uris: [{ match: null, uri: "https://site2.com" }],
              username: "user2",
              password: "SamePassword123!", // Senha igual
              totp: null,
            },
            collectionIds: null,
            revisionDate: new Date().toISOString(),
            creationDate: new Date().toISOString(),
            deletedDate: null,
          },
        ],
      };

      const result = analyzeVaultDataSync(mockVaultData);

      // Verificação de senhas duplicadas
      expect(result.results[0].isDuplicate).toBe(true);
      expect(result.results[1].isDuplicate).toBe(true);
      expect(result.summary.passwordStats.duplicateCount).toBe(2);
    });
  });
});

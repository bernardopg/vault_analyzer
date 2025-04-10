import zxcvbn from "zxcvbn";
import {
  BitwardenData,
  BitwardenItem,
  AnalyzedItem,
  VaultAnalysisSummary,
  PasswordStrengthDetails,
} from "./types";
import { extractBaseDomain } from "./domainUtils";
import { batchCheckPasswords } from "./hibpService";

const PASSWORD_LENGTH_CRITICAL = 6;
const ZXCVBN_SCORE_WEAK = 2;
const ZXCVBN_SCORE_MODERATE = 4;

export function evaluatePasswordStrength(
  password: string | null | undefined
): PasswordStrengthDetails | null {
  if (!password) {
    return null;
  }

  try {
    const result = zxcvbn(password);
    const crackTimeMap: { [key: number]: string } = {
      0: "instantâneo",
      1: "segundos / minutos",
      2: "horas / dias",
      3: "meses / anos",
      4: "décadas / séculos+",
    };

    return {
      score: result.score,
      feedback: result.feedback?.warning || null,
      suggestions: result.feedback?.suggestions || [],
      warning: result.feedback?.warning || null,
      crackTimeDisplay: crackTimeMap[result.score] ?? "desconhecido",
    };
  } catch (e) {
    console.error("Error evaluating password strength:", e);
    return {
      score: 0,
      feedback: "Erro ao analisar senha.",
      suggestions: [],
      warning: "Erro na biblioteca zxcvbn.",
      crackTimeDisplay: "desconhecido",
    };
  }
}

export function analyzeVaultDataSync(vaultData: BitwardenData | null): {
  results: AnalyzedItem[];
  summary: VaultAnalysisSummary;
} {
  if (!vaultData || !vaultData.items) {
    return { results: [], summary: createEmptySummary() };
  }

  // Filtra itens inválidos ou incompletos antes de processá-los
  const validItems = vaultData.items.filter(
    (item) =>
      item &&
      typeof item === "object" &&
      item.id && // Garante que tem pelo menos um ID válido
      item.name !== undefined // Garante que tem um nome (mesmo que seja null)
  );

  if (validItems.length === 0) {
    console.warn("Nenhum item válido encontrado no arquivo JSON");
    return { results: [], summary: createEmptySummary() };
  }

  console.log(
    `Processando ${validItems.length} de ${vaultData.items.length} itens (${
      vaultData.items.length - validItems.length
    } itens inválidos ignorados)`
  );

  const analyzedItems: AnalyzedItem[] = [];
  const passwordCounts = new Map<string, number>();

  for (const item of validItems) {
    try {
      const safeItem: BitwardenItem = {
        ...item,
        name:
          item.name || `Item Sem Nome [${item.id?.substring(0, 8) ?? "N/A"}]`,
        login: item.login || {
          uris: null,
          username: null,
          password: null,
          totp: null,
        },
        notes: item.notes || null,
        revisionDate: item.revisionDate || new Date().toISOString(),
        creationDate: item.creationDate || new Date().toISOString(),
        // Ensure required fields always exist even if optional in source
        organizationId: item.organizationId || null,
        folderId: item.folderId || null,
        type: item.type || 1, // Default to login type? Adjust if needed
        favorite: item.favorite || false,
        collectionIds: item.collectionIds || null,
        deletedDate: item.deletedDate || null,
      };

      const password = safeItem.login?.password;
      if (password) {
        passwordCounts.set(password, (passwordCounts.get(password) || 0) + 1);
      }

      const firstUri = safeItem.login?.uris?.[0]?.uri;
      const baseDomain = extractBaseDomain(firstUri);
      const passwordStrength = evaluatePasswordStrength(password);

      let passwordAgeDays = -1;
      if (safeItem.revisionDate) {
        try {
          const revision = new Date(safeItem.revisionDate);
          const now = new Date();
          // Ensure dates are valid before calculating diff
          if (!isNaN(revision.getTime())) {
            const diffTime = now.getTime() - revision.getTime();
            if (diffTime >= 0) {
              // Avoid future dates giving negative age
              passwordAgeDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            }
          }
        } catch {
          /* ignore date parse errors */
        }
      }

      const hasTotp = !!safeItem.login?.totp;
      const passwordLength = password ? password.length : 0;

      let riskLevel: AnalyzedItem["riskLevel"] = "Vazia";
      if (!password) {
        riskLevel = "Vazia";
      } else if (
        passwordLength < PASSWORD_LENGTH_CRITICAL ||
        (passwordStrength && passwordStrength.score < ZXCVBN_SCORE_WEAK)
      ) {
        riskLevel = "Crítica";
      } else if (
        passwordStrength &&
        passwordStrength.score < ZXCVBN_SCORE_MODERATE
      ) {
        // Score 2 & 3
        // Differentiate between weak and moderate based on score
        riskLevel = passwordStrength.score === 3 ? "Moderada" : "Fraca";
      } else {
        // Score 4
        riskLevel = "Forte";
      }

      analyzedItems.push({
        ...safeItem,
        baseDomain,
        passwordStrength,
        passwordAgeDays,
        isLeaked: false,
        leakCount: 0,
        riskLevel,
        isDuplicate: false,
        hasTotp,
        passwordLength,
      });
    } catch (error) {
      console.error(
        `Erro ao processar o item ${item.id || "desconhecido"}:`,
        error
      );
      // Continue para o próximo item em caso de erro
    }
  }

  let duplicateCount = 0;
  let weakCount = 0;
  let criticalCount = 0;
  let emptyCount = 0;
  let totalStrengthScore = 0;
  let validStrengthCount = 0;
  let totalLength = 0;
  let validLengthCount = 0;

  for (const item of analyzedItems) {
    const password = item.login?.password;
    if (password) {
      if ((passwordCounts.get(password) || 0) > 1) {
        item.isDuplicate = true;
      }
      if (item.passwordStrength) {
        totalStrengthScore += item.passwordStrength.score;
        validStrengthCount++;
      }
      totalLength += item.passwordLength;
      validLengthCount++;
    } else {
      emptyCount++;
    }
    if (item.riskLevel === "Crítica") criticalCount++;
    if (item.riskLevel === "Fraca") weakCount++;
  }

  duplicateCount = analyzedItems.filter((item) => item.isDuplicate).length;

  const summary: VaultAnalysisSummary = {
    totalItems: analyzedItems.length, // Agora usa o número de itens analisados, não o total original
    passwordStats: {
      leakedCount: 0,
      duplicateCount: duplicateCount,
      weakCount: weakCount,
      criticalCount: criticalCount,
      emptyCount: emptyCount,
      averageStrengthScore:
        validStrengthCount > 0 ? totalStrengthScore / validStrengthCount : 0,
      averageLength: validLengthCount > 0 ? totalLength / validLengthCount : 0,
    },
  };

  return { results: analyzedItems, summary };
}

export function createEmptySummary(): VaultAnalysisSummary {
  return {
    totalItems: 0,
    passwordStats: {
      leakedCount: 0,
      duplicateCount: 0,
      weakCount: 0,
      criticalCount: 0,
      emptyCount: 0,
      averageStrengthScore: 0,
      averageLength: 0,
    },
  };
}

// Função que analisa de forma assíncrona se as senhas foram vazadas
export async function analyzePasswordLeaks(
  analyzedItems: AnalyzedItem[]
): Promise<{
  updatedItems: AnalyzedItem[];
  leakedCount: number;
}> {
  // Filtra itens que têm senhas para verificar
  const passwordItems = analyzedItems
    .map((item, index) => ({
      password: item.login?.password || "",
      index,
    }))
    .filter((item) => item.password.length > 0);

  if (passwordItems.length === 0) {
    return { updatedItems: analyzedItems, leakedCount: 0 };
  }

  // Executa a verificação em lote
  const leakResults = await batchCheckPasswords(passwordItems);
  let leakedCount = 0;

  // Cria cópia dos itens para atualização
  const updatedItems = [...analyzedItems];

  // Atualiza os itens com informações de vazamento
  leakResults.forEach((leakCount, index) => {
    if (leakCount > 0) {
      updatedItems[index] = {
        ...updatedItems[index],
        isLeaked: true,
        leakCount: leakCount,
        // Atualiza o nível de risco se a senha foi vazada
        riskLevel: getRiskLevelWithLeakStatus(
          updatedItems[index].riskLevel,
          true
        ),
      };
      leakedCount++;
    }
  });

  return { updatedItems, leakedCount };
}

// Função para atualizar o nível de risco com base no vazamento
function getRiskLevelWithLeakStatus(
  currentRisk: AnalyzedItem["riskLevel"],
  isLeaked: boolean
): AnalyzedItem["riskLevel"] {
  if (!isLeaked) {
    return currentRisk; // Mantém o risco se não houver vazamento
  }

  // Aumenta o nível de risco se a senha foi vazada
  switch (currentRisk) {
    case "Forte":
      return "Moderada"; // Senha forte vazada -> risco moderado
    case "Moderada":
      return "Fraca"; // Senha moderada vazada -> risco fraco
    case "Fraca":
    case "Crítica":
    case "Vazia":
      return "Crítica"; // Demais casos -> risco crítico
    default:
      return currentRisk;
  }
}

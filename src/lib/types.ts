export interface BitwardenLoginUri {
  match: number | null;
  uri: string | null;
}

export interface BitwardenLogin {
  uris: BitwardenLoginUri[] | null;
  username: string | null;
  password: string | null;
  totp: string | null;
}

export interface BitwardenItem {
  id: string;
  organizationId: string | null;
  folderId: string | null;
  type: number;
  name: string;
  notes: string | null;
  favorite: boolean;
  login?: BitwardenLogin;
  collectionIds: string[] | null;
  revisionDate: string;
  creationDate: string;
  deletedDate: string | null;
}

export interface BitwardenFolder {
  id: string;
  name: string;
}

export interface BitwardenData {
  encrypted: boolean;
  folders: BitwardenFolder[];
  items: BitwardenItem[];
}

export interface PasswordStrengthDetails {
  score: number;
  feedback: string | null;
  suggestions: string[];
  warning: string | null;
  crackTimeDisplay: string | null;
}

export interface AnalyzedItem extends BitwardenItem {
  baseDomain: string;
  passwordStrength: PasswordStrengthDetails | null;
  passwordAgeDays: number;
  isLeaked: boolean;
  leakCount: number;
  riskLevel: "Forte" | "Moderada" | "Fraca" | "Crítica" | "Vazia";
  isDuplicate: boolean;
  hasTotp: boolean;
  passwordLength: number;
}

export interface VaultAnalysisSummary {
  totalItems: number;
  passwordStats: {
    leakedCount: number;
    duplicateCount: number;
    weakCount: number;
    criticalCount: number;
    emptyCount: number;
    averageStrengthScore: number;
    averageLength: number;
  };
}

// Importamos o enum do VaultDataProvider
import { AnalysisStage } from "@/providers/VaultDataProvider";

export interface VaultContextType {
  vaultData: BitwardenData | null;
  analysisResults: AnalyzedItem[] | null;
  analysisSummary: VaultAnalysisSummary | null;
  isLoading: boolean;
  isAnalyzing: boolean;
  error: string | null;
  fileName: string | null;
  loadVaultFile: (file: File) => Promise<void>;
  clearVaultData: () => void;
  // Novos campos para o progresso da análise
  analysisStage: AnalysisStage;
  progress: number;
  totalItems: number;
  processedItems: number;
}

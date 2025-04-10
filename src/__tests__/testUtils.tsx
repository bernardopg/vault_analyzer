// filepath: /home/bitter/dev/bitwarden_project/frontend/my-vault-analyzer/src/__tests__/testUtils.tsx
import React, { ReactNode } from "react";
import { render, RenderResult } from "@testing-library/react";
import { VaultDataProvider } from "@/providers/VaultDataProvider";

// Wrapper para prover o contexto nos testes
export const renderWithProviders = (ui: React.ReactElement): RenderResult => {
  return render(<VaultDataProvider>{ui}</VaultDataProvider>);
};

// Wrapper para testes que precisam de mocks personalizados
export const MockVaultDataContext = React.createContext<any>({});

// Provider com valores mockados, para maior controle nos testes
export const MockVaultDataProvider: React.FC<{
  children: ReactNode;
  value: any;
}> = ({ children, value }) => {
  return (
    <MockVaultDataContext.Provider value={value}>
      {children}
    </MockVaultDataContext.Provider>
  );
};

// Modificação temporária do provider original para os testes
// Isto permite que os testes operem com valores estáticos e sem os efeitos assíncronos
jest.mock("@/providers/VaultDataProvider", () => {
  const originalModule = jest.requireActual("@/providers/VaultDataProvider");
  return {
    ...originalModule,
    useVaultData: () => React.useContext(MockVaultDataContext),
  };
});

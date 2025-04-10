// Ajustando para usar a sintaxe padrão do ESModule
import sha1 from "js-sha1";
import axios from "axios";

// Função para verificar se uma senha foi vazada usando a API Have I Been Pwned (HIBP)
// Usa o método k-anonimidade para garantir que a senha completa nunca seja enviada
export async function checkPasswordLeak(password: string): Promise<number> {
  try {
    // Calcula o hash SHA-1 da senha
    const hash = sha1(password).toUpperCase();

    // Separa o prefixo (primeiros 5 caracteres) do resto do hash
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    // Removendo o cabeçalho "User-Agent" da requisição para evitar erros em navegadores modernos
    const response = await axios.get(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        headers: {
          "Add-Padding": "true", // Usa padding para proteger contra timing attacks
        },
      }
    );

    // Procura o sufixo do hash na resposta
    const lines = response.data.split("\n");
    for (const line of lines) {
      const [foundSuffix, count] = line.split(":");
      if (foundSuffix.trim() === suffix) {
        return parseInt(count.trim(), 10);
      }
    }

    // Senha não foi encontrada nos vazamentos
    return 0;
  } catch (error) {
    console.error("Erro ao verificar vazamentos:", error);
    // Retorna -1 para indicar erro na verificação
    return -1;
  }
}

// Função para processar verificações em lote com taxa limitada
export async function batchCheckPasswords(
  passwords: { password: string; index: number }[]
): Promise<Map<number, number>> {
  const results = new Map<number, number>();

  // Processa senhas em lotes para não sobrecarregar a API
  const batchSize = 5; // Processa 5 por vez

  for (let i = 0; i < passwords.length; i += batchSize) {
    const batch = passwords.slice(i, i + batchSize);

    // Executa verificações em paralelo dentro do lote
    const promises = batch.map(async ({ password, index }) => {
      // Aguarda um pequeno intervalo para evitar sobrecarregar a API
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      const leakCount = await checkPasswordLeak(password);
      return { index, leakCount };
    });

    // Aguarda todas as verificações do lote atual
    const batchResults = await Promise.all(promises);

    // Armazena os resultados
    batchResults.forEach(({ index, leakCount }) => {
      results.set(index, leakCount);
    });

    // Aguarda antes do próximo lote para respeitar limites de taxa da API
    if (i + batchSize < passwords.length) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  return results;
}

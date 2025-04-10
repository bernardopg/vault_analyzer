import axios from "axios";
import { checkPasswordLeak, batchCheckPasswords } from "@/lib/hibpService";

// Mock do axios
jest.mock("axios");

describe("hibpService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("checkPasswordLeak", () => {
    test("deve retornar 0 quando a senha não foi vazada", async () => {
      // Mock da resposta da API
      (axios.get as jest.Mock).mockResolvedValueOnce({
        data: "1234AB:0\n5678CD:12",
      });

      const result = await checkPasswordLeak("SenhaSegura123!");

      expect(result).toBe(0);
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringMatching(/^https:\/\/api\.pwnedpasswords\.com\/range\/.+/),
        expect.any(Object)
      );
    });

    test("deve retornar o número de vazamentos quando a senha foi vazada", async () => {
      // Precisamos saber o hash SHA-1 real para este teste
      // Assumindo que o início do hash para 'password123' começa com 'CBFDA'
      // e o resto do hash é 'B7B3F55F957F1AB5B59AB19F93DFBF1A68719A'

      // Mock da resposta da API que inclui o sufixo do hash
      (axios.get as jest.Mock).mockResolvedValueOnce({
        data: "1234AB:0\nB7B3F55F957F1AB5B59AB19F93DFBF1A68719A:42\n5678CD:12",
      });

      const result = await checkPasswordLeak("password123");

      expect(result).toBe(42);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    test("deve retornar -1 quando ocorre um erro ao chamar a API", async () => {
      (axios.get as jest.Mock).mockRejectedValueOnce(new Error("API Error"));

      const result = await checkPasswordLeak("SenhaSegura123!");

      expect(result).toBe(-1);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("batchCheckPasswords", () => {
    test("deve processar um lote de senhas corretamente", async () => {
      // Mock da função checkPasswordLeak
      const originalCheckPasswordLeak =
        require("@/lib/hibpService").checkPasswordLeak;

      // Sobrescrever temporariamente para o teste
      require("@/lib/hibpService").checkPasswordLeak = jest
        .fn()
        .mockResolvedValueOnce(0) // primeira senha não vazada
        .mockResolvedValueOnce(42) // segunda senha vazada
        .mockResolvedValueOnce(7); // terceira senha vazada

      const passwords = [
        { password: "senha1", index: 0 },
        { password: "senha2", index: 1 },
        { password: "senha3", index: 2 },
      ];

      const results = await batchCheckPasswords(passwords);

      expect(results.get(0)).toBe(0);
      expect(results.get(1)).toBe(42);
      expect(results.get(2)).toBe(7);

      // Restaurar a função original
      require("@/lib/hibpService").checkPasswordLeak =
        originalCheckPasswordLeak;
    });

    test("deve lidar com erros em algumas senhas", async () => {
      // Mock da função checkPasswordLeak
      const originalCheckPasswordLeak =
        require("@/lib/hibpService").checkPasswordLeak;

      // Sobrescrever temporariamente para o teste
      require("@/lib/hibpService").checkPasswordLeak = jest
        .fn()
        .mockResolvedValueOnce(15) // primeira senha vazada
        .mockResolvedValueOnce(-1) // erro na segunda senha
        .mockResolvedValueOnce(0); // terceira senha não vazada

      const passwords = [
        { password: "senha1", index: 0 },
        { password: "senha2", index: 1 },
        { password: "senha3", index: 2 },
      ];

      const results = await batchCheckPasswords(passwords);

      expect(results.get(0)).toBe(15);
      expect(results.get(1)).toBe(-1); // indica erro
      expect(results.get(2)).toBe(0);

      // Restaurar a função original
      require("@/lib/hibpService").checkPasswordLeak =
        originalCheckPasswordLeak;
    });
  });
});

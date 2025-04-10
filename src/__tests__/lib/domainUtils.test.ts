import { extractBaseDomain } from "@/lib/domainUtils";

describe("domainUtils", () => {
  describe("extractBaseDomain", () => {
    test('deve retornar "Desconhecido" para entrada nula ou indefinida', () => {
      expect(extractBaseDomain(null)).toBe("Desconhecido");
      expect(extractBaseDomain(undefined)).toBe("Desconhecido");
      expect(extractBaseDomain("")).toBe("Desconhecido");
    });

    test("deve extrair domínios básicos de URLs completas", () => {
      expect(extractBaseDomain("https://www.google.com")).toBe("google.com");
      expect(extractBaseDomain("http://example.org/path/to/page")).toBe(
        "example.org"
      );
      expect(extractBaseDomain("https://login.microsoft.com/login")).toBe(
        "microsoft.com"
      );
    });

    test("deve tratar URLs sem protocolo", () => {
      expect(extractBaseDomain("google.com")).toBe("google.com");
      expect(extractBaseDomain("www.example.org")).toBe("example.org");
    });

    test("deve tratar subdomínios especiais corretamente", () => {
      expect(extractBaseDomain("https://accounts.google.co.uk")).toBe(
        "google.co.uk"
      );
      expect(extractBaseDomain("login.gov.br")).toBe("login.gov.br");
    });

    test("deve lidar com casos especiais e URLs malformadas", () => {
      expect(extractBaseDomain("ssh://git@github.com:user/repo.git")).toBe(
        "github.com"
      );
      expect(extractBaseDomain("192.168.1.1")).toBe("192.168.1.1");
      expect(extractBaseDomain("invalid-url-format")).toBe("Desconhecido");
    });
  });
});

import "@testing-library/jest-dom";
import { configure } from "@testing-library/react";

// Configura maior tempo de espera para os testes
configure({
  asyncUtilTimeout: 5000, // Aumenta o tempo de espera para operações assíncronas
  testIdAttribute: "data-testid", // Define o atributo para testes
});

// Mock para o localStorage e sessionStorage no ambiente de teste
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

Object.defineProperty(window, "sessionStorage", {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// Mock para react-plotly.js
jest.mock("react-plotly.js", () => ({
  __esModule: true,
  default: () => <div data-testid="plotly-chart">Plotly Chart</div>,
}));

// Mock para react-wordcloud
jest.mock("react-wordcloud", () => ({
  __esModule: true,
  default: () => <div data-testid="word-cloud">Word Cloud</div>,
}));

// Mock para zxcvbn
jest.mock("zxcvbn", () => () => ({
  score: 3,
  feedback: {
    warning: "Test warning",
    suggestions: ["Test suggestion"],
  },
  crack_times_display: {
    offline_slow_hashing_1e4_per_second: "anos",
  },
}));

// Suprime os avisos do React relacionados ao act()
const originalError = console.error;
console.error = (...args) => {
  if (/Warning.*not wrapped in act/.test(args[0])) {
    return;
  }
  originalError.call(console, ...args);
};

// Suprime os avisos específicos relacionados a warnings de depreciação
const originalWarn = console.warn;
console.warn = (...args) => {
  // Ignora certos avisos que podem não ser relevantes para os testes
  if (/Warning.*deprecated/.test(args[0])) {
    return;
  }
  originalWarn.call(console, ...args);
};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

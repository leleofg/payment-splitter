import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  verbose: true,
  testMatch: ["**/?(*.)+(spec|test).+(ts|tsx|js)"],
  transform: {
    ".+\\.ts$": "ts-jest"
  },
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json"
    }
  },
  moduleNameMapper: {
    "@src/(.*)": "<rootDir>/src/$1"
  },
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts"],
  clearMocks: true,
  resetMocks: true,
  resetModules: true,
  moduleDirectories: ["<rootDir>/src", "node_modules"]
};

export default config;

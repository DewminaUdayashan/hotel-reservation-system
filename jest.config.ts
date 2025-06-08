import nextJest from "next/jest";

const createJestConfig = nextJest({ dir: "./" });

const config = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"], // for jest-dom
};

export default createJestConfig(config);

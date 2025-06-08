module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@raydium-io/raydium-sdk-v2$': '<rootDir>/__mocks__/raydium-sdk-v2.ts',
    '^@solana/web3.js$': '<rootDir>/__mocks__/solana-web3.js'
  }
};

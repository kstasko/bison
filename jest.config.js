module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleDirectories: ['node_modules'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};

module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    'config/**/*.js',
    'middlewares/**/*.js',
    'validators/**/*.js',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/bin/',
    'src/repositories/',
    'src/models/UserModel.js',
    'src/controllers/UserController.js',
    'src/server.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'text-summary'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
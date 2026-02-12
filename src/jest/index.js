module.exports = (config = {}) => {
  return {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
      '@src/(.*)$': '<rootDir>/src/$1',
    },
    ...(config.global && {
      globalSetup: '<rootDir>/jest.global.js',
    }),
  };
};

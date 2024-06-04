module.exports = {
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.ts$': 'ts-jest',
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'ts'],
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  globals: {
    'ts-jest': {
      tsconfig: '../../tsconfig.json', // Updated path to tsconfig.json
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

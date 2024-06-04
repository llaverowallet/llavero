module.exports = {
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.ts$': 'babel-jest',
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'ts'],
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
};

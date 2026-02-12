module.exports = () => {
  return {
    '**/*.{ts,js,json}': ['prettier --write', 'eslint --fix'],
  };
};

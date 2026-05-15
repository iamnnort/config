module.exports.chunk = (array, size = 10) => {
  const chunks = [];

  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
};

module.exports.named = (entries) => {
  const namedEntries = [];

  for (const entry of entries) {
    namedEntries.push([entry.replace(/^src\//, '').replace(/\.ts$/, ''), entry]);
  }

  return namedEntries;
};

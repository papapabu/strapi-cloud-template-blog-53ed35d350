module.exports = () => ({
  pabu: {
    enabled: true,
    resolve: "./src/plugins/pabu",
  },
  upload: {
    config: {
      sizeLimit: 250 * 1024 * 1024,
    },
  },
});

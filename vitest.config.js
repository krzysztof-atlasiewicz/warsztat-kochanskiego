export default {
  test: { environment: "node" },
  resolve: { alias: [{ find: /^\.\.\/lib\/astronomy\.js$/, replacement: "astronomy-engine" }] }
};

/**
 * The test scripts are bundled by esbuild and run under Node, but the app
 * itself targets the browser and has no Node types installed. These two
 * scripts use exactly one Node global between them, so declaring it here is
 * cheaper and more honest than adding @types/node to the dependency tree.
 */
declare const process: {
  exit(code?: number): never
}

import { pathsToModuleNameMapper } from "ts-jest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { JestConfigWithTsJest } from "ts-jest";

// Read tsconfig via fs rather than an ESM JSON import: with `"type": "module"`
// in package.json, `import ... from "./tsconfig.json"` requires an import
// attribute (`with { type: "json" }`) on Node >= 22, which breaks jest's config
// loader. Reading + parsing keeps this working across Node 20 (CI) and newer.
const { compilerOptions } = JSON.parse(
  readFileSync(join(process.cwd(), "tsconfig.json"), "utf-8"),
) as { compilerOptions: { baseUrl: string; paths: Record<string, string[]> } };

// A handful of dependencies (and their transitive deps) ship ESM-only. Jest
// runs in CommonJS mode here (so `jest.mock` hoisting keeps working), so those
// packages must be transpiled rather than ignored. Everything else in
// node_modules is left untransformed for speed.
const esmDeps = [
  "@tsndr/cloudflare-worker-jwt",
  "query-string",
  "decode-uri-component",
  "split-on-first",
  "filter-obj",
  "openapi-fetch",
];

const jestConfig: JestConfigWithTsJest = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>"],
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
  transform: {
    "^.+\\.[tj]sx?$": [
      "ts-jest",
      {
        isolatedModules: true,
        tsconfig: {
          module: "CommonJS",
          moduleResolution: "Node",
          allowJs: true,
          esModuleInterop: true,
          verbatimModuleSyntax: false,
        },
      },
    ],
  },
  transformIgnorePatterns: [`/node_modules/(?!(${esmDeps.join("|")})/)`],
};

export default jestConfig;

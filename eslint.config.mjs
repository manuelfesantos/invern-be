import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginImport from "eslint-plugin-import";
import { globalIgnores, defineConfig } from "eslint/config";
export default defineConfig([
  globalIgnores([
    "docs/*",
    "scripts/*",
    "**/.wrangler/**",
    "**/dist/**",
    "**/.turbo/**",
    "coverage/**",
  ]),
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    plugins: {
      import: pluginImport,
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },
    rules: {
      "no-console": "error",
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
      // "@typescript-eslint/no-magic-numbers": "error",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: ["../../*"],
        },
      ],
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              target: "./libs/adapters/**/*",
              from: ["./libs/db/**/*", "./libs/modules/**/*"],
              message: "Adapters cannot import from db or modules",
            },
            {
              from: ["./libs/modules/**/*", "./libs/adapters/**/*"],
              target: "./libs/db/**/*",
              message: "Cannot import directly from the db layer",
            },
            {
              from: [
                "./libs/modules/**/*",
                "./libs/adapters/**/*",
                "./libs/db/**/*",
              ],
              target: "./libs/utils/**/*",
              message: "Cannot import from utils in these layers",
            },
            {
              target: "./libs/entities/**/*",
              from: [
                "./libs/adapters/**/*",
                "./libs/db/**/*",
                "./libs/modules/**/*",
                "./libs/utils/**/*",
              ],
              message: "Entities cannot import from other layers",
            },
          ],
        },
      ],
      "max-len": [
        "warn",
        {
          code: 80,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
        },
      ],
    },
  },
  {
    files: ["libs/db/**/*.ts"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },
  {
    // Apps are the composition root: relative parent imports and Node/Workers
    // globals are expected, and they may wire together any lib layer.
    files: ["apps/**/*.ts"],
    languageOptions: { globals: { ...globals.node } },
    rules: {
      "@typescript-eslint/no-restricted-imports": "off",
      "import/no-restricted-paths": "off",
    },
  },
]);

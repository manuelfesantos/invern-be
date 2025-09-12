import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginImport from "eslint-plugin-import";
import { globalIgnores, defineConfig } from "eslint/config";
export default defineConfig([
  globalIgnores(["docs/*", "scripts/*"]),
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
              from: [
                "./libs/db/**/*",
                "./libs/modules/**/*",
                "./functions/**/*",
              ],
              message: "Adapters cannot import from db, modules, or functions",
            },
            {
              from: [
                "./libs/modules/**/*",
                "./functions/**/*",
                "./libs/adapters/**/*",
              ],
              target: "./libs/db/**/*",
              message: "Cannot import directly from the db layer",
            },
            {
              from: ["./libs/adapters/**/*", "./libs/db/**/*"],
              target: "./functions/**/*",
              message: "Adapters/db cannot import from functions",
            },
            {
              from: [
                "./libs/modules/**/*",
                "./libs/adapters/**/*",
                "./libs/db/**/*",
                "./functions/**/*",
              ],
              target: "./libs/utils/**/*",
              message: "Cannot import from utils in these layers",
            },
            {
              target: "./libs/entities/**/*",
              from: [
                "./libs/adapters/**/*",
                "./libs/db/**/*",
                "./functions/**/*",
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
]);

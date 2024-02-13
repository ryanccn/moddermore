import js from "@eslint/js";
import ts from "typescript-eslint";
import unicorn from "eslint-plugin-unicorn";

import globals from "globals";

import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommendedTypeChecked,
  unicorn.configs["flat/recommended"],
  ...compat.extends("plugin:@next/next/recommended"),

  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  {
    rules: {
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-null": "off",
      "unicorn/filename-case": "off",
      "unicorn/no-nested-ternary": "off",
    },
  },

  {
    files: ["**/*.js"],
    ...ts.configs.disableTypeChecked,
  },
);

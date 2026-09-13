import { config } from "@ryanccn/eslint-config";

export default config({
  globals: ["es2024", "node"],
  reactHooks: true,
  next: true,
  rules: {
    "unicorn/prefer-global-this": "off",
    "unicorn/require-module-specifiers": "off",
    "unicorn/max-nested-calls": "off",
    "unicorn/no-non-function-verb-prefix": "off",
    "@next/next/no-img-element": "off",
    "react-hooks/set-state-in-effect": "off",
    "react-hooks/immutability": "off",
  },
});

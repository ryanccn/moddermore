import { config } from "@ryanccn/eslint-config";

export default config({
  globals: ["es2024", "node"],
  reactHooks: true,
  next: true,
  rules: {
    "unicorn/import-style": "off",
    "unicorn/prefer-global-this": "off",
    "unicorn/require-module-specifiers": "off",
    "@next/next/no-img-element": "off",
    "react-hooks/set-state-in-effect": "off",
    "react-hooks/immutability": "off",
  },
});

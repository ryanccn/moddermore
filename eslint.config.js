import { config } from "@ryanccn/eslint-config";

export default config({
  globals: ["es2024", "node"],
  // TODO: figure out why these do not work anymore
  reactHooks: false,
  next: false,
  rules: {
    "unicorn/import-style": "off",
    "unicorn/prefer-global-this": "off",
    "unicorn/require-module-specifiers": "off",
  },
});

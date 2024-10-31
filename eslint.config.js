import { config } from "@ryanccn/eslint-config";

export default config({
  globals: ["es2024", "node"],
  reactHooks: true,
  next: true,
  rules: {
    "unicorn/import-style": "off",
    "unicorn/prefer-global-this": "off",
    "@next/next/no-img-element": "off",
  },
});

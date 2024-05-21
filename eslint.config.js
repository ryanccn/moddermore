import { config } from "@ryanccn/eslint-config";

export default config({
  globals: ["es2021", "node"],
  reactHooks: true,
  next: false, /* this currently doesn't work */
  rules: {
    'unicorn/import-style': 'off',
  },
});

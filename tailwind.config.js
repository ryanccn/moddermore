/* eslint-disable unicorn/prefer-module */
/* eslint-disable @typescript-eslint/no-var-requires */

const defaultTheme = require("tailwindcss/defaultTheme");
const defaultColors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["Satoshi Variable", "Satoshi", defaultTheme.fontFamily.sans],
      },
      colors: {
        tremor: {
          brand: {
            faint: defaultColors.indigo[50],
            muted: defaultColors.indigo[200],
            subtle: defaultColors.indigo[400],
            DEFAULT: defaultColors.indigo[500],
            emphasis: defaultColors.indigo[700],
            inverted: defaultColors.white,
          },
          background: {
            muted: defaultColors.neutral[50],
            subtle: defaultColors.neutral[100],
            DEFAULT: defaultColors.white,
            emphasis: defaultColors.neutral[700],
          },
          border: {
            DEFAULT: defaultColors.neutral[200],
          },
          ring: {
            DEFAULT: defaultColors.neutral[200],
          },
          content: {
            subtle: defaultColors.neutral[400],
            DEFAULT: defaultColors.neutral[500],
            emphasis: defaultColors.neutral[700],
            strong: defaultColors.neutral[900],
            inverted: defaultColors.white,
          },
        },

        "dark-tremor": {
          brand: {
            faint: defaultColors.indigo[950],
            muted: defaultColors.indigo[900],
            subtle: defaultColors.indigo[800],
            DEFAULT: defaultColors.indigo[500],
            emphasis: defaultColors.indigo[400],
            inverted: defaultColors.neutral[950],
          },
          background: {
            muted: defaultColors.neutral[900],
            subtle: defaultColors.neutral[800],
            DEFAULT: defaultColors.neutral[900],
            emphasis: defaultColors.neutral[600],
          },
          border: {
            DEFAULT: defaultColors.neutral[800],
          },
          ring: {
            DEFAULT: defaultColors.neutral[800],
          },
          content: {
            subtle: defaultColors.neutral[700],
            DEFAULT: defaultColors.neutral[600],
            emphasis: defaultColors.neutral[500],
            strong: defaultColors.neutral[400],
            inverted: defaultColors.black,
          },
        },
      },

      boxShadow: {
        "tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "tremor-card": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "tremor-dropdown": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",

        "dark-tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "dark-tremor-card": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "dark-tremor-dropdown": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      },

      borderRadius: {
        "tremor-small": defaultTheme.borderRadius.sm,
        "tremor-default": defaultTheme.borderRadius.DEFAULT,
        "tremor-full": defaultTheme.borderRadius.full,
      },

      fontSize: {
        "tremor-label": defaultTheme.fontSize.xs,
        "tremor-default": defaultTheme.fontSize.sm,
        "tremor-title": defaultTheme.fontSize.xl,
        "tremor-metric": defaultTheme.fontSize["2xl"],
      },
    },
  },
  safelist: [
    {
      pattern:
        /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
  ],
  plugins: [
    require("@tailwindcss/forms")({ strategy: "class" }),
    require("@tailwindcss/typography"),
    require("@headlessui/tailwindcss"),
  ],
};

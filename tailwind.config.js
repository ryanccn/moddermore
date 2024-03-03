/* eslint-disable unicorn/prefer-module */
/* eslint-disable @typescript-eslint/no-var-requires */

import { fontFamily, borderRadius, fontSize } from "tailwindcss/defaultTheme";
import { indigo, white, neutral, black } from "tailwindcss/colors";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", fontFamily.sans],
        display: ["Inter", fontFamily.sans],
      },
      colors: {
        tremor: {
          brand: {
            faint: indigo[50],
            muted: indigo[200],
            subtle: indigo[400],
            DEFAULT: indigo[500],
            emphasis: indigo[700],
            inverted: white,
          },
          background: {
            muted: neutral[50],
            subtle: neutral[100],
            DEFAULT: white,
            emphasis: neutral[700],
          },
          border: {
            DEFAULT: neutral[200],
          },
          ring: {
            DEFAULT: neutral[200],
          },
          content: {
            subtle: neutral[400],
            DEFAULT: neutral[500],
            emphasis: neutral[700],
            strong: neutral[900],
            inverted: white,
          },
        },

        "dark-tremor": {
          brand: {
            faint: indigo[950],
            muted: indigo[900],
            subtle: indigo[800],
            DEFAULT: indigo[500],
            emphasis: indigo[400],
            inverted: neutral[950],
          },
          background: {
            muted: neutral[900],
            subtle: neutral[800],
            DEFAULT: neutral[900],
            emphasis: neutral[600],
          },
          border: {
            DEFAULT: neutral[800],
          },
          ring: {
            DEFAULT: neutral[800],
          },
          content: {
            subtle: neutral[700],
            DEFAULT: neutral[600],
            emphasis: neutral[500],
            strong: neutral[400],
            inverted: black,
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
        "tremor-small": borderRadius.sm,
        "tremor-default": borderRadius.DEFAULT,
        "tremor-full": borderRadius.full,
      },

      fontSize: {
        "tremor-label": fontSize.xs,
        "tremor-default": fontSize.sm,
        "tremor-title": fontSize.xl,
        "tremor-metric": fontSize["2xl"],
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

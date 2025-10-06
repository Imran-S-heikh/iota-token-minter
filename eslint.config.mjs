import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Base configs
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Global ignores
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },

  // 🧠 Custom rule overrides to relax strict TS rules
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js"],
    rules: {
      // allow @ts-ignore and @ts-nocheck
      "@typescript-eslint/ban-ts-comment": "off",

      // allow `any` types
      "@typescript-eslint/no-explicit-any": "off",

      // only warn for unused vars instead of error
      "@typescript-eslint/no-unused-vars": "warn",

      // disable Next.js unused vars (optional)
      "no-unused-vars": "off",
    },
  },

  // 🧱 Optional: completely ignore auto-generated templates or bytecode files
  {
    files: ["lib/move-template/**"],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];

export default eslintConfig;


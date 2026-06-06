import { defineConfig } from "oxlint";

export default defineConfig({
  categories: {
    correctness: "error",
    pedantic: "warn",
    perf: "warn",
    style: "warn",
    suspicious: "warn",
  },
  rules: {
    "func-style": "off",
    "max-statements": ["error", { max: 15 }],
    "no-ternary": "off",
  },
  overrides: [
    {
      files: ["src/**/*.spec.ts"],
      rules: {
        "init-declarations": "off",
        "max-lines-per-function": "off",
        "no-magic-numbers": "off",
      },
    },
  ],
});

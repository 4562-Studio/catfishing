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
    "max-statements": "off",
    "no-ternary": "off",
  },
});

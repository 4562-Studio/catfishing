import { defineConfig } from "oxlint";

export default defineConfig({
  categories: {
    correctness: "error",
    pedantic: "warn",
    perf: "warn",
    style: "warn",
    suspicious: "warn",
  },
});

import js from "@eslint/js";
import next from "@next/eslint-plugin-next";
import prettier from "eslint-plugin-prettier";
import react from "eslint-plugin-react";

export default [
  js.configs.recommended,
  {
    plugins: {
      next,
      prettier,
      react, // ✅ needed for JSX parsing + linting
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true, // ✅ enables JSX parsing
        },
      },
    },
    settings: {
      react: {
        version: "detect", // ✅ auto-detect React version
      },
    },
    rules: {
      "prettier/prettier": "error",
      "react/react-in-jsx-scope": "off",
      "no-unused-vars": "warn",
    },
  },
];

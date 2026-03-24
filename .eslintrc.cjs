module.exports = {
  extends: ["eslint:recommended", "plugin:react/recommended"],
  plugins: ["react-hooks"],
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "no-undef": "off",
    "no-unused-vars": ["error", { "argsIgnorePattern": "^[A-Z_]" }]
  },
  settings: {
    react: {
      version: "detect"
    }
  },
  env: {
    browser: true,
    es2021: true
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  }
};

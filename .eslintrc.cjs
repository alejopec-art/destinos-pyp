module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  settings: {
    react: {
      version: "detect"
    }
  },
  rules: {
    "react/react-in-jsx-scope": "off",
    "no-unused-vars": "off",
    "react/prop-types": "off",
    "no-empty": "off",
    "react-hooks/exhaustive-deps": "off",
    "react/no-unescaped-entities": "off"
  },
  ignorePatterns: [
    "dist",
    "node_modules"
  ]
};

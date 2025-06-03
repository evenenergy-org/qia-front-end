module.exports = {
  extends: [
    "eslint-config-turbo",
    "eslint-config-next",
    "eslint-config-prettier",
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": "warn",
    "react/react-in-jsx-scope": "off",
  },
}; 
module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 13,
    sourceType: "module",
  },
  settings: {
    react: {
      version: "detect"
    }
  },
  plugins: [
    "react",
    "@typescript-eslint",
    "rkfe",
  ],
  rules: {
    // eslint 自定义插件定好的规则
    "rkfe/max-params": "error",
    // 关闭默认 eslint 的 no-unused-vars，打开 tslint 的 no-unused-vars，解决 ts 中枚举的 no-unused-vars 问题
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "error",
    // 允许 ! 非空断言 (obj!.value)
    "@typescript-eslint/no-non-null-assertion": "off",
    // 关闭 eslint 的 no-use-before-define，使用 ts 的
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": "error",
    // "rkfe/no-oss-domain": "error",
    // "rkfe/no-rokid-domain": "error",
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "standard",
    "prettier"
  ],
};

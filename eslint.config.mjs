import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import eslintConfigPrettier from "eslint-config-prettier";

const eslintConfig = [
    {
        ignores: [
            ".next/**",
            "node_modules/**",
            "out/**",
            "build/**",
            ".contentlayer/**",
            "**/*.d.ts",
        ],
    },
    ...nextCoreWebVitals,
    eslintConfigPrettier,
];

export default eslintConfig;

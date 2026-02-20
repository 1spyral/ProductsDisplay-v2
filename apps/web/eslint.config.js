import js from "@eslint/js";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig, globalIgnores } from "eslint/config";

const commonLanguageOptions = {
    ecmaVersion: "latest",
    sourceType: "module",
};

const commonPlugins = {
    import: importPlugin,
    "unused-imports": unusedImports,
};

const commonRules = {
    "import/first": "error",
    "import/newline-after-import": "error",
    "import/no-duplicates": "error",
    "no-console": "off",
    "no-debugger": "error",
};

export default defineConfig([
    ...nextVitals,
    globalIgnores([
        ".next/**",
        "node_modules/**",
        "out/**",
        "build/**",
        ".contentlayer/**",
        "**/*.d.ts",
    ]),
    {
        files: ["**/*.js", "**/*.jsx"],
        extends: [js.configs.recommended],
        languageOptions: commonLanguageOptions,
        plugins: commonPlugins,
        rules: commonRules,
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: commonLanguageOptions,
        plugins: commonPlugins,
        settings: {
            "import/resolver": {
                typescript: {
                    project: "./tsconfig.json",
                },
            },
        },
        rules: {
            ...commonRules,

            // In TS/TSX, TypeScript handles undefined identifiers; ESLint's core rule is noisy.
            "no-undef": "off",

            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    args: "after-used",
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],
        },
    },
    prettier,
]);

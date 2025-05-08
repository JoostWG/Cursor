import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";


export default defineConfig([
    globalIgnores(['dist/*']),
    { files: ["**/*.{js,mjs,cjs,ts}"], plugins: { js }, extends: ["js/recommended"] },
    { files: ["**/*.{js,mjs,cjs,ts}"], languageOptions: { globals: globals.browser } },
    tseslint.configs.recommended,
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: './tsconfig.json', // make sure this path is correct
            },
        },
        rules: {
            '@typescript-eslint/no-floating-promises': ['warn', { ignoreIIFE: true }],
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/prefer-nullish-coalescing': 'warn',
            '@typescript-eslint/member-ordering': 'warn',
            '@typescript-eslint/no-shadow': 'error',
            '@typescript-eslint/no-unsafe-return': 'error',
            // '@typescript-eslint/no-unsafe-type-assertion': 'warn',
            // '@typescript-eslint/strict-boolean-expressions': 'warn',
            // '@typescript-eslint/no-magic-numbers': 'warn',
            // '@typescript-eslint/naming-convention': 'warn',
        },
    },
]);

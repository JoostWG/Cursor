import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
    globalIgnores(['dist/*', 'eslint.config.mjs']),
    { files: ['**/*.{js,mjs,cjs,ts}'], plugins: { js }, ...js.configs.recommended },
    { files: ['**/*.{js,mjs,cjs,ts}'], languageOptions: { globals: globals.browser } },
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
            'prefer-template': 'warn',
            'arrow-body-style': 'warn',
            'object-shorthand': 'warn',
            'no-else-return': 'warn',
            // 'no-await-in-loop': 'warn',
            // 'default-case': 'warn',
            // 'prefer-named-capture-group': 'warn',
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
);

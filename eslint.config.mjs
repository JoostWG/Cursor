import js from '@eslint/js';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default defineConfig(
    globalIgnores(['dist/*', 'eslint.config.mjs', 'prettier.config.js']),
    js.configs.all,
    tseslint.configs.all,
    {
        files: ['**/*.ts'],
        plugins: {
            js,
            prettier: eslintPluginPrettier,
            stylistic,
        },
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: './tsconfig.json', // make sure this path is correct
            },
        },
        rules: {
            'prettier/prettier': 'warn',

            // JS
            'prefer-template': 'warn',
            'arrow-body-style': 'warn',
            'object-shorthand': 'warn',
            'no-else-return': 'warn',
            'no-param-reassign': 'warn',
            'require-unicode-regexp': 'warn',
            'func-style': ['error', 'declaration'],
            'no-console': ['warn', { allow: ['error', 'warn', 'debug', 'info'] }],
            // Below is all disabled
            'default-case': 'off', // I want to enable this but I also don't want to implement default cases will never be used in theory
            'sort-keys': 'off',
            'new-cap': 'off',
            'max-classes-per-file': 'off',
            'sort-imports': 'off',
            'one-var': 'off',
            'id-length': 'off',
            'no-await-in-loop': 'off',
            'prefer-named-capture-group': 'off',
            'no-duplicate-imports': 'off',
            'no-ternary': 'off',
            'no-continue': 'off',
            'max-statements': 'off',
            'camelcase': 'off',
            'no-undefined': 'off',
            'max-lines': 'off',
            'max-lines-per-function': 'off',
            'no-plusplus': 'off',
            'capitalized-comments': 'off',
            'no-nested-ternary': 'off',
            'no-warning-comments': 'off',
            'no-inline-comments': 'off',
            'no-void': 'off',

            // TS
            '@typescript-eslint/no-floating-promises': ['warn', { ignoreIIFE: true }],
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/prefer-nullish-coalescing': 'warn',
            '@typescript-eslint/member-ordering': 'warn',
            '@typescript-eslint/no-shadow': 'error',
            '@typescript-eslint/no-unsafe-return': 'error',
            '@typescript-eslint/naming-convention': [
                'warn',
                { selector: ['typeLike'], format: ['PascalCase'] },
                { selector: ['enumMember'], format: ['PascalCase', 'camelCase'] },
                { selector: ['typeProperty', 'parameterProperty', 'objectLiteralProperty'], format: ['PascalCase', 'camelCase', 'snake_case'] },
                { selector: ['variableLike', 'method', 'property', 'memberLike'], format: ['camelCase'], filter: { regex: '^_$', match: false } },
            ],
            '@typescript-eslint/explicit-member-accessibility': 'error',
            '@typescript-eslint/prefer-regexp-exec': 'warn',
            '@typescript-eslint/prefer-optional-chain': 'warn',
            '@typescript-eslint/no-non-null-assertion': 'error',
            '@typescript-eslint/prefer-readonly': 'warn',
            '@typescript-eslint/no-unsafe-member-access': 'error',
            // Below is all disabled
            '@typescript-eslint/no-unsafe-type-assertion': 'off',
            '@typescript-eslint/non-nullable-type-assertion-style': 'off',
            '@typescript-eslint/strict-boolean-expressions': 'off',
            '@typescript-eslint/no-magic-numbers': 'off',
            '@typescript-eslint/prefer-readonly-parameter-types': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-extraneous-class': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/return-await': 'off',
            '@typescript-eslint/await-thenable': 'off',
            '@typescript-eslint/class-methods-use-this': 'off',
            '@typescript-eslint/await-thenable': 'off',
            '@typescript-eslint/no-misused-promises': 'off',
            '@typescript-eslint/consistent-return': 'off',
            '@typescript-eslint/no-misused-promises': 'off',
            '@typescript-eslint/init-declarations': 'off',
            '@typescript-eslint/require-await': 'off',
            '@typescript-eslint/parameter-properties': 'off',

            // Things prettier doesn' cover
            'stylistic/lines-between-class-members': ['warn', {
                enforce: [
                    { prev: '*', next: 'method', blankLine: 'always' },
                    { prev: 'method', next: '*', blankLine: 'always' },
                    { prev: 'field', next: 'field', blankLine: 'never' },
                ],
            }],
        },
    },
);

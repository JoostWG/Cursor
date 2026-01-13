import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import checkFile from 'eslint-plugin-check-file';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
    globalIgnores(['dist/*', 'eslint.config.mjs', 'eslint-github-actions-formatter.js']),
    js.configs.all,
    tseslint.configs.all,
    {
        files: ['**/*.ts'],
        plugins: {
            js,
            stylistic,
            'check-file': checkFile,
        },
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: './tsconfig.json', // make sure this path is correct
            },
        },
        rules: {
            // 'check-file/filename-naming-convention': [
            //     'error',
            //     { '**/*.ts': '([a-z]([a-z-]+[a-z])?|[A-Z][a-zA-Z]*)(\.d)?\.ts' },
            //     { ignoreMiddleExtensions: true },
            // ],

            // JS
            'prefer-template': 'warn',
            'arrow-body-style': 'warn',
            'object-shorthand': 'warn',
            'no-else-return': 'warn',
            'no-param-reassign': 'warn',
            'require-unicode-regexp': 'warn',
            'func-style': ['error', 'declaration'],
            'no-console': [
                'warn',
                {
                    allow: ['error', 'warn', 'debug', 'info'],
                },
            ],
            'no-duplicate-imports': 'error',
            'max-classes-per-file': 'warn',
            // Below is all disabled


            // TS
            '@typescript-eslint/no-floating-promises': [
                'warn',
                {
                    ignoreIIFE: true,
                },
            ],
            '@typescript-eslint/consistent-type-imports': [
                'error',
                { fixStyle: 'inline-type-imports' },
            ],
            '@typescript-eslint/prefer-nullish-coalescing': 'warn',
            '@typescript-eslint/member-ordering': 'warn',
            '@typescript-eslint/no-shadow': 'error',
            '@typescript-eslint/no-unsafe-return': 'error',
            '@typescript-eslint/naming-convention': [
                'warn',
                { selector: ['typeLike'], format: ['PascalCase'] },
                {
                    selector: ['enumMember'],
                    format: ['PascalCase', 'camelCase'],
                },
                {
                    selector: ['typeProperty', 'parameterProperty', 'objectLiteralProperty'],
                    format: ['PascalCase', 'camelCase', 'snake_case'],
                },
                {
                    selector: ['variableLike', 'method', 'property', 'memberLike'],
                    format: ['camelCase'],
                    filter: { regex: '^_$', match: false },
                },
            ],
            '@typescript-eslint/explicit-member-accessibility': 'error',
            '@typescript-eslint/prefer-optional-chain': 'warn',
            '@typescript-eslint/no-non-null-assertion': 'error',
            '@typescript-eslint/prefer-readonly': 'warn',
            '@typescript-eslint/no-unsafe-member-access': 'error',
            '@typescript-eslint/no-extraneous-class': 'warn',
            '@typescript-eslint/explicit-function-return-type': [
                'error',
                {
                    allowExpressions: true,
                },
            ],
            '@typescript-eslint/method-signature-style': ['error', 'method'],
            '@typescript-eslint/max-params': ['error', { max: 4 }],
            // Below is all disabled

            // Things dprint doesn't cover
            'stylistic/lines-between-class-members': [
                'warn',
                {
                    enforce: [
                        { prev: '*', next: 'method', blankLine: 'always' },
                        { prev: 'method', next: '*', blankLine: 'always' },
                        { prev: 'field', next: 'field', blankLine: 'never' },
                    ],
                },
            ],
            'stylistic/padding-line-between-statements': [
                'warn',
                {
                    blankLine: 'always',
                    prev: '*',
                    next: [
                        'class',
                        'function',
                        'block',
                        'block-like',
                        'multiline-export',
                        'multiline-const',
                        'multiline-let',
                        'multiline-var',
                        'multiline-type',
                        'multiline-expression',
                        'return',
                    ],
                },
                {
                    blankLine: 'always',
                    prev: [
                        'class',
                        'function',
                        'block',
                        'block-like',
                        'multiline-export',
                        'multiline-const',
                        'multiline-let',
                        'multiline-var',
                        'multiline-type',
                        'multiline-expression',
                        'return',
                    ],
                    next: '*',
                },
            ],
        },
    },
);

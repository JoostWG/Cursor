/** @type {import("prettier").Config | import("@trivago/prettier-plugin-sort-imports").PluginConfig} */
export default {
    endOfLine: 'lf',
    semi: true,
    printWidth: 100,
    singleQuote: true,
    quoteProps: 'consistent',
    tabWidth: 4,
    plugins: ['@trivago/prettier-plugin-sort-imports'],
    importOrder: ['<THIRD_PARTY_MODULES>', '^[./]'],
    importOrderSortSpecifiers: true,
};

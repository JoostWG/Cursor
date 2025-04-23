import { Locale, LocalizationMap } from 'discord.js';
import i18next from 'i18next';

export function getTranslations(key: string): LocalizationMap {
    return Object.fromEntries(
        // @ts-expect-error I am too lazy to properly type check this
        i18next.options.preload.map((locale: Locale) => {
            // @ts-expect-error I am too lazy to properly type this
            return [locale, i18next.t(key, { lng: locale })];
        }),
    ) as LocalizationMap;
}

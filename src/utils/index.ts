import type { Locale, LocalizationMap, SharedNameAndDescription } from 'discord.js';
import i18next from 'i18next';
import I18NexFsBackend from 'i18next-fs-backend';

export async function initI18Next() {
    return await i18next.use(I18NexFsBackend).init({
        backend: {
            loadPath: './locales/{{lng}}/{{ns}}.json',
        },
        ns: ['common', 'commands'],
        defaultNS: 'common',
        fallbackLng: 'en-Us',
        preload: ['en-US', 'nl'],
        supportedLngs: ['en-US', 'nl'],
    });
}

export function getTranslations(key: string): LocalizationMap {
    if (i18next.options.preload) {
        return Object.fromEntries(
            (i18next.options.preload as Locale[])
                .map(
                    (locale: Locale) =>
                        [
                            locale,
                            i18next.t(key, {
                                lng: locale,
                                defaultValue: '',
                            }) as string,
                        ] as const,
                )
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .filter(([_, t]) => t !== ''),
        );
    }

    return {};
}

export function localize<T extends SharedNameAndDescription>(
    builder: new () => T,
    name: string,
    key: string,
): T {
    return new builder()
        .setName(name)
        .setNameLocalizations(getTranslations(`commands:${key}.name`))
        .setDescription(
            i18next.t(`commands:${key}.description`, {
                defaultValue: 'KEY_NOT_FOUND',
                lng: 'en-US',
            }),
        )
        .setDescriptionLocalizations(getTranslations(`commands:${key}.description`));
}

export function stringTitle(string: string) {
    return string
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

import { LocalizationMap } from 'discord.js';
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
    return Object.fromEntries(
        i18next.options.preload
            ? i18next.options.preload
                  .map((locale) => {
                      const translation = i18next.t(key, {
                          lng: locale,
                          defaultValue: '!not-found!',
                      });

                      return [locale, translation];
                  })
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  .filter(([_, t]) => t !== '!not-found!')
            : [],
    );
}

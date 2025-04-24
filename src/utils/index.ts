import { LocalizationMap } from 'discord.js';
import i18next from 'i18next';

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

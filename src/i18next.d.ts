import translations from '../locales/en-US/translations.json';
import 'i18next';

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'translations';
        resources: {
            translations: typeof translations;
        };
    }
}

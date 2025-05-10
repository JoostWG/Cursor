import 'i18next';
import type commands from '../../locales/en-US/commands.json';
import type common from '../../locales/en-US/common.json';

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'common';
        resources: {
            commands: typeof commands;
            common: typeof common;
        };
    }
}

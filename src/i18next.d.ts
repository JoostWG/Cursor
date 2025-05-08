import type commands from '../locales/en-US/commands.json';
import type common from '../locales/en-US/common.json';
import 'i18next';

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'common';
        resources: {
            commands: typeof commands;
            common: typeof common;
        };
    }
}

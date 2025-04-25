import commands from '../locales/en-US/commands.json';
import common from '../locales/en-US/common.json';
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

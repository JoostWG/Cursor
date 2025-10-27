import {
    actionRow,
    button,
    container,
    separator,
    stringSelect,
    textDisplay,
} from '@/lib/utils/builders';
import { extractHyperlinks } from '@/modules/urban-dictionary';
import {
    ButtonStyle,
    HeadingLevel,
    heading,
    inlineCode,
    subtext,
    type APIBaseComponent,
    type ComponentType,
} from 'discord.js';
import type { ComponentBuilderOptions } from './types';

export class ComponentBuilder {
    private readonly hyperlinkRegex = /\[([^[\]]+)\]/gmu;

    public build({
        definition,
        history,
        pagination: { currentPage, totalPages },
        active,
    }: ComponentBuilderOptions): APIBaseComponent<ComponentType>[] {
        if (!definition) {
            return [container({ components: [textDisplay({ content: 'Something went wrong!' })] })];
        }

        const hyperlinkTerms = [
            ...extractHyperlinks(definition.definition),
            ...extractHyperlinks(definition.example),
        ];

        return [
            container({
                components: [
                    textDisplay({
                        content: [
                            heading(definition.word),
                            subtext(`By ${definition.author}`),
                            this.transformHyperlinks(definition.definition),
                            heading('Example', HeadingLevel.Three),
                            this.transformHyperlinks(definition.example),
                        ].join('\n'),
                    }),
                    separator({ divider: true }),
                    textDisplay({
                        content: inlineCode(history.map((item) => item.term).join(' > ')),
                    }),
                    actionRow({
                        components: [
                            stringSelect({
                                placeholder: 'Select a term',
                                custom_id: 'select',
                                options: hyperlinkTerms.length
                                    ? hyperlinkTerms.map((term) => ({ label: term, value: term }))
                                    : [{ label: 'null', value: 'null' }],
                                disabled: !hyperlinkTerms.length || !active,
                            }),
                        ],
                    }),
                    actionRow({
                        components: [
                            button({
                                style: ButtonStyle.Danger,
                                label: 'Back',
                                custom_id: 'back',
                                disabled: history.length < 2 || !active,
                            }),
                        ],
                    }),
                    separator({ divider: true }),
                    actionRow({
                        components: [
                            button({
                                style: ButtonStyle.Primary,
                                label: 'Previous',
                                custom_id: 'previous',
                                disabled: currentPage <= 0 || !active,
                            }),
                            button({
                                style: ButtonStyle.Primary,
                                label: 'Next',
                                custom_id: 'next',
                                disabled: currentPage + 1 >= totalPages || !active,
                            }),
                            button({
                                style: ButtonStyle.Link,
                                label: 'Open in browser',
                                url: definition.permalink,
                            }),
                        ],
                    }),
                    textDisplay({
                        content: subtext(`${currentPage + 1}/${totalPages}`),
                    }),
                ],
            }),
        ];
    }

    private transformHyperlinks(text: string): string {
        return text.replace(
            this.hyperlinkRegex,
            (_, term: string) => `[${term}](${this.getWebUrl(term)})`,
        );
    }

    private getWebUrl(term: string): string {
        return `https://urbandictionary.com/define.php?term=${encodeURIComponent(term)}`;
    }
}

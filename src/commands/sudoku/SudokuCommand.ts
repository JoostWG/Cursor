import {
    MessageFlags,
    codeBlock,
    heading,
    type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { SlashCommand } from '../../lib/core';
import type { ChatInputContext } from '../../lib/core/context';
import type { OmitType } from '../../lib/utils';
import { container, stringOption, textDisplay } from '../../lib/utils/builders';
import { Sudoku } from '../../modules/sudoku';

export class SudokuCommand extends SlashCommand {
    public constructor() {
        super();

        this.devOnly = true;
    }

    protected override definition(): OmitType<RESTPostAPIChatInputApplicationCommandsJSONBody> {
        return {
            name: 'sudoku',
            description: 'Solve sudoku',
            options: [
                stringOption({
                    name: 'data',
                    description: 'Data',
                    required: true,
                }),
            ],
        };
    }

    protected override async handle({ interaction }: ChatInputContext): Promise<void> {
        const data = interaction.options.getString('data', true);

        const sudoku = Sudoku.fromString(data);

        const input = sudoku.toString();

        sudoku.solve();

        const output = sudoku.toString();

        await interaction.reply({
            flags: [MessageFlags.IsComponentsV2],
            components: [
                container({
                    components: [
                        textDisplay({ content: heading('Input') }),
                        textDisplay({ content: codeBlock(input) }),
                    ],
                }),
                container({
                    components: [
                        textDisplay({ content: heading('Output') }),
                        textDisplay({ content: codeBlock(output) }),
                    ],
                }),
            ],
        });
    }
}

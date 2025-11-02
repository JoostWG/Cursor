import type {
    APIApplicationCommandStringOption,
    APIApplicationCommandSubcommandOption,
} from 'discord.js';
import { stringOption, subcommand } from '../../lib/utils/builders';

export class F1CommandOptionsBuilder {
    public getOptions(): APIApplicationCommandSubcommandOption[] {
        return [
            this.getCircuitsSubcommand(),
        ];
    }

    private getCircuitsSubcommand(): APIApplicationCommandSubcommandOption {
        return subcommand({
            name: 'circuits',
            description: 'Query circuits',
            options: [
                this.getDriverOption(),
            ],
        });
    }

    private getDriverOption(): APIApplicationCommandStringOption {
        return stringOption({
            name: 'driver',
            description: 'Filter on driver',
            required: false,
        });
    }
}

import type {
    APIApplicationCommandIntegerOption,
    APIApplicationCommandStringOption,
    APIApplicationCommandSubcommandOption,
} from 'discord.js';
import { integerOption, stringOption, subcommand } from '../../lib/utils/builders';

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
                this.getSeasonOption(),
                this.getRoundOption(),
                this.getDriverOption(),
            ],
        });
    }

    private getSeasonOption(required = false): APIApplicationCommandStringOption {
        return stringOption({
            name: 'season',
            description: 'Filter on season',
            required,
        });
    }

    private getRoundOption(required = false): APIApplicationCommandIntegerOption {
        return integerOption({
            name: 'round',
            description: 'Filter on round',
            required,
        });
    }

    private getDriverOption(): APIApplicationCommandStringOption {
        return stringOption({
            name: 'driver',
            description: 'Filter on driver',
            required: false,
            autocomplete: true,
        });
    }
}

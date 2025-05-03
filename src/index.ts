import { discordToken } from '../config.json';
import getCommands from './getCommands';
import { BaseCommand } from './utils/command';
import {
    ClientOptions,
    Collection,
    Client as DiscordJsClient,
    Events,
    GatewayIntentBits,
    MessageFlags,
} from 'discord.js';
import i18next from 'i18next';
import I18NexFsBackend from 'i18next-fs-backend';

export class Client extends DiscordJsClient {
    private commands: Collection<string, BaseCommand>;

    public constructor(options: ClientOptions) {
        super(options);
        this.commands = new Collection();

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.loadCommands();
    }

    private async loadCommands() {
        for await (const command of getCommands()) {
            try {
                this.commands.set(command.data.name, command);
            } catch {
                //
            }
        }
    }

    public getCommand(name: string) {
        return this.commands.get(name);
    }
}

(async () => {
    await i18next.use(I18NexFsBackend).init({
        backend: {
            loadPath: './locales/{{lng}}/{{ns}}.json',
        },
        ns: ['common', 'commands'],
        defaultNS: 'common',
        fallbackLng: 'en-Us',
        preload: ['en-US', 'nl'],
        supportedLngs: ['en-US', 'nl'],
    });

    const client = new Client({
        intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds],
    });

    client.on('ready', async () => {
        console.info('Ready!');
    });

    client.on(Events.InteractionCreate, async (interaction) => {
        if (interaction.isChatInputCommand()) {
            const command = client.getCommand(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content: 'There was an error while executing this command!',
                        flags: MessageFlags.Ephemeral,
                    });
                } else {
                    await interaction.reply({
                        content: 'There was an error while executing this command!',
                        flags: MessageFlags.Ephemeral,
                    });
                }
            }
        } else if (interaction.isAutocomplete()) {
            const command = client.getCommand(interaction.commandName);

            if (!command || !command.autocomplete) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await interaction.respond(await command.autocomplete(interaction));
            } catch (error) {
                console.error(error);
            }
        }
    });

    await client.login(discordToken);
})();

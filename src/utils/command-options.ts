import {
    type APIApplicationCommandAttachmentOption,
    type APIApplicationCommandBooleanOption,
    type APIApplicationCommandChannelOption,
    type APIApplicationCommandIntegerOption,
    type APIApplicationCommandIntegerOptionBase,
    type APIApplicationCommandMentionableOption,
    type APIApplicationCommandNumberOption,
    type APIApplicationCommandNumberOptionBase,
    type APIApplicationCommandRoleOption,
    type APIApplicationCommandStringOption,
    type APIApplicationCommandStringOptionBase,
    type APIApplicationCommandSubcommandGroupOption,
    type APIApplicationCommandSubcommandOption,
    type APIApplicationCommandUserOption,
    ApplicationCommandOptionType,
    type RESTPostAPIApplicationCommandsJSONBody,
} from 'discord.js';

export function applicationCommand(
    data: RESTPostAPIApplicationCommandsJSONBody,
): RESTPostAPIApplicationCommandsJSONBody {
    return {
        ...data,
    };
}

export function subcommand(
    data: OmitType<APIApplicationCommandSubcommandOption>,
): APIApplicationCommandSubcommandOption {
    return {
        type: ApplicationCommandOptionType.Subcommand,
        ...data,
    };
}

export function subcommandGroup(
    data: OmitType<APIApplicationCommandSubcommandGroupOption>,
): APIApplicationCommandSubcommandGroupOption {
    return {
        type: ApplicationCommandOptionType.SubcommandGroup,
        ...data,
    };
}

export function stringOption(
    data: OmitType<APIApplicationCommandStringOption>,
): APIApplicationCommandStringOptionBase {
    return {
        type: ApplicationCommandOptionType.String,
        ...data,
    };
}

export function integerOption(
    data: OmitType<APIApplicationCommandIntegerOption>,
): APIApplicationCommandIntegerOptionBase {
    return {
        type: ApplicationCommandOptionType.Integer,
        ...data,
    };
}

export function booleanOption(
    data: OmitType<APIApplicationCommandBooleanOption>,
): APIApplicationCommandBooleanOption {
    return {
        type: ApplicationCommandOptionType.Boolean,
        ...data,
    };
}

export function userOption(
    data: OmitType<APIApplicationCommandUserOption>,
): APIApplicationCommandUserOption {
    return {
        type: ApplicationCommandOptionType.User,
        ...data,
    };
}

export function channelOption(
    data: OmitType<APIApplicationCommandChannelOption>,
): APIApplicationCommandChannelOption {
    return {
        type: ApplicationCommandOptionType.Channel,
        ...data,
    };
}

export function roleOption(
    data: OmitType<APIApplicationCommandRoleOption>,
): APIApplicationCommandRoleOption {
    return {
        type: ApplicationCommandOptionType.Role,
        ...data,
    };
}

export function mentionableOption(
    data: OmitType<APIApplicationCommandMentionableOption>,
): APIApplicationCommandMentionableOption {
    return {
        type: ApplicationCommandOptionType.Mentionable,
        ...data,
    };
}

export function numberOption(
    data: OmitType<APIApplicationCommandNumberOption>,
): APIApplicationCommandNumberOptionBase {
    return {
        type: ApplicationCommandOptionType.Number,
        ...data,
    };
}

export function attachmentOption(
    data: OmitType<APIApplicationCommandAttachmentOption>,
): APIApplicationCommandAttachmentOption {
    return {
        type: ApplicationCommandOptionType.Attachment,
        ...data,
    };
}

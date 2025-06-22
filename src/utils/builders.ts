import {
    type APIActionRowComponent,
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
    type APIButtonComponentWithCustomId,
    type APIButtonComponentWithSKUId,
    type APIButtonComponentWithURL,
    type APIChannelSelectComponent,
    type APIComponentInActionRow,
    type APIContainerComponent,
    type APIFileComponent,
    type APIMediaGalleryComponent,
    type APIMentionableSelectComponent,
    type APIRoleSelectComponent,
    type APISectionComponent,
    type APISeparatorComponent,
    type APIStringSelectComponent,
    type APITextDisplayComponent,
    type APITextInputComponent,
    type APIThumbnailComponent,
    type APIUserSelectComponent,
    ApplicationCommandOptionType,
    ComponentType,
    type RESTPostAPIApplicationCommandsJSONBody,
} from 'discord.js';

// #region Components
export function actionRow<T extends APIComponentInActionRow>(
    data: OmitType<APIActionRowComponent<T>>,
): APIActionRowComponent<T> {
    return {
        type: ComponentType.ActionRow,
        ...data,
    };
}

/* eslint-disable stylistic/padding-line-between-statements */
export function button(
    data: OmitType<APIButtonComponentWithCustomId>,
): APIButtonComponentWithCustomId;
export function button(data: OmitType<APIButtonComponentWithURL>): APIButtonComponentWithURL;
export function button(data: OmitType<APIButtonComponentWithSKUId>): APIButtonComponentWithSKUId;
export function button(
    data:
        | OmitType<APIButtonComponentWithCustomId>
        | OmitType<APIButtonComponentWithURL>
        | OmitType<APIButtonComponentWithSKUId>,
): APIButtonComponentWithCustomId | APIButtonComponentWithURL | APIButtonComponentWithSKUId {
    return {
        type: ComponentType.Button,
        ...data,
    };
}
/* eslint-enable stylistic/padding-line-between-statements */

export function textInput(data: OmitType<APITextInputComponent>): APITextInputComponent {
    return {
        type: ComponentType.TextInput,
        ...data,
    };
}

export function stringSelect(data: OmitType<APIStringSelectComponent>): APIStringSelectComponent {
    return {
        type: ComponentType.StringSelect,
        ...data,
    };
}

export function userSelect(data: OmitType<APIUserSelectComponent>): APIUserSelectComponent {
    return {
        type: ComponentType.UserSelect,
        ...data,
    };
}

export function roleSelect(data: OmitType<APIRoleSelectComponent>): APIRoleSelectComponent {
    return {
        type: ComponentType.RoleSelect,
        ...data,
    };
}

export function mentionableSelect(
    data: OmitType<APIMentionableSelectComponent>,
): APIMentionableSelectComponent {
    return {
        type: ComponentType.MentionableSelect,
        ...data,
    };
}

export function channelSelect(
    data: OmitType<APIChannelSelectComponent>,
): APIChannelSelectComponent {
    return {
        type: ComponentType.ChannelSelect,
        ...data,
    };
}

export function section(data: OmitType<APISectionComponent>): APISectionComponent {
    return {
        type: ComponentType.Section,
        ...data,
    };
}

export function textDisplay(data: OmitType<APITextDisplayComponent>): APITextDisplayComponent {
    return {
        type: ComponentType.TextDisplay,
        ...data,
    };
}

export function thumbnail(data: OmitType<APIThumbnailComponent>): APIThumbnailComponent {
    return {
        type: ComponentType.Thumbnail,
        ...data,
    };
}

export function mediaGallery(data: OmitType<APIMediaGalleryComponent>): APIMediaGalleryComponent {
    return {
        type: ComponentType.MediaGallery,
        ...data,
    };
}

export function file(data: OmitType<APIFileComponent>): APIFileComponent {
    return {
        type: ComponentType.File,
        ...data,
    };
}

export function separator(data: OmitType<APISeparatorComponent>): APISeparatorComponent {
    return {
        type: ComponentType.Separator,
        ...data,
    };
}

export function container(data: OmitType<APIContainerComponent>): APIContainerComponent {
    return {
        type: ComponentType.Container,
        ...data,
    };
}
// #endregion

// #region App cmd/options
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
// #endregion

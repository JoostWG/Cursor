import {
    type APIActionRowComponent,
    type APIBaseComponent,
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
    ComponentType,
} from 'discord.js';

type OmitType<T extends APIBaseComponent<ComponentType>> = Omit<T, 'type'>;

export function actionRow<T extends APIComponentInActionRow>(
    data: OmitType<APIActionRowComponent<T>>,
): APIActionRowComponent<T> {
    return {
        type: ComponentType.ActionRow,
        ...data,
    };
}

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

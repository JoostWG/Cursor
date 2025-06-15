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

type Data<T extends APIBaseComponent<ComponentType>> = Omit<T, 'type'>;

export function actionRow<T extends APIComponentInActionRow>(
    data: Data<APIActionRowComponent<T>>,
): APIActionRowComponent<T> {
    return {
        type: ComponentType.ActionRow,
        ...data,
    };
}

export function button(data: Data<APIButtonComponentWithCustomId>): APIButtonComponentWithCustomId;
export function button(data: Data<APIButtonComponentWithURL>): APIButtonComponentWithURL;
export function button(data: Data<APIButtonComponentWithSKUId>): APIButtonComponentWithSKUId;
export function button(
    data:
        | Data<APIButtonComponentWithCustomId>
        | Data<APIButtonComponentWithURL>
        | Data<APIButtonComponentWithSKUId>,
): APIButtonComponentWithCustomId | APIButtonComponentWithURL | APIButtonComponentWithSKUId {
    return {
        type: ComponentType.Button,
        ...data,
    };
}

export function textInput(data: Data<APITextInputComponent>): APITextInputComponent {
    return {
        type: ComponentType.TextInput,
        ...data,
    };
}

export function stringSelect(data: Data<APIStringSelectComponent>): APIStringSelectComponent {
    return {
        type: ComponentType.StringSelect,
        ...data,
    };
}

export function userSelect(data: Data<APIUserSelectComponent>): APIUserSelectComponent {
    return {
        type: ComponentType.UserSelect,
        ...data,
    };
}

export function roleSelect(data: Data<APIRoleSelectComponent>): APIRoleSelectComponent {
    return {
        type: ComponentType.RoleSelect,
        ...data,
    };
}

export function mentionableSelect(
    data: Data<APIMentionableSelectComponent>,
): APIMentionableSelectComponent {
    return {
        type: ComponentType.MentionableSelect,
        ...data,
    };
}

export function channelSelect(data: Data<APIChannelSelectComponent>): APIChannelSelectComponent {
    return {
        type: ComponentType.ChannelSelect,
        ...data,
    };
}

export function section(data: Data<APISectionComponent>): APISectionComponent {
    return {
        type: ComponentType.Section,
        ...data,
    };
}

export function textDisplay(data: Data<APITextDisplayComponent>): APITextDisplayComponent {
    return {
        type: ComponentType.TextDisplay,
        ...data,
    };
}

export function thumbnail(data: Data<APIThumbnailComponent>): APIThumbnailComponent {
    return {
        type: ComponentType.Thumbnail,
        ...data,
    };
}

export function mediaGallery(data: Data<APIMediaGalleryComponent>): APIMediaGalleryComponent {
    return {
        type: ComponentType.MediaGallery,
        ...data,
    };
}

export function file(data: Data<APIFileComponent>): APIFileComponent {
    return {
        type: ComponentType.File,
        ...data,
    };
}

export function separator(data: Data<APISeparatorComponent>): APISeparatorComponent {
    return {
        type: ComponentType.Separator,
        ...data,
    };
}

export function container(data: Data<APIContainerComponent>): APIContainerComponent {
    return {
        type: ComponentType.Container,
        ...data,
    };
}

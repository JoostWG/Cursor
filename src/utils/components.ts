export enum ComponentType {
    ActionRow = 1,
    Button = 2,
    StringSelect = 3,
    TextInput = 4,
    UserSelect = 5,
    RoleSelect = 6,
    MentionableSelect = 7,
    ChannelSelect = 8,
    Section = 9,
    TextDisplay = 10,
    Thumbnail = 11,
    MediaGallery = 12,
    File = 13,
    Separator = 14,
    Container = 17,
}

export enum ButtonStyle {
    Primary = 1,
    Secondary = 2,
    Success = 3,
    Danger = 4,
    Link = 5,
    Premium = 6,
}

export enum TextInputStyle {
    Short = 1,
    Paragraph = 2,
}

export interface PartialEmoji {
    animated: boolean;
    id: string | undefined;
    name: string;
}

export interface MediaItem {
    url: string;
}

export interface BaseComponent {
    type: ComponentType;
    id?: string;
}

export interface ActionRowComponent extends BaseComponent {
    type: ComponentType.ActionRow;
    components: AnyButtonComponent[] | [AnySelectComponent];
}

export interface ButtonComponent extends BaseComponent {
    type: ComponentType.Button;
    style: Exclude<ButtonStyle, ButtonStyle.Link | ButtonStyle.Premium>;
    label?: string;
    emoji?: PartialEmoji;
    custom_id: string;
    disabled?: boolean;
}

export interface LinkButtonComponent extends BaseComponent {
    type: ComponentType.Button;
    style: ButtonStyle.Link;
    label?: string;
    emoji?: PartialEmoji;
    url: string;
    disabled?: boolean;
}

export interface PremiumButtonComponent extends BaseComponent {
    type: ComponentType.Button;
    style: ButtonStyle.Premium;
    sku_id: string;
    disabled?: boolean;
}

export type AnyButtonComponent = ButtonComponent | LinkButtonComponent | PremiumButtonComponent;

export interface TextInputComponent extends BaseComponent {
    type: ComponentType.TextInput;
    custom_id: string;
    style: TextInputStyle;
    label: string;
    min_length?: number;
    max_length?: number;
    required?: boolean;
    value?: string;
    placeholder?: string;
}

// Select

export type SelectDefaultValueType = 'user' | 'role' | 'channel';

export interface SelectDefaultValue<T extends SelectDefaultValueType = SelectDefaultValueType> {
    id: string;
    type: T;
}

export interface StringSelectOption {
    label: string;
    value: string;
    description?: string;
    emoji?: PartialEmoji;
    default?: boolean;
}

export interface BaseSelectComponent extends BaseComponent {
    type:
        | ComponentType.StringSelect
        | ComponentType.UserSelect
        | ComponentType.RoleSelect
        | ComponentType.MentionableSelect
        | ComponentType.ChannelSelect;

    custom_id: string;
    placeholder?: string;
    min_values?: number;
    max_values?: number;
    disabled?: boolean;
}

export interface StringSelectComponent extends BaseSelectComponent {
    type: ComponentType.StringSelect;
    options: StringSelectOption[];
}

export interface UserSelectComponent extends BaseSelectComponent {
    type: ComponentType.UserSelect;
    default_values: SelectDefaultValue<'user'>[];
}

export interface RoleSelectComponent extends BaseSelectComponent {
    type: ComponentType.RoleSelect;
    default_values: SelectDefaultValue<'role'>[];
}

export interface MentionableSelectComponent extends BaseSelectComponent {
    type: ComponentType.MentionableSelect;
    default_values: SelectDefaultValue<'user'>[];
}

export interface ChannelSelectComponent extends BaseSelectComponent {
    type: ComponentType.ChannelSelect;
    default_values: SelectDefaultValue<'channel'>[];
}

export type AnySelectComponent =
    | StringSelectComponent
    | UserSelectComponent
    | RoleSelectComponent
    | MentionableSelectComponent
    | ChannelSelectComponent;

export interface SectionComponent extends BaseComponent {
    type: ComponentType.Section;
    components: TextDisplayComponent[];
    accessory: ThumbnailComponent | AnyButtonComponent;
}

export interface TextDisplayComponent extends BaseComponent {
    type: ComponentType.TextDisplay;
    content: string;
}

export interface ThumbnailComponent extends BaseComponent {
    type: ComponentType.Thumbnail;
    media: MediaItem;
    description?: string;
    spoiler?: boolean;
}

export interface MediaGalleryComponent extends BaseComponent {
    type: ComponentType.MediaGallery;
    items: MediaGalleryItem[];
}

export interface MediaGalleryItem {
    media: MediaItem;
    description?: string;
    spoiler?: boolean;
}

export interface FileComponent extends BaseComponent {
    type: ComponentType.File;
    file: MediaItem;
    spoiler?: boolean;
}

export interface SeparatorComponent extends BaseComponent {
    type: ComponentType.Separator;
    divider?: boolean;
    spacing?: 1 | 2;
}

export interface ContainerComponent extends BaseComponent {
    type: ComponentType.Container;
    components: (
        | ActionRowComponent
        | TextDisplayComponent
        | SectionComponent
        | MediaGalleryComponent
        | SeparatorComponent
        | FileComponent
    )[];
    accent_color?: number;
    spoiler?: boolean;
}

export type TopLevelComponent =
    | ActionRowComponent
    | ContainerComponent
    | FileComponent
    | MediaGalleryComponent
    | SectionComponent
    | SeparatorComponent
    | TextDisplayComponent;

type Data<T extends BaseComponent> = Omit<T, 'type'>;

export function actionRow(data: Data<ActionRowComponent>): ActionRowComponent {
    return {
        type: ComponentType.ActionRow,
        ...data,
    };
}
export function button(data: Data<ButtonComponent>): ButtonComponent;
export function button(data: Data<LinkButtonComponent>): LinkButtonComponent;
export function button(data: Data<PremiumButtonComponent>): PremiumButtonComponent;
export function button<T extends AnyButtonComponent>(data: Data<T>): T {
    //@ts-expect-error ugh
    return {
        type: ComponentType.Button,
        ...data,
    };
}

export function textInput(data: Data<TextInputComponent>): TextInputComponent {
    return {
        type: ComponentType.TextInput,
        ...data,
    };
}

export function stringSelect(data: Data<StringSelectComponent>): StringSelectComponent {
    return {
        type: ComponentType.StringSelect,
        ...data,
    };
}

export function userSelect(data: Data<UserSelectComponent>): UserSelectComponent {
    return {
        type: ComponentType.UserSelect,
        ...data,
    };
}

export function roleSelect(data: Data<RoleSelectComponent>): RoleSelectComponent {
    return {
        type: ComponentType.RoleSelect,
        ...data,
    };
}

export function mentionableSelect(
    data: Data<MentionableSelectComponent>,
): MentionableSelectComponent {
    return {
        type: ComponentType.MentionableSelect,
        ...data,
    };
}

export function channelSelect(data: Data<ChannelSelectComponent>): ChannelSelectComponent {
    return {
        type: ComponentType.ChannelSelect,
        ...data,
    };
}

export function section(data: Data<SectionComponent>): SectionComponent {
    return {
        type: ComponentType.Section,
        ...data,
    };
}

export function textDisplay(data: Data<TextDisplayComponent>): TextDisplayComponent {
    return {
        type: ComponentType.TextDisplay,
        ...data,
    };
}

export function thumbnail(data: Data<ThumbnailComponent>): ThumbnailComponent {
    return {
        type: ComponentType.Thumbnail,
        ...data,
    };
}

export function mediaGallery(data: Data<MediaGalleryComponent>): MediaGalleryComponent {
    return {
        type: ComponentType.MediaGallery,
        ...data,
    };
}

export function file(data: Data<FileComponent>): FileComponent {
    return {
        type: ComponentType.File,
        ...data,
    };
}

export function separator(data: Data<SeparatorComponent>): SeparatorComponent {
    return {
        type: ComponentType.Separator,
        ...data,
    };
}

export function container(data: Data<ContainerComponent>): ContainerComponent {
    return {
        type: ComponentType.Container,
        ...data,
    };
}

import axios, { type AxiosInstance } from 'axios';
import {
    AttachmentBuilder,
    ButtonStyle,
    MessageFlags,
    bold,
    type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { CommandError } from '../CommandError';
import { SlashCommand } from '../lib/core';
import type { ChatInputContext } from '../lib/core/context';
import { text, type OmitType } from '../lib/utils';
import {
    actionRow,
    booleanOption,
    button,
    container,
    integerOption,
    mediaGallery,
    textDisplay,
} from '../lib/utils/builders';

interface PicsumDetails {
    id: string;
    author: string;
    width: number;
    height: number;
    url: string;
    download_url: string;
}





type BlurValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

joe mama
    public override devOnly = true;




    
    private readonly api: AxiosInstance;




    
    public constructor() {
        super();

        this.api = axios.create({
            baseURL: 'https://picsum.photos',
        });
    }

    protected override definition(): OmitType<RESTPostAPIChatInputApplicationCommandsJSONBody> {
        return {
            name: 'picsum',
            description: 'Epic imagery',
            options: [
                integerOption({
                    name: 'width',
                    description: 'Image width',
                    required: true,
                }),
                integerOption({
                    name: 'height',
                    description: 'Image height',
                    required: true,
                }),
                integerOption({
                    name: 'id',
                    description: 'Image ID',
                }),

                booleanOption({
                    name: 'grayscale',
                    description: 'Apply grayscale',
                }),
                integerOption({
                    name: 'blur',
                    description: 'Apply blur',
                    choices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => ({
                        name: value.toString(),
                        value,
                    })),
                }),
            ],
        };
    }

    protected override async handle({ interaction }: ChatInputContext): Promise<void> {
        const { buffer, details } = await this.getImage({
            width: interaction.options.getInteger('width', true),
            height: interaction.options.getInteger('height', true),
            id: interaction.options.getInteger('id')?.toString() ?? undefined,
            blur: interaction.options.get('blur') as BlurValue | null ?? undefined,
            grayscale: interaction.options.getBoolean('grayscale') ?? undefined,
            format: 'jpg',
        });

        const file = new AttachmentBuilder(buffer, { name: `${details.id}.jpg` });

        await interaction.reply({
            flags: [MessageFlags.IsComponentsV2],
            files: [file],
            components: [
                container({
                    components: [
                        textDisplay({
                            content: text([
                                `${bold('ID:')} ${details.id}`,
                                `${bold('Author:')} ${details.author}`,
                            ]),
                        }),
                        mediaGallery({
                            items: [{ media: { url: `attachment://${file.name}` } }],
                        }),
                        actionRow({
                            components: [
                                button({
                                    style: ButtonStyle.Link,
                                    label: 'Unsplash',
                                    url: details.url,
                                }),
                                button({
                                    style: ButtonStyle.Link,
                                    label: 'Download original',
                                    url: details.download_url,
                                }),
                            ],
                        }),
                    ],
                }),
            ],
        });
    }

    private async getImage(options: {
        width: number;
        height: number;
        id?: string;
        grayscale?: boolean;
        blur?: BlurValue;
        format?: 'jpg' | 'webp';
    }): Promise<{ buffer: Buffer; details: PicsumDetails }> {
        let path = `/${options.width}/${options.height}.${options.format ?? 'jpg'}`;

        if (options.id) {
            path = `/id/${options.id}${path}`;
        }

        const response = await this.api.get<Buffer>(path, {
            responseType: 'arraybuffer',
            params: {
                grayscale: options.grayscale ? true : undefined,
                blur: options.blur,
            },
        });

        const id = response.headers['picsum-id'];

        if (typeof id !== 'string') {
            throw new CommandError('Invalid ID');
        }

        return {
            buffer: response.data,
            details: await this.getDetails(id),
        };
    }

    private async getDetails(id: string): Promise<PicsumDetails> {
        return await this.api.get<PicsumDetails>(`/id/${id}/info`).then(({ data }) => data);
    }
}

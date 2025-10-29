import type { Selectable } from 'kysely';
import type { TagsTable } from '../../database';

export type TagData = Selectable<TagsTable>;

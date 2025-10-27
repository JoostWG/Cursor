import type { TagsTable } from '@/database';
import type { Selectable } from 'kysely';

export type TagData = Selectable<TagsTable>;

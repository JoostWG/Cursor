import { SchemaModule } from 'kysely';

export abstract class Migration {
    public abstract up(schema: SchemaModule): Promise<void>;
    public abstract down(schema: SchemaModule): Promise<void>;
}

/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Database, NewTag, TagRow, TagUpdate } from '../database';
import { db } from '../db';
import { Snowflake } from 'discord.js';
import { SelectQueryBuilder } from 'kysely';

export class Tag {
    #id: number;
    #guildId: Snowflake;
    #userId: Snowflake;
    #name: string;
    #content: string;
    #uses: number;
    #createdAt: Date;

    protected constructor(row: TagRow) {
        this.#id = row.id;
        this.#guildId = row.guild_id;
        this.#userId = row.user_id;
        this.#name = row.name;
        this.#content = row.content;
        this.#uses = row.uses;
        this.#createdAt = row.created_at;
    }

    private updateProperties(data: TagUpdate) {
        this.#name = data.name ?? this.#name;
        this.#content = data.content ?? this.#content;
        this.#uses = data.uses ?? this.#uses;
    }

    public get id() {
        return this.#id;
    }

    public get guildId() {
        return this.#guildId;
    }

    public get userId() {
        return this.#userId;
    }

    public get name() {
        return this.#name;
    }

    public get content() {
        return this.#content;
    }

    public get uses() {
        return this.#uses;
    }

    public get createdAt() {
        return this.#createdAt;
    }

    public async update(data: TagUpdate) {
        await db.updateTable('tags').where('id', '=', this.id).set(data).execute();
        this.updateProperties(data);
    }

    public async delete() {
        await db.deleteFrom('tags').where('id', '=', this.id).execute();
    }

    public static async select(
        callback: (
            query: SelectQueryBuilder<Database, 'tags', {}>,
        ) => SelectQueryBuilder<Database, 'tags', {}>,
    ) {
        const rows = await callback(db.selectFrom('tags')).selectAll().execute();

        return rows.map((row) => new this(row));
    }

    public static async selectOne(
        callback: (
            query: SelectQueryBuilder<Database, 'tags', {}>,
        ) => SelectQueryBuilder<Database, 'tags', {}>,
    ) {
        const row = await callback(db.selectFrom('tags')).selectAll().executeTakeFirst();

        if (!row) {
            return null;
        }

        return new this(row);
    }

    public static async find(id: number) {
        return this.selectOne((query) => query.where('id', '=', id));
    }

    public static async create(data: NewTag) {
        const result = await db.insertInto('tags').values(data).executeTakeFirst();

        if (!result.insertId) {
            return;
        }

        return await this.find(result.insertId as unknown as number);
    }
}

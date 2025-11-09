import type { User } from 'discord.js';
import { sql } from 'kysely';
import type { CursorDatabase } from '../database';

export class EconomyService {
    public constructor(private readonly db: CursorDatabase) {
        //
    }

    public async getBalance(user: User): Promise<number> {
        const record = await this.db.selectFrom('balances')
            .select('balance')
            .where('user_id', '=', user.id)
            .executeTakeFirst();

        return record?.balance ?? 0;
    }

    public async setBalance(user: User, balance: number): Promise<void> {
        const updateResult = await this.db.updateTable('balances')
            .where('user_id', '=', user.id)
            .set({ balance })
            .executeTakeFirst();

        if (updateResult.numUpdatedRows === 0n) {
            await this.createBalanceRecord(user, balance);
        }
    }

    public async addBalance(user: User, amount: number): Promise<void> {
        const updateResult = await this.db.updateTable('balances')
            .where('user_id', '=', user.id)
            .set({ balance: sql`balance + ${amount}` })
            .executeTakeFirst();

        if (updateResult.numUpdatedRows === 0n) {
            await this.createBalanceRecord(user, amount);
        }
    }

    private async createBalanceRecord(user: User, balance = 0): Promise<void> {
        await this.db.insertInto('balances')
            .values({ user_id: user.id, balance })
            .execute();
    }
}

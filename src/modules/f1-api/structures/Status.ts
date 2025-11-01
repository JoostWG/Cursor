import type { Api, StatusApiData } from '../http';
import { Model } from './Model';

export class Status extends Model<StatusApiData> {
    public readonly id: number;
    public readonly count: number;
    public readonly name: string;

    public constructor(data: StatusApiData, api: Api) {
        super(data, api);

        this.id = Number(data.statusId);
        this.count = Number(data.count);
        this.name = data.status;
    }
}

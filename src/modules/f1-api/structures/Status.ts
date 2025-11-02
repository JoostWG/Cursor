import type { StatusType } from '../enums';
import type { Api, StatusApiData } from '../http';
import { Structure } from './Structure';

export class Status extends Structure<StatusApiData> {
    public readonly id: StatusType;
    public readonly count: number;
    public readonly name: string;

    public constructor(data: StatusApiData, api: Api) {
        super(data, api);

        this.id = data.statusId;
        this.count = Number(data.count);
        this.name = data.status;
    }

    public override toString(): string {
        return this.name;
    }
}

import type { StatusType } from '../enums';
import type { Api, StatusApiData } from '../http';
import type { StatusJson } from '../types';
import { Structure } from './Structure';

export class Status extends Structure<StatusJson> {
    public readonly id: StatusType;
    public readonly count: number;
    public readonly name: string;

    public constructor(data: StatusApiData, api: Api) {
        super(api);

        this.id = data.statusId;
        this.count = Number(data.count);
        this.name = data.status;
    }

    public override toString(): string {
        return this.name;
    }

    public override toJson(): StatusJson {
        return {
            id: this.id,
            count: this.count,
            name: this.name,
        };
    }
}

import type { Api, DriverApiData } from '../http';
import type { DriverJson } from '../types';
import { Structure } from './Structure';

export class Driver extends Structure<DriverJson> {
    public readonly id: string;
    public readonly url: string;
    public readonly firstName: string;
    public readonly lastName: string;
    public readonly dateOfBirth: Date;
    public readonly nationality: string;
    public readonly number: number | null;
    public readonly code: string | null;

    public constructor(data: DriverApiData, api: Api) {
        super(api);

        this.id = data.driverId;
        this.url = data.url;
        this.firstName = data.givenName;
        this.lastName = data.familyName;
        this.dateOfBirth = new Date(data.dateOfBirth);
        this.nationality = data.nationality;
        this.number = data.permanentNUmber !== undefined ? Number(data.permanentNUmber) : null;
        this.code = data.code ?? null;
    }

    public get name(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    public override toString(): string {
        return this.name;
    }

    public override toJson(): DriverJson {
        return {
            id: this.id,
            url: this.url,
            firstName: this.firstName,
            lastName: this.lastName,
            dateOfBirth: this.dateOfBirth.toString(),
            nationality: this.nationality,
            number: this.number,
            code: this.code,
        };
    }
}
